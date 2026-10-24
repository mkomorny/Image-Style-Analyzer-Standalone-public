const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.ELECTRON_PORT || '3847';
const isDev = !app.isPackaged;

let mainWindow = null;
let serverProcess = null;

function getAppRoot() {
  return isDev ? path.join(__dirname, '..') : app.getAppPath();
}

function getWindowIcon() {
  const appRoot = getAppRoot();
  const candidates = [
    path.join(appRoot, 'build', 'icon.png'),
    path.join(appRoot, 'build', 'icon.ico'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return undefined;
}

function getServerAppRoot() {
  if (isDev) {
    return path.join(__dirname, '..');
  }

  return path.join(process.resourcesPath, 'app.asar.unpacked');
}

function getServerCwd() {
  return isDev ? getServerAppRoot() : process.resourcesPath;
}

function getServerPath() {
  const serverRoot = getServerAppRoot();
  return path.join(serverRoot, 'dist', 'server.cjs');
}

function ensureUserEnv() {
  const userData = app.getPath('userData');
  const envDest = path.join(userData, '.env');
  const appRoot = getAppRoot();

  if (fs.existsSync(envDest)) return envDest;

  const candidates = [
    path.join(appRoot, '.env'),
    path.join(appRoot, '.env.example'),
  ];

  for (const source of candidates) {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, envDest);
      return envDest;
    }
  }

  fs.writeFileSync(
    envDest,
    [
      'XAI_API_KEY=',
      `PORT=${PORT}`,
      'EXPORT_OUTPUT_DIR=C:\\Users\\<you>\\Documents\\Mirror\\My Apps\\Image Style Analyzer\\Image Style Analyzer OUTPUTS',
      'EXPORT_MASTER_FILE=Image Style Analyzer - All Exports.txt',
      '',
    ].join('\n'),
    'utf8',
  );

  return envDest;
}

function waitForServer(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      req.on('error', retry);

      function retry() {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Server did not start at ${url}`));
          return;
        }
        setTimeout(check, 300);
      }
    };

    check();
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverRoot = getServerAppRoot();
    const serverPath = getServerPath();
    const userData = app.getPath('userData');

    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server bundle not found: ${serverPath}. Run "npm run build" first.`));
      return;
    }

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: getServerCwd(),
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        NODE_ENV: 'production',
        PORT: String(PORT),
        APP_ROOT: serverRoot,
        ELECTRON_USER_DATA: userData,
      },
      stdio: 'pipe',
      windowsHide: true,
    });

    serverProcess.stdout?.on('data', (chunk) => {
      process.stdout.write(`[server] ${chunk}`);
    });

    serverProcess.stderr?.on('data', (chunk) => {
      process.stderr.write(`[server] ${chunk}`);
    });

    serverProcess.on('error', reject);
    serverProcess.on('exit', (code) => {
      if (code && code !== 0) {
        console.error(`[electron] Server exited with code ${code}`);
      }
    });

    waitForServer(`http://127.0.0.1:${PORT}`)
      .then(resolve)
      .catch(reject);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'Image Style Analyzer',
    icon: getWindowIcon(),
    autoHideMenuBar: true,
    backgroundColor: '#050507',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
}

function stopServer() {
  if (!serverProcess) return;
  serverProcess.kill();
  serverProcess = null;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    ensureUserEnv();

    try {
      await startServer();
      await createWindow();
    } catch (err) {
      console.error('[electron] Failed to start:', err);
      app.quit();
    }
  });

  app.on('before-quit', stopServer);

  app.on('window-all-closed', () => {
    stopServer();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      try {
        if (!serverProcess) await startServer();
        await createWindow();
      } catch (err) {
        console.error('[electron] Failed to reopen window:', err);
      }
    }
  });
}