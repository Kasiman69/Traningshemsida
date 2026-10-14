const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

function openExternal(url) {
  try {
    if (new URL(url).protocol === "https:") void shell.openExternal(url);
  } catch {}
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 400,
    minHeight: 600,
    title: "Pöhner Training",
    backgroundColor: "#fff1f7",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    openExternal(url);
  });
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  void window.loadFile(path.join(__dirname, "../desktop-dist/index.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
