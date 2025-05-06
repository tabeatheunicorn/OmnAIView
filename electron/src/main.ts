import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from "path";
import { omnaiscopeBackendManager } from './omnaiBackend';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {

  const indexPath: string = path.join(__dirname, "..", "res", "angular", "browser", "index.csr.html");

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });
  mainWindow.loadFile(indexPath).catch(err => console.error("Fehler beim Laden der HTML-Datei:", err));
  const mainWindow2 = new BrowserWindow({
    height: 800,
    width: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });
  mainWindow2.loadFile(indexPath).catch(err => console.error("Fehler beim Laden der HTML-Datei:", err));
};


omnaiscopeBackendManager.startBackend();

ipcMain.handle('get-omnaiscope-backend-port', async () => {
  return omnaiscopeBackendManager.getPort();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


app.on("window-all-closed", () => {

  omnaiscopeBackendManager.stopBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
