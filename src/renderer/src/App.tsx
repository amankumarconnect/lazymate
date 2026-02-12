// =====================================================================================
// FILE: src/renderer/src/App.tsx
// PURPOSE: This is the ROOT COMPONENT of the React application — the "top-level" component
//          that everything else is nested inside. It manages the overall application state
//          and renders the correct UI based on that state.
//
// WHAT THIS COMPONENT DOES:
//   - Manages global state: whether a resume is uploaded, whether automation is running/paused,
//     whether we're in edit mode, and the log of automation activity
//   - On startup, checks if the user has already uploaded a resume (from a previous session)
//   - Listens for real-time log messages from the main process (automation progress)
//   - Renders one of three views depending on state:
//     1. "Loading profile..." (while checking for saved profile on startup)
//     2. ProfileEditView (for uploading/replacing a resume)
//     3. ProfileReadView (for starting/pausing automation, downloading resume)
//   - Always renders the ActivityLog at the bottom (shows automation progress)
//
// COMPONENT HIERARCHY (for beginners):
//   App (this file)
//   ├── Header                   — app title and subtitle
//   ├── ProfileEditView          — resume upload form (shown when in edit mode)
//   │   OR ProfileReadView       — resume status + start/pause buttons (shown when not in edit mode)
//   └── ActivityLog              — scrollable list of automation log entries
// =====================================================================================

// Import React hooks:
// - useState: creates state variables that trigger re-renders when updated
// - useEffect: runs side effects (API calls, event listeners) after component renders
// - JSX: TypeScript type for JSX elements (what a component returns)
import { useState, useEffect, JSX } from 'react'

// Import the child components that make up the UI:
// - Header: the app title bar at the top
// - ActivityLog: the scrollable log of automation activity
// - LogEntry: the TypeScript type for a single log entry object
// - ProfileEditView: the view shown when uploading/replacing a resume
// - ProfileReadView: the view shown when a resume is loaded (start/pause/download)
import { Header } from './components/dashboard/Header'
import { ActivityLog, LogEntry } from './components/dashboard/ActivityLog'
import { ProfileEditView } from './components/dashboard/ProfileEditView'
import { ProfileReadView } from './components/dashboard/ProfileReadView'

