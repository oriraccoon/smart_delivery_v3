import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import XlsxPopulate from "xlsx-populate";

interface ProductMapping {
  rawName: string;
  mappedName: string;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DEFAULT_TXT_PATH = path.join(process.cwd(), "품목리스트.txt");
const ADDED_TXT_PATH = path.join(process.cwd(), "품목리스트_추가.txt");

// 품목리스트_추가.txt 파싱 헬퍼 함수 (없거나 비어있으면 품목리스트.txt에서 복사하여 초기 생성)
function readMappingsFromFile(): ProductMapping[] {
  try {
    if (!fs.existsSync(ADDED_TXT_PATH) || fs.readFileSync(ADDED_TXT_PATH, "utf-8").trim().length === 0) {
      if (fs.existsSync(DEFAULT_TXT_PATH)) {
        fs.copyFileSync(DEFAULT_TXT_PATH, ADDED_TXT_PATH);
      } else {
        fs.writeFileSync(ADDED_TXT_PATH, "", "utf-8");
      }
    }
    const content = fs.readFileSync(ADDED_TXT_PATH, "utf-8");
    const lines = content.split(/\r?\n/);
    const mappings: ProductMapping[] = [];

    // 정규식: '대치대상' : '대치어' 형태 추출
    const regex = /'([^']*)'\s*:\s*'([^']*)'/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const match = trimmed.match(regex);
      if (match) {
        mappings.push({
          rawName: match[1],
          mappedName: match[2],
        });
      }
    }
    return mappings;
  } catch (error) {
    console.error("파일 읽기/파싱 오류:", error);
    return [];
  }
}

// 품목리스트_추가.txt 전체 쓰기 헬퍼 함수
function writeMappingsToFile(mappings: ProductMapping[]) {
  try {
    const lines = mappings.map((m) => `'${m.rawName}' : '${m.mappedName}',`);
    // 마지막에 빈 줄 하나 추가되도록 함
    fs.writeFileSync(ADDED_TXT_PATH, lines.join("\n") + "\n", "utf-8");
  } catch (error) {
    console.error("파일 쓰기 오류:", error);
  }
}

// 1. 대치 규칙 목록 조회 API
app.get("/api/mappings", (req, res) => {
  const mappings = readMappingsFromFile();
  res.json({ success: true, mappings });
});

// 2. 단일 대치 규칙 추가 API (최하단 추가)
app.post("/api/mappings/add", (req, res) => {
  const { rawName, mappedName } = req.body;
  if (!rawName || !mappedName) {
    return res.status(400).json({ success: false, message: "잘못된 입력값입니다." });
  }

  try {
    const currentMappings = readMappingsFromFile();
    const exists = currentMappings.some((m) => m.rawName === rawName);
    if (exists) {
      return res.status(400).json({ success: false, message: "이미 존재하는 대치 대상 품목명입니다." });
    }

    // 파일 끝에 추가
    const lineToWrite = `'${rawName}' : '${mappedName}',\n`;
    fs.appendFileSync(ADDED_TXT_PATH, lineToWrite, "utf-8");

    res.json({ success: true });
  } catch (error) {
    console.error("규칙 추가 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류로 인해 규칙 추가에 실패했습니다." });
  }
});

// 3. 대치 규칙 목록 동기화 API (삭제, 전체 덮어쓰기 등)
app.post("/api/mappings/sync", (req, res) => {
  const { mappings } = req.body;
  if (!Array.isArray(mappings)) {
    return res.status(400).json({ success: false, message: "잘못된 데이터 형식입니다." });
  }

  try {
    writeMappingsToFile(mappings);
    res.json({ success: true });
  } catch (error) {
    console.error("규칙 동기화 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류로 인해 규칙 저장에 실패했습니다." });
  }
});

// 4. 대치 규칙 초기화 API (품목리스트.txt 내용을 품목리스트_추가.txt로 덮어쓰기)
app.post("/api/mappings/reset", (req, res) => {
  try {
    if (fs.existsSync(DEFAULT_TXT_PATH)) {
      fs.copyFileSync(DEFAULT_TXT_PATH, ADDED_TXT_PATH);
    } else {
      fs.writeFileSync(ADDED_TXT_PATH, "", "utf-8");
    }
    const mappings = readMappingsFromFile();
    res.json({ success: true, mappings });
  } catch (error) {
    console.error("규칙 초기화 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류로 인해 규칙 초기화에 실패했습니다." });
  }
});

// 5. 비밀번호 걸린 엑셀 복호화 및 데이터 추출 API
app.post("/api/decrypt-excel", async (req, res) => {
  const { fileData, password } = req.body;
  if (!fileData) {
    return res.status(400).json({ success: false, message: "파일 데이터가 없습니다." });
  }

  try {
    const buffer = Buffer.from(fileData, "base64");
    // xlsx-populate로 암호 해제 시도
    const workbook = await XlsxPopulate.fromDataAsync(buffer, { password });
    
    // 암호가 풀린 표준 .xlsx 바이너리 버퍼 생성
    const decryptedBuffer = await workbook.outputAsync();

    res.json({ 
      success: true, 
      decryptedData: decryptedBuffer.toString("base64") 
    });
  } catch (error: any) {
    console.error("엑셀 암호 복호화 오류:", error);
    const errMsg = error.message || "";
    // 상세한 에러 메시지를 제공하여 비밀번호 오류 또는 포맷 오류 원인을 파악할 수 있도록 함
    if (
      errMsg.toLowerCase().includes("password") || 
      errMsg.toLowerCase().includes("decrypt") || 
      errMsg.toLowerCase().includes("invalid") || 
      errMsg.toLowerCase().includes("code") ||
      errMsg.toLowerCase().includes("wrong")
    ) {
      return res.status(400).json({ 
        success: false, 
        message: `비밀번호가 일치하지 않거나 지원하지 않는 암호화 포맷입니다.\n(상세 오류: ${errMsg})` 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: `엑셀 복호화 처리 중 오류가 발생했습니다.\n(상세 오류: ${errMsg})` 
    });
  }
});

// Vite 및 정적 파일 서버 연동
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
