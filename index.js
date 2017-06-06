const { BrowserWindow, Tray, app, ipcMain } = require("electron");
const path = require("path");
const updater = require("electron-simple-updater");
const Store = require("./store");

const store = new Store();

let canQuit = false;
let currentWindow = null;
let quitting = false;
let tray = null;

function createApplicationWindow() {
  const win = new BrowserWindow({
    height: 600,
    width: 800
  });

  win.on("closed", () => {
    currentWindow = null;
  });

  win.on("close", () => {
    if (quitting) return;

    event.preventDefault();

    tray = new Tray();

    tray.setToolTip("Dabble");

    tray.on("click", () => {
      win.show();
      tray = null;
    });

    win.on("show", () => {
      console.log("Show!");
      tray = null;
    });

    win.hide();
  });

  win.loadURL(`file://${__dirname}/app/index.html`);

  return win;
}

function createLoginWindow() {
  const win = new BrowserWindow({
    center: true,
    height: 480,
    resizable: false,
    useContentSize: true,
    width: 1000
  });

  function displayTray() {
    tray = new Tray(path.join(__dirname, "icon.png"));
    tray.setToolTip("Dabble");
    tray.on("click", () => win.show());
  }

  win.on("closed", () => {
    currentWindow = null;
  });

  win.on("close", event => {
    if (quitting) return;
    event.preventDefault();
    if (process.platform === "win32") displayTray();
    win.hide();
  });

  win.on("show", () => {
    if (tray === null) return;
    tray.destroy();
    tray = null;
  });

  win.loadURL(`file://${__dirname}/login/index.html`);

  return win;
}

app.on("ready", () => {
  const token = store.get("token");
  const user = store.get("user");

  currentWindow = token && user
    ? createApplicationWindow()
    : createLoginWindow();

  updater.init({
    autoDownload: false,
    checkUpdateOnStart: false,
    url: "https://dabblereleases.s3.amazonaws.com/updates.json"
  });
});

let checkingForUpdate = false;
let downloadingUpdate = false;
let updateAvailable = null;
let updateDownloaded = false;

updater.on("checking-for-update", () => {
  checkingForUpdate = true;
});

updater.on("error", error => {
  checkingForUpdate = false;
  downloadingUpdate = false;

  currentWindow.webContents.send("update-error");
});

updater.on("update-available", meta => {
  checkingForUpdate = false;
  updateAvailable = meta;

  currentWindow.webContents.send(
    "update-available",
    updateAvailable,
    updateDownloaded
  );
});

updater.on("update-downloaded", meta => {
  downloadingUpdate = false;
  updateDownloaded = true;

  currentWindow.webContents.send("update-downloaded");
});

updater.on("update-downloading", meta => {
  downloadingUpdate = true;
  currentWindow.webContents.send("update-downloading");
});

updater.on("update-not-available", () => {
  checkingForUpdate = false;
  updateAvailable = false;

  currentWindow.webContents.send("update-not-available");
});

ipcMain.on("check-for-update", event => {
  if (checkingForUpdate) return;

  if (updateAvailable !== null) {
    return currentWindow.webContents.send("update-available", updateAvailable);
  }

  updater.checkForUpdates();
});

ipcMain.on("download-update", () => {
  if (downloadingUpdate || updateDownloaded) return;
  updater.downloadUpdate();
});

ipcMain.on("install-update", () => {
  if (!updateDownloaded) return;
  canQuit = true;
  quitting = true;
  updater.quitAndInstall();
});

ipcMain.on("login", (event, data) => {
  store.initialize(data);
  currentWindow.close();
  currentWindow = createApplicationWindow();
});

ipcMain.on("logout", event => {
  store.clear();
  applicationWondow.close();
  currentWindow = createLoginWindow();
});

app.on("activate", () => {
  if (currentWindow) {
    currentWindow.show();
  }

  if (tray) {
    tray.destroy();
    tray = null;
  }
});

app.on("before-quit", event => {
  if (canQuit) return;
  event.preventDefault();
  currentWindow.webContents.send("before-quit-callback");
  quitting = true;
});

ipcMain.on("quit", (event, message) => {
  canQuit = true;
  app.quit();
});
