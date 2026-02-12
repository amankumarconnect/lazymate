/**
 * ProfileReadView.tsx
 *
 * This file defines the `ProfileReadView` component -- the "read mode" view
 * of the user's profile / resume section on the dashboard. It shows:
 *   1. Whether a resume has been uploaded or not.
 *   2. A button to switch to the edit view ("Replace" or "Upload").
 *   3. A "Download Resume" button (only when a resume exists).
 *   4. Action buttons to start, pause, or continue the automation.
 *
 * How it fits into the app:
 * -  The dashboard toggles between `ProfileReadView` (this file) and
 *    `ProfileEditView` depending on whether the user is actively uploading
 *    a resume.  This component is what the user sees most of the time --
 *    it is the "home base" of the profile section.
 */

/**
 * Import the `JSX` type namespace from React.
 *
 * We only need the `JSX.Element` type here (for the component return type).
 * No hooks are imported because this component has no internal state and no
 * side-effects -- all data comes from its props.
 */
import { JSX } from 'react'

/**
 * Import the shared `Button` component from the UI library (shadcn/ui).
 *
 * `Button` supports multiple visual variants (e.g. "default", "outline",
 * "ghost", "secondary") and sizes ("sm", "default", "lg").  We use several
 * of these variants in the JSX below.
 */
import { Button } from '../ui/button'

/**
 * Import Card-related UI primitives from shadcn/ui.
 *
 * - `Card`        : Outer bordered container.
 * - `CardContent` : Body area of the card.
 * - `CardHeader`  : Top section with the title.
 * - `CardTitle`   : A styled heading inside `CardHeader`.
 */
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

/**
 * Import the `Download` icon from the `lucide-react` icon library.
 *
 * Lucide is an open-source icon set.  Each icon is a React component that
 * renders an inline SVG.  Here we use the download icon next to the
 * "Download Resume" button text.
 */
import { Download } from 'lucide-react'

/**
 * `ProfileReadViewProps` is a TypeScript interface that defines every prop
 * this component expects to receive from its parent.
 */
interface ProfileReadViewProps {
  /**
   * `hasResume` -- `true` when the user has already uploaded a resume,
   * `false` otherwise.  Controls which messages and buttons are displayed.
   */
  hasResume: boolean

  /**
   * `onEdit` -- a callback the parent provides. Called when the user clicks
   * "Replace" or "Upload" to switch to the ProfileEditView.
   */
  onEdit: () => void

  /**
   * `isRunning` -- `true` while the automation loop is actively running.
   * Controls whether we show "Start Applying" or the pause/continue toggle.
   */
  isRunning: boolean

  /**
   * `isPaused` -- `true` when the automation has been temporarily paused
   * by the user.  Determines the label and style of the toggle button.
   */
  isPaused: boolean

  /**
   * `onStart` -- a callback to begin the automation process.  Called when
   * the user clicks the "Start Applying" button.
   */
  onStart: () => void

  /**
   * `onTogglePause` -- a callback to pause or resume the automation.
   * Called when the user clicks "Pause Applying" or "Continue Applying".
   */
  onTogglePause: () => void
}

/**
 * `ProfileReadView` is the main exported component.
 *
 * It destructures all six props from the `ProfileReadViewProps` interface
 * directly in the function parameter list for convenient access.
 */
