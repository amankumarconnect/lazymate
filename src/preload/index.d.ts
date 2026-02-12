// =====================================================================================
// FILE: src/preload/index.d.ts
// PURPOSE: TypeScript DECLARATION FILE that tells the React (renderer) code what types
//          are available on the global `window` object. Without this file, TypeScript
//          would complain that `window.api` and `window.electron` don't exist.
//
// WHAT IS A .d.ts FILE? (for beginners):
//   A ".d.ts" file is a TypeScript "declaration" file — it only contains TYPE information,
//   not actual code. It tells TypeScript: "trust me, these types exist at runtime."
//   It's like a restaurant menu (describes what's available) vs. the actual food (the code).
//
// WHY IS "declare global" NEEDED?
//   The `window` object in a browser has built-in types (Window interface). To ADD new
//   properties to it (like window.api), we need to "extend" the Window interface.
//   `declare global` lets us modify global TypeScript types from within a module file.
//
// HOW THIS CONNECTS TO THE PRELOAD:
//   The preload script (src/preload/index.ts) uses contextBridge.exposeInMainWorld('api', {...})
//   to add the `api` property to `window`. This declaration file just tells TypeScript
//   about the TYPES of those properties so the renderer code gets autocomplete and type checking.
// =====================================================================================

// Import the ElectronAPI type from the electron-toolkit preload library.
// This type defines the shape of window.electron (Electron's built-in APIs exposed to the renderer).
import { ElectronAPI } from '@electron-toolkit/preload'

// "declare global" extends the global TypeScript scope — this lets us add types
// to the built-in Window interface that exists in all browser/Electron environments.
declare global {
  // Extend the built-in Window interface to include our custom properties.
  // Now TypeScript knows that window.electron and window.api exist and what types they have.
  interface Window {
    // window.electron: provides access to Electron's built-in renderer APIs
    // (like process.versions for getting Electron/Chrome/Node version numbers).
    // This is automatically set up by @electron-toolkit/preload.
    electron: ElectronAPI

    // window.api: our custom API bridge created by the preload script.
    // These are the functions that the React UI uses to communicate with the main process.
    api: {
      // Start the automation loop. Takes user profile data and returns a Promise.
      startAutomation: (data: { userProfile: string }) => Promise<void>

      // Stop the automation and quit the app. Returns void (fire-and-forget).
      stopAutomation: () => void

      // Upload and process a resume PDF. Returns true on success.
      saveResume: (buffer: ArrayBuffer) => Promise<boolean>

      // Download the saved resume via a native "Save As" dialog.
      downloadResume: () => Promise<void>

      // Register a callback to receive real-time log messages from the automation.
      // Returns a cleanup function to remove the listener when no longer needed.
      onLog: (callback: (msg: unknown) => void) => () => void

      // Check if the user has already uploaded a resume.
      // Returns { hasResume: boolean } or null if no profile exists.
      getUserProfile: () => Promise<{ hasResume: boolean } | null>
    }
  }
}
