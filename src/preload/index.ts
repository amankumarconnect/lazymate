// =====================================================================================
// FILE: src/preload/index.ts
// PURPOSE: This is the PRELOAD SCRIPT — a special Electron file that acts as a secure
//          bridge between the MAIN process (Node.js backend) and the RENDERER process
//          (React UI in the browser window).
//
// WHY IS THIS NEEDED? (for beginners):
//   In Electron, the renderer process (your React app) runs in a browser-like environment
//   and should NOT have direct access to Node.js APIs for security reasons. But the React UI
//   needs to communicate with the main process (to start/stop automation, upload resumes, etc.).
//
//   The preload script solves this by using Electron's "contextBridge" to create a safe,
//   controlled set of functions that the React code CAN call. These functions internally
//   use ipcRenderer to send messages to the main process.
//
//   Think of it like a receptionist at a secure office building:
//   - The React UI (visitor) can't walk into the server room (main process) directly
//   - Instead, the preload (receptionist) takes the request and passes it along safely
//
// HOW contextBridge WORKS:
//   contextBridge.exposeInMainWorld('api', { ... }) creates a global object called
//   window.api in the React code. The React code can then call window.api.startAutomation(),
//   window.api.saveResume(), etc. These calls are forwarded to the main process via IPC.
// =====================================================================================

// Import Electron's IPC (Inter-Process Communication) modules:
// - contextBridge: creates a safe bridge to expose selected functions to the renderer
// - ipcRenderer: sends messages TO the main process and listens for messages FROM it
import { contextBridge, ipcRenderer } from 'electron'

// =====================================================================================
// TYPE DEFINITION: LogEntry
// PURPOSE: Defines the shape of a log message sent from the main process to the renderer.
//          Used for type safety — ensures the log handler receives correctly-shaped data.
// =====================================================================================
interface LogEntry {
  message: string // The log message text (e.g., "Found 5 new companies.")
  type: 'info' | 'success' | 'error' | 'skip' | 'match' // The category (affects styling in the UI)
  jobTitle?: string // Optional: the job title associated with this log (e.g., "Frontend Engineer")
  matchScore?: number // Optional: the AI similarity score (0-100) for display in the UI
}

// =====================================================================================
// CONTEXT BRIDGE: Expose the 'api' object to the renderer process (React UI)
// =====================================================================================
// This creates window.api in the React code with the following methods.
// Each method maps to a specific IPC channel that the main process listens on.
//
// There are two types of IPC calls used here:
//   1. ipcRenderer.invoke('channel', data) — used for request/response patterns.
//      Returns a Promise that resolves with the main process's return value.
//      Used when we need a response (e.g., saving a resume and waiting for success/failure).
//
//   2. ipcRenderer.send('channel') — used for fire-and-forget messages.
//      Does NOT return a value. Used when we just need to notify the main process
//      (e.g., "stop the automation" — we don't need a response).
// =====================================================================================
contextBridge.exposeInMainWorld('api', {
  // startAutomation: triggers the job application automation loop in the main process.
  // Takes a data object with the user profile string and returns a Promise (via invoke).
  // The main process handler is: ipcMain.handle('start-automation', ...)
  startAutomation: (data: { userProfile: string }) => ipcRenderer.invoke('start-automation', data),

  // stopAutomation: sends a one-way message to stop the automation and quit the app.
  // Uses .send() (fire-and-forget) because we don't need a return value.
  // The main process handler is: ipcMain.on('stop-automation', ...)
  stopAutomation: () => ipcRenderer.send('stop-automation'),

  // pauseAutomation: sends a one-way message to pause the automation loop.
  // The automation will wait at the next pause checkpoint until resumed.
  // The main process handler is: ipcMain.on('pause-automation', ...)
  pauseAutomation: () => ipcRenderer.send('pause-automation'),

  // resumeAutomation: sends a one-way message to resume a paused automation loop.
  // The main process handler is: ipcMain.on('resume-automation', ...)
  resumeAutomation: () => ipcRenderer.send('resume-automation'),

  // saveResume: sends the resume PDF file bytes to the main process for processing.
  // The main process will: save the PDF → extract text → generate persona → create embedding.
  // Returns a Promise<boolean> — true on success, throws on failure.
  // The main process handler is: ipcMain.handle('save-resume', ...)
  saveResume: (buffer: ArrayBuffer) => ipcRenderer.invoke('save-resume', buffer),

  // downloadResume: triggers the main process to open a "Save As" dialog and save the resume.
  // Returns a Promise that resolves when the dialog is closed.
  // The main process handler is: ipcMain.handle('download-resume', ...)
  downloadResume: () => ipcRenderer.invoke('download-resume'),

  // onLog: registers a callback function that will be called every time the main process
  // sends a log message. This is how the automation's progress is streamed to the React UI.
  //
  // HOW IT WORKS:
  //   1. The React UI calls window.api.onLog((msg) => { /* update UI with msg */ })
  //   2. This registers an ipcRenderer.on('log', handler) listener
  //   3. When the main process calls mainWindow.webContents.send('log', data), the handler fires
  //   4. The callback receives the log entry data and the React UI updates
  //
  // RETURNS: a cleanup function that removes the listener (called when the React component unmounts)
  //          This prevents memory leaks from accumulating listeners.
  onLog: (callback: (msg: LogEntry) => void) => {
    // Create a wrapper handler that strips the IPC event object ('_' parameter, which we don't need)
    // and passes only the log message data to the callback
    const handler = (_: unknown, msg: LogEntry): void => callback(msg)
    // Register the handler to listen for 'log' events from the main process
    ipcRenderer.on('log', handler)
    // Return a cleanup function that removes this specific listener.
    // The React UI should call this cleanup function when the component unmounts
    // (typically in a useEffect cleanup return).
    return () => {
      ipcRenderer.removeListener('log', handler)
    }
  },

  // getUserProfile: requests the current user profile status from the main process.
  // Returns a Promise that resolves with { hasResume: boolean } or null.
  // Used by the React UI on startup to check if a resume has been uploaded.
  // The main process handler is: ipcMain.handle('get-user-profile', ...)
  getUserProfile: () => ipcRenderer.invoke('get-user-profile')
})
