const { contextBridge } = require('electron');

// Expose only what the renderer needs via contextBridge
// (keeping nodeIntegration OFF for security)
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});
