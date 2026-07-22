const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    title: '스마트운송장프로그램',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 백엔드 Express 서버(dist/server.cjs) 실행
  const serverPath = path.join(__dirname, 'dist', 'server.cjs');
  serverProcess = fork(serverPath, [], {
    env: { ...process.env, PORT: '3000', NODE_ENV: 'production' }
  });

  // 서버 부팅 후 접속
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1200);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
