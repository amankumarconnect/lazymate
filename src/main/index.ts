import { app, shell, BrowserWindow, ipcMain, WebContentsView, BaseWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { chromium } from 'playwright-core'

app.commandLine.appendSwitch('remote-debugging-port', '9222')

let mainWindow: BrowserWindow | null = null
let automationView: WebContentsView | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    initAutomationView()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function initAutomationView(): void {
  if (!mainWindow) return
  if (automationView) {
    return
  }
  automationView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })
  mainWindow.contentView.addChildView(automationView)
  updateViewBounds()

  const readyHtml = `
    data:text/html;charset=utf-8,
    <html>
      <body style="background-color: #18181b; color: #a1a1aa; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; margin: 0;">
        <div style="text-align: center;">
          <h1 style="margin: 0;">🤖 Automation Ready</h1>
          <p style="font-size: 14px;">Waiting for script...</p>
        </div>
      </body>
    </html>
  `
  automationView.webContents.loadURL(readyHtml)
}

function updateViewBounds(): void {
  if (mainWindow && automationView) {
    const bounds = mainWindow.getBounds()
    const contentBounds = mainWindow.getContentBounds()
    const leftSidebarWidth = 400
    automationView.setBounds({
      x: leftSidebarWidth,
      y: 0,
      width: contentBounds.width - leftSidebarWidth,
      height: contentBounds.height
    })
  }
}

ipcMain.handle('run-automation', async (_event, { url, script }) => {
  try {
    if (!automationView) throw new Error('Automation view not ready')
    const browser = await chromium.connectOverCDP('http://localhost:9222')
    await automationView.webContents.loadURL(url)
    const context = browser.contexts()[0]
    const pages = context.pages()
    const targetPage =
      pages.find((p) => p.url() === automationView?.webContents.getURL()) || pages[pages.length - 1]
    if (!targetPage) throw new Error('Could not connect to embedded browser')

    const runUserScript = new Function(
      'page',
      `return (async () => {
      try{
        ${script}
      } catch(e) { throw e}
    })()`
    )

    await runUserScript(targetPage)

    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: error.message }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