export function ProfileReadView({
  hasResume,
  onEdit,
  isRunning,
  isPaused,
  onStart,
  onTogglePause
}: ProfileReadViewProps): JSX.Element {
  /**
   * `handleDownload` is an async function that triggers a resume download
   * by calling the Electron backend API exposed at `window.api.downloadResume()`.
   *
   * `@ts-ignore` tells TypeScript to ignore the next line's type error.
   * This is used because `window.api` may not be typed in the global
   * declarations, but at runtime it exists thanks to Electron's preload
   * script that bridges the main and renderer processes.
   */
  const handleDownload = async (): Promise<void> => {
    // @ts-ignore
    await window.api.downloadResume()
  }

  return (
    /**
     * Outer wrapper `<div>` with Tailwind class:
     *   - `space-y-4` : Adds 1rem (16px) of vertical space between each
     *                    direct child element.  This separates the card
     *                    from the action button below it.
     */
    <div className="space-y-4">
      {/**
       * `<Card>` -- the bordered container for the resume status section.
       *
       * Tailwind class:
       *   - `flex-shrink-0` : Prevents the card from being compressed in a
       *                        flex layout.  Keeps its natural height.
       */}
      <Card className="flex-shrink-0">
        {/**
         * `<CardHeader>` with multiple Tailwind classes:
         *   - `pb-2`            : Small bottom padding (0.5rem / 8px).
         *   - `flex`            : Enables flexbox layout on this element.
         *   - `flex-row`        : Children are laid out horizontally (row).
         *   - `items-center`    : Vertically centers children in the row.
         *   - `justify-between` : Pushes children to opposite ends -- the
         *                          title on the left and the button on the
         *                          right.
         */}
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          {/**
           * Card title with Tailwind class `text-sm` (small font size).
           * Always shows "Resume Status".
           */}
          <CardTitle className="text-sm">Resume Status</CardTitle>

          {/**
           * A small "ghost" button in the header that lets the user switch
           * to the edit / upload view.
           *
           * Props:
           *   - `variant="ghost"` : Minimal styling -- no border or
           *                          background, just text.
           *   - `size="sm"`       : Smaller than the default button.
           *   - `onClick={onEdit}`: Calls the parent's handler to swap to
           *                          the ProfileEditView.
           *
           * Label:
           *   - "Replace" if a resume already exists.
           *   - "Upload"  if no resume has been uploaded yet.
           */}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            {hasResume ? 'Replace' : 'Upload'}
          </Button>
        </CardHeader>

        {/**
         * `<CardContent>` -- the body of the card.
         *
         * Tailwind class:
         *   - `space-y-3` : Adds 0.75rem (12px) vertical spacing between
         *                    child elements (status text and download
         *                    button).
         */}
        <CardContent className="space-y-3">
          {/**
           * A status message indicating whether a resume has been uploaded.
           *
           * Tailwind classes:
           *   - `text-sm`              : Small font (14px).
           *   - `text-muted-foreground`: Soft/gray color for secondary text.
           *
           * The text is chosen dynamically:
           *   - hasResume is true  -> "Resume uploaded and ready for matching."
           *   - hasResume is false -> "No resume uploaded yet."
           */}
          <div className="text-sm text-muted-foreground">
            {hasResume ? 'Resume uploaded and ready for matching.' : 'No resume uploaded yet.'}
          </div>

          {/**
           * Conditionally render a "Download Resume" button only when a
           * resume has been uploaded (`hasResume` is truthy).
           *
           * `{hasResume && (...)}` -- short-circuit rendering: if
           * `hasResume` is false, nothing is rendered.
           *
           * Button props:
           *   - `variant="outline"` : Outlined style (border, transparent
           *                            background).
           *   - `size="sm"`         : Smaller size.
           *   - `className="w-full gap-2"`:
           *       `w-full` -- full-width button.
           *       `gap-2`  -- 0.5rem (8px) gap between the icon and text
           *                   inside the button (flexbox gap).
           *   - `onClick={handleDownload}` : Triggers the resume download
           *                                   via the Electron API.
           */}
          {hasResume && (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleDownload}>
              {/**
               * `<Download>` is the Lucide download-arrow icon.
               *
               * Tailwind classes:
               *   - `h-4` : Sets the icon height to 1rem (16px).
               *   - `w-4` : Sets the icon width to 1rem (16px).
               *
               * The text "Download Resume" appears right after the icon.
               */}
              <Download className="h-4 w-4" />
              Download Resume
            </Button>
          )}
        </CardContent>
      </Card>

      {/**
       * Below the card we render one of two buttons depending on
       * whether the automation is currently running.
       *
       * `{!isRunning ? (...) : (...)}` is a ternary (conditional)
       * expression:
       *   - If the automation is NOT running, show "Start Applying".
       *   - If the automation IS running, show a pause/continue toggle.
       */}
      {!isRunning ? (
        /**
         * "Start Applying" button -- shown when automation is idle.
         *
         * Props:
         *   - `className="w-full"` : Full-width button.
         *   - `onClick={onStart}`  : Calls the parent's handler to begin
         *                            the automation loop.
         *   - `disabled={!hasResume}` : Disabled when there is no resume,
         *                               because the automation needs a
         *                               resume to match against job
         *                               listings.
         *
         * Uses the default variant (solid primary button).
         */
        <Button className="w-full" onClick={onStart} disabled={!hasResume}>
          Start Applying
        </Button>
      ) : (
        /**
         * Pause / Continue toggle button -- shown when automation is active.
         *
         * Props:
         *   - `variant` : Dynamically chosen:
         *       `"default"`   when paused (solid, attention-grabbing style
         *                     to encourage resuming).
         *       `"secondary"` when running (muted style since the primary
         *                     action is in progress).
         *   - `className="w-full"` : Full-width.
         *   - `onClick={onTogglePause}` : Toggles between paused and
         *                                  running states.
         *
         * Label:
         *   - "Continue Applying" when paused.
         *   - "Pause Applying" when running.
         */
        <Button
          variant={isPaused ? 'default' : 'secondary'}
          className="w-full"
          onClick={onTogglePause}
        >
          {isPaused ? 'Continue Applying' : 'Pause Applying'}
        </Button>
      )}
    </div>
  )
}
