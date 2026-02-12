/**
 * Header.tsx
 *
 * This file defines the `Header` component -- a small, presentational piece
 * of UI that sits at the top of the dashboard. It displays the application
 * name ("mini-tsenta AI") and a short subtitle explaining the app's purpose
 * ("Automated WorkAtAStartup Applier").
 *
 * How it fits into the app:
 * -  The Header is rendered inside the main dashboard layout. It is purely
 *    visual (no state, no side-effects, no event handlers). It simply shows
 *    branding / title text so the user knows what application they are using.
 */

/**
 * Import the `JSX` namespace from the React library.
 *
 * `JSX` is a TypeScript type namespace that contains the `JSX.Element` type.
 * We use `JSX.Element` as the return type of our component so TypeScript
 * knows this function always returns valid JSX (never null or undefined).
 *
 * Note: We do NOT import `React` itself here because modern React (v17+)
 * with the new JSX transform does not require `React` to be in scope to
 * write JSX.
 */
import { JSX } from 'react'

/**
 * `Header` is a React function component.
 *
 * The `export` keyword in front of `function` means this component can be
 * imported directly by name in other files:
 *     `import { Header } from './Header'`
 * This is called a "named export" (as opposed to a "default export").
 *
 * The return type `: JSX.Element` tells TypeScript that the function will
 * always return a piece of React JSX, which is helpful for catching bugs
 * at compile time.
 *
 * This component takes NO props (no parameters) -- it is entirely static.
 */
export function Header(): JSX.Element {
  /**
   * The `return` block contains all the JSX that will be rendered to the
   * browser DOM when this component is used.
   */
  return (
    /**
     * `<header>` is a semantic HTML5 element that represents introductory
     * content -- typically a group of navigational or heading elements.
     * Using `<header>` instead of a plain `<div>` improves accessibility
     * because screen readers and search engines understand its role.
     */
    <header>
      {/**
       * `<h1>` is the top-level heading HTML element.  There should typically
       * be only one `<h1>` per logical section.
       *
       * Tailwind CSS classes applied:
       *   - `text-xl`   : Sets the font size to "extra-large" (1.25rem / 20px
       *                    by default). Tailwind uses a size scale where `xs`
       *                    is smallest and `9xl` is largest.
       *   - `font-bold` : Sets the font weight to 700, making the text bold.
       *
       * The text "mini-tsenta AI" is the application's display name.
       */}
      <h1 className="text-xl font-bold">mini-tsenta AI</h1>
      {/**
       * `<p>` is a paragraph element used here as a subtitle / tagline.
       *
       * Tailwind CSS classes applied:
       *   - `text-sm`              : Sets the font size to "small" (0.875rem
       *                              / 14px by default), making it visually
       *                              subordinate to the `<h1>` above.
       *   - `text-muted-foreground`: A custom theme color defined in the
       *                              project's Tailwind / shadcn/ui config.
       *                              It produces a softer, gray-ish text
       *                              color so the subtitle doesn't compete
       *                              with the main heading for attention.
       *
       * The text explains the app's purpose at a glance.
       */}
      <p className="text-sm text-muted-foreground">Automated WorkAtAStartup Applier</p>
    </header>
  )
}