// =====================================================================================
// COMPONENT: App
// PURPOSE: The root component that manages all application state and renders the UI.
// RETURNS: JSX.Element — the rendered React element tree
// =====================================================================================
function App(): JSX.Element {
  // =====================================================================================
  // STATE VARIABLES (managed by React's useState hook)
  // =====================================================================================
  // Each useState call creates a [value, setter] pair. When the setter is called,
  // React re-renders the component with the new value.

  // hasResume: whether the user has successfully uploaded a resume.
  // Used to determine which view to show and whether the "Start" button is enabled.
  const [hasResume, setHasResume] = useState(false)

  // logs: an array of log entries from the automation. Each entry has a message, type,
  // optional job title, optional match score, and a timestamp.
  // Displayed in the ActivityLog component at the bottom of the sidebar.
  const [logs, setLogs] = useState<LogEntry[]>([])

  // isRunning: whether the automation is currently active (started and not stopped).
  // Used to disable certain UI elements while automation is running.
  const [isRunning, setIsRunning] = useState(false)

  // isPaused: whether the automation is currently paused (running but waiting).
  // Controls whether the pause/resume button shows "Pause" or "Continue".
  const [isPaused, setIsPaused] = useState(false)

  // isParsing: whether a resume is currently being processed (uploaded → parsed → embedded).
  // Used to show a loading state on the upload button while the PDF is being processed.
  const [isParsing, setIsParsing] = useState(false)

  // isLoading: whether we're still loading the user profile from disk on startup.
  // Shows a "Loading profile..." message while we check for a saved profile.
  const [isLoading, setIsLoading] = useState(true)

  // editMode: whether the UI is showing the resume upload form (true) or the
  // resume status + start/pause controls (false). Starts as false; set to true
  // if no resume is found on startup, or when the user clicks "Replace".
  const [editMode, setEditMode] = useState(false)

  // =====================================================================================
  // HELPER FUNCTION: addLog
  // PURPOSE: Adds a new log entry to the logs array with an automatic timestamp.
  // PARAMETERS:
  //   - entry: a log entry object WITHOUT the timestamp field
  //     (Omit<LogEntry, 'timestamp'> means "a LogEntry but without the timestamp property")
  // The function creates a new array by spreading the previous logs and appending the new entry.
  // =====================================================================================
  const addLog = (entry: Omit<LogEntry, 'timestamp'>): void => {
    // setLogs uses the "functional update" pattern: (prev) => newValue
    // This ensures we always work with the latest state, even in async scenarios.
    // The spread operator (...prev) copies all existing logs, then we add the new entry
    // with a fresh timestamp at the end.
    setLogs((prev) => [...prev, { ...entry, timestamp: new Date() }])
  }

  // =====================================================================================
  // EFFECT: Load saved profile on startup
  // PURPOSE: When the app first renders, check if the user has a saved profile (from a
  //          previous session). If they do, show the "ready" view. If not, show the
  //          upload form.
  // The empty dependency array [] means this effect runs ONCE when the component first mounts.
  // =====================================================================================
  useEffect(() => {
    // Define an async function inside the effect (useEffect callbacks can't be async directly)
    const loadProfile = async (): Promise<void> => {
      try {
        // Call the main process via the preload bridge to get the user profile status.
        // @ts-ignore is used because TypeScript's type inference for window.api is imperfect
        // (the types are defined in the .d.ts file but sometimes don't resolve cleanly).
        // @ts-ignore
        const savedProfile = await window.api.getUserProfile()
        // If a profile exists AND it has a resume, mark the resume as uploaded
        if (savedProfile && savedProfile.hasResume) {
          setHasResume(true)
        } else {
          // No saved profile found — show the upload form
          setEditMode(true)
        }
      } catch (error) {
        // If loading fails (corrupted data, IPC error, etc.), log the error
        // and show the upload form as a fallback
        console.error('Failed to load profile:', error)
        setEditMode(true)
      } finally {
        // Whether loading succeeded or failed, we're done loading — hide the loading message
        setIsLoading(false)
      }
    }
    // Execute the async function
    loadProfile()
  }, []) // Empty array = run only on mount (component's first render)

  // =====================================================================================
  // EFFECT: Listen for log messages from the main process
  // PURPOSE: Registers a listener that receives real-time log messages from the automation
  //          running in the main process. Each message is added to the logs state array.
  // The empty dependency array [] means this listener is set up ONCE on mount.
  // The returned cleanup function removes the listener when the component unmounts.
  // =====================================================================================
  useEffect(() => {
    // Register a callback with the main process that will be called for every log event.
    // window.api.onLog() returns a cleanup function that we store in 'cleanup'.
    // @ts-ignore
    const cleanup = window.api.onLog((msg: LogEntry) => {
      // When a log message arrives from the main process, add it to the logs array
      // with a new Date() timestamp (the main process doesn't send timestamps)
      setLogs((prev) => [...prev, { ...msg, timestamp: new Date() }])
    })
    // Return the cleanup function — React will call this when the component unmounts
    // (or before the effect re-runs, if the dependency array had values).
    // This removes the IPC listener and prevents memory leaks.
    return cleanup
  }, []) // Empty array = set up listener once on mount

  // =====================================================================================
  // HANDLER: handleStart
  // PURPOSE: Called when the user clicks the "Start Applying" button.
  //          Updates the local UI state and sends a message to the main process
  //          to begin the automation loop.
  // =====================================================================================
  const handleStart = (): void => {
    // Update UI state to reflect that automation is now running
    setIsRunning(true)
    setIsPaused(false)
    // Send the IPC message to the main process to start the automation
    // @ts-ignore
    window.api.startAutomation()
  }

  // =====================================================================================
  // HANDLER: handleFileUpload
  // PURPOSE: Called when the user selects a PDF file to upload as their resume.
  //          Reads the file, sends it to the main process for processing
  //          (parse PDF → extract text → generate persona → create embedding),
  //          and updates the UI state based on the result.
  // PARAMETERS:
  //   - file: a File object from the browser's file input (the selected PDF)
  // =====================================================================================
  const handleFileUpload = async (file: File): Promise<void> => {
    // Show the "Parsing..." loading state on the upload button
    setIsParsing(true)
    // Add a log entry to show the upload is starting
    addLog({ message: 'Uploading resume...', type: 'info' })

    try {
      // Read the entire PDF file into memory as an ArrayBuffer (raw binary data).
      // file.arrayBuffer() is a browser API that reads a File object's contents.
      const buffer = await file.arrayBuffer()
      // Send the file bytes to the main process for processing.
      // The main process will: save the PDF → extract text → generate AI persona → create embedding.
      // This call returns a Promise that resolves when processing is complete.
      // @ts-ignore
      await window.api.saveResume(buffer)
      // Mark that we now have a resume uploaded
      setHasResume(true)
      // Add a success log entry
      addLog({ message: 'Resume uploaded and parsed!', type: 'success' })
      // Switch from edit mode (upload form) to read mode (start/pause controls)
      setEditMode(false)
    } catch (error) {
      // If anything goes wrong (file read error, PDF parse failure, AI error, etc.),
      // log the error and show an error message in the activity log
      console.error(error)
      addLog({ message: 'Error parsing resume', type: 'error' })
    } finally {
      // Whether success or failure, clear the parsing/loading state
      setIsParsing(false)
    }
  }

  // =====================================================================================
  // HANDLER: handleTogglePause
  // PURPOSE: Called when the user clicks the "Pause" or "Continue" button.
  //          Toggles the automation between paused and running states.
  //          Sends the appropriate IPC message to the main process.
  // =====================================================================================
  const handleTogglePause = (): void => {
    if (isPaused) {
      // Currently paused → resume the automation
      // @ts-ignore
      window.api.resumeAutomation()
      setIsPaused(false)
    } else {
      // Currently running → pause the automation
      // @ts-ignore
      window.api.pauseAutomation()
      setIsPaused(true)
    }
  }

  // =====================================================================================
  // RENDER: The component's JSX output (what gets displayed on screen)
  // =====================================================================================
  return (
    // Width matches the sidebar constant in main/index.ts createWindow()
    // This outer div is the sidebar container:
    // - h-screen: full viewport height
    // - w-[450px]: exactly 450 pixels wide (matches the sidebarWidth in main/index.ts)
    // - bg-background: uses the theme's background color
    // - border-r: right border (separates sidebar from BrowserView)
    // - flex flex-col: vertical flexbox layout (children stack top to bottom)
    <div className="h-screen w-[450px] bg-background border-r flex flex-col">
      {/* Inner wrapper with padding, spacing, and flex layout for the content area */}
      {/* - p-4: 16px padding on all sides */}
      {/* - space-y-4: 16px vertical gap between children */}
      {/* - flex-1: take up all remaining vertical space */}
      {/* - overflow-hidden: prevent content from overflowing outside the container */}
      {/* - flex flex-col: stack children vertically */}
      <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* The header component — always shown at the top with the app name and description */}
        <Header />

        {/* CONDITIONAL RENDERING: show one of three views based on the current state */}
        {isLoading ? (
          // STATE 1: Still loading the saved profile from disk — show a loading message
          <div className="text-center text-sm text-muted-foreground">Loading profile...</div>
        ) : editMode ? (
          // STATE 2: Edit mode — show the resume upload form
          <ProfileEditView
            hasResume={hasResume} // Whether they already have a resume (changes title to "Replace")
            onCancel={hasResume ? () => setEditMode(false) : undefined} // Cancel only if they already have a resume
            onFileUpload={handleFileUpload} // Callback when a file is selected
            isParsing={isParsing} // Whether the resume is currently being processed
            isRunning={isRunning} // Whether automation is running (disables upload during automation)
          />
        ) : (
          // STATE 3: Read mode — show resume status, download button, and start/pause controls
          <ProfileReadView
            hasResume={hasResume} // Whether a resume is uploaded
            onEdit={() => setEditMode(true)} // Switch to edit mode when "Replace" is clicked
            isRunning={isRunning} // Whether automation is currently running
            isPaused={isPaused} // Whether automation is currently paused
            onStart={handleStart} // Callback when "Start Applying" is clicked
            onTogglePause={handleTogglePause} // Callback when "Pause"/"Continue" is clicked
          />
        )}

        {/* The activity log — always shown at the bottom, displays automation progress */}
        {/* Takes up remaining vertical space (flex-1 in the ActivityLog component) */}
        <ActivityLog logs={logs} />
      </div>
    </div>
  )
}

// Export the App component as the default export so it can be imported in main.tsx
export default App
