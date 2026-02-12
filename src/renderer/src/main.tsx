// =====================================================================================
// FILE: src/renderer/src/main.tsx
// PURPOSE: This is the ENTRY POINT for the React application (the renderer/UI side).
//          It bootstraps (starts up) React and mounts the App component into the DOM.
//
// HOW REACT BOOTSTRAPPING WORKS (for beginners):
//   1. The HTML file (index.html) has an empty <div id="root">
//   2. This file finds that div element in the DOM
//   3. It creates a React "root" attached to that div
//   4. It renders the <App /> component inside the root
//   5. React takes over — any changes to state/props will automatically update the DOM
//
// WHAT IS StrictMode? (for beginners):
//   StrictMode is a React development tool that helps find potential problems in your code.
//   It does things like running effects twice (to catch bugs) and warning about deprecated APIs.
//   It ONLY activates in development mode — it has no effect in production builds.
// =====================================================================================

// Import the main CSS file which includes Tailwind CSS setup and custom theme variables.
// This must be imported before any components so that styles are available when they render.
import './assets/main.css'

// Import StrictMode from React — a development-only wrapper that highlights potential issues.
import { StrictMode } from 'react'

// Import createRoot from React DOM — this is the modern way to initialize a React app (React 18+).
// The older method was ReactDOM.render(), but createRoot enables concurrent features.
import { createRoot } from 'react-dom/client'

// Import the main App component — the root component of our entire React application.
// All other components (Header, ProfileEditView, ActivityLog, etc.) are nested inside App.
import App from './App'

// =====================================================================================
// REACT APPLICATION MOUNT
// =====================================================================================
// document.getElementById('root') finds the <div id="root"> element in index.html.
// The '!' (non-null assertion operator) tells TypeScript: "I'm sure this element exists,
// don't worry about it being null." If the element didn't exist, this would crash at runtime.
//
// createRoot() creates a React root container attached to that DOM element.
// .render() tells React to render the component tree starting from <App /> into that container.
//
// <StrictMode> wraps the entire app in React's strict mode for development-time checks.
// <App /> is the root component that contains the entire application UI.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
