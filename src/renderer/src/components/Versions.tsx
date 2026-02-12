/**
 * Versions.tsx
 *
 * This file defines the `Versions` component. Its sole purpose is to display
 * the version numbers of Electron, Chromium, and Node.js that the desktop
 * application is currently running on.
 *
 * How it fits into the app:
 * -  This is a small, informational UI element typically shown somewhere in
 *    the app (e.g. a footer or "About" section) so developers or users can
 *    quickly see which runtime versions are in use. Because this is an
 *    Electron app, the renderer process (the browser-like window) has access
 *    to `window.electron.process.versions`, which provides these numbers.
 */

/**
 * Import `useState` from the React library.
 *
 * `useState` is a React "hook" -- a special function that lets a component
 * remember a piece of data (called "state") between renders.  Here we use it
 * to store the version strings once when the component first mounts.
 *
 * Why import it?  Without `useState` we have no built-in way to hold onto
 * data inside a function component.
 */
import { useState } from 'react'

/**
 * `Versions` is a React function component.
 *
 * A function component is simply a JavaScript/TypeScript function that
 * returns JSX (HTML-like syntax that React turns into real DOM elements).
 *
 * The return type `React.JSX.Element` tells TypeScript that this function
 * will always return a valid piece of React JSX -- never `null` or
 * `undefined`.
 */
function Versions(): React.JSX.Element {
  /**
   * `useState(window.electron.process.versions)` does two things:
   *
   * 1. On the very first render it reads `window.electron.process.versions`,
   *    which is an object like `{ electron: "28.0.0", chrome: "120.0.0",
   *    node: "18.18.0" }`.  This object is provided by Electron's preload
   *    script so the renderer process can inspect runtime version info.
   *
   * 2. It returns a two-element array:
   *      - `versions`  -- the current state value (the versions object).
   *      - A setter function (omitted here with `[versions]` destructuring)
   *        that would let us update the state later.  We never need to update
   *        it, so we intentionally skip capturing the setter.
   *
   * Because the versions never change while the app is running, this state
   * is effectively a constant.
   */
  const [versions] = useState(window.electron.process.versions)

  /**
   * The `return` statement contains JSX -- React's syntax for describing UI.
   * Everything inside the parentheses `(...)` will be rendered to the screen.
   */
  return (
    /**
     * `<ul>` is an "unordered list" HTML element.
     *
     * `className="versions"` assigns the CSS class `versions` to this `<ul>`.
     * In React, we write `className` instead of the plain HTML `class`
     * attribute because `class` is a reserved keyword in JavaScript.
     */
    <ul className="versions">
      {/**
       * Each `<li>` is a "list item" inside the unordered list.
       *
       * `className="electron-version"` gives this item its own CSS class so
       * it can be styled independently.
       *
       * `Electron v{versions.electron}` outputs text like "Electron v28.0.0".
       * The curly braces `{}` let us embed JavaScript expressions inside JSX.
       * `versions.electron` reads the `electron` property from the versions
       * object we stored in state above.
       */}
      <li className="electron-version">Electron v{versions.electron}</li>
      {/**
       * Same pattern as above but for the Chromium browser engine version.
       * Electron bundles its own copy of Chromium, so this shows which
       * Chromium build the app is using (e.g. "Chromium v120.0.0").
       */}
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      {/**
       * Same pattern for Node.js.  Electron also embeds a Node.js runtime,
       * and `versions.node` tells us its version (e.g. "Node v18.18.0").
       */}
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

/**
 * `export default Versions` makes the `Versions` component available to
 * other files in the project.
 *
 * `default` means that when another file writes
 *     `import Versions from './Versions'`
 * it automatically gets this component without needing curly braces.
 *
 * This is the standard pattern for exporting a single component per file.
 */
export default Versions
