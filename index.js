const { BrowserWindow, app, ipcMain } = require("electron");
const updater = require("electron-simple-updater");
const Store = require("./store");

const store = new Store();
let currentWindow = null;

function createApplicationWindow() {
  const win = new BrowserWindow({
    height: 600,
    width: 800
  });

  win.on("closed", () => {
    currentWindow = null;
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

  win.on("closed", () => {
    currentWindow = null;
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
    url: "http://10.0.2.120:8080/updates.json"
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
  console.log({ error });
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

  console.log("Downloaded!");

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
