const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

app.setName('DealFlow');

if (process.platform === 'darwin') {
  app.setAboutPanelOptions({
    applicationName: 'DealFlow',
    applicationVersion: '0.1.0',
    version: 'Build 1024',
    copyright: '© 2026 DealFlow Inc.',
    credits: 'LMA Hackathon Team',
    iconPath: path.join(__dirname, '../logo/logo.png')
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // 1. Create the Splash Window
  const splashWindow = new BrowserWindow({
      width: 500,
      height: 300,
      transparent: false,
      frame: false,
      alwaysOnTop: true,
      backgroundColor: '#0f172a',
      icon: path.join(__dirname, '../logo/logo.png'),
      webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
      }
  });
  
  splashWindow.loadFile(path.join(__dirname, 'loading.html'));
  splashWindow.center();

  // 2. Create the Main Window (Hidden initially)
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // Don't show until loaded
    backgroundColor: '#0f172a',
    title: 'DealFlow | Intelligent Deal Room',
    icon: path.join(__dirname, '../logo/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
  });

  if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(__dirname, '../logo/logo.png'));
  }

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 3. Switch when ready
  mainWindow.once('ready-to-show', () => {
     // Optional: Wait a tiny bit (e.g. 1.5s) so the user sees the branding
     setTimeout(() => {
        splashWindow.destroy();
        mainWindow.show();
     }, 1500);
  });
};

// Custom Menu Template for Mac
const createMenu = () => {
    const isMac = process.platform === 'darwin';
    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: 'DealFlow', // This label is ignored by macOS in dev (packaged apps use Info.plist) but good to have
            submenu: [
                { label: 'About DealFlow', role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                { role: 'close' }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        // { role: 'viewMenu' }
        {
           label: 'View',
           submenu: [
              { role: 'reload' },
              { role: 'forceReload' },
              { role: 'toggleDevTools' },
              { type: 'separator' },
              { role: 'resetZoom' },
              { role: 'zoomIn' },
              { role: 'zoomOut' },
              { type: 'separator' },
              { role: 'togglefullscreen' }
           ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
