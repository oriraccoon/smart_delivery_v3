const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: '스마트운송장프로그램',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 빌드된 index.html 파일 로드
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});