const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    title: 'வெண்முரசு',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#fdf8f0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true,
  });

  if (isDev) {
    // In dev, load from Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load from built dist
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadURL(pathToFileURL(indexPath).toString());
  }

  // Open external links in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
