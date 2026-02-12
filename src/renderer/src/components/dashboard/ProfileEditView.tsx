/**
 * ProfileEditView.tsx
 *
 * This file defines the `ProfileEditView` component. It provides the UI that
 * lets a user upload (or replace) their resume as a PDF file. The component
 * renders a card with a hidden file input, a button to trigger file selection,
 * and an optional "Cancel" button.
 *
 * How it fits into the app:
 * -  The dashboard has two "modes" for the profile section:
 *       1. **Read mode**  (ProfileReadView) -- shows resume status & action
 *          buttons like "Start Applying".
 *       2. **Edit mode**  (this component) -- lets the user pick a new PDF.
 *    When the user clicks "Upload" or "Replace" in the read view, the
 *    dashboard swaps to this edit view.  After a successful upload (or if the
 *    user clicks "Cancel"), the dashboard switches back to the read view.
 */

/**
 * Import `useRef` and the `JSX` type namespace from React.
 *
 * `useRef` is a React hook that creates a mutable reference object.  Here it
 * is used to get a direct handle to the hidden `<input type="file">` DOM
 * element so we can programmatically trigger the file-picker dialog.
 *
 * `JSX` provides the `JSX.Element` type used as the component's return type.
 */
import { useRef, JSX } from 'react'

/**
 * Import the `Button` UI component from the shared `ui/button` module.
 *
 * `Button` is a reusable, pre-styled button (built with shadcn/ui) that
 * supports variants like "outline", "ghost", "default", etc.  Using a shared
 * button component keeps the look-and-feel consistent across the entire app.
 */
import { Button } from '../ui/button'

/**
 * Import Card-related UI components from the shared `ui/card` module.
 *
 * - `Card`        : The outer container -- a rounded, bordered rectangle.
 * - `CardContent` : The body section of the card where main content goes.
 * - `CardHeader`  : The top section of the card (typically holds a title).
 * - `CardTitle`   : A styled heading element used inside `CardHeader`.
 *
 * These are shadcn/ui components that give us a consistent card design
 * without writing custom CSS.
 */
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

/**
 * `ProfileEditViewProps` is a TypeScript *interface* that describes the shape
 * of the props (inputs) this component accepts.
 *
 * Props are how parent components pass data and callbacks down to children
 * in React.  Defining an interface makes the expected data explicit so
 * TypeScript can catch mistakes at compile time.
 */
interface ProfileEditViewProps {
  /**
   * `hasResume` -- a boolean flag indicating whether the user has already
   * uploaded a resume.  When `true`, the card title says "Replace Resume";
   * when `false`, it says "Upload Resume".
   */
  hasResume: boolean

  /**
   * `onCancel` -- an optional callback function the parent provides so
   * we can render a "Cancel" button.  When the user clicks Cancel, this
   * function is called, and the parent typically switches back to the
   * read view.
   *
   * The `?` after the name means it is *optional* -- the parent does not
   * have to pass it.  If omitted, the Cancel button won't be shown.
   */
  onCancel?: () => void

  /**
   * `onFileUpload` -- a callback function that the parent provides to
   * handle the actual upload logic (e.g., sending the file to the backend
   * for parsing).  It receives the selected `File` object and returns a
   * `Promise<void>` because the upload is asynchronous.
   */
  onFileUpload: (file: File) => Promise<void>

  /**
   * `isParsing` -- a boolean that is `true` while the backend is currently
   * parsing a previously uploaded resume.  While true, the upload button
   * shows "Parsing..." and is disabled so the user cannot start another
   * upload simultaneously.
   */
  isParsing: boolean

  /**
   * `isRunning` -- a boolean that is `true` while the automation (job
   * application loop) is actively running.  While true, the upload button
   * is also disabled to prevent file changes during an active run.
   */
  isRunning: boolean
}

/**
 * `ProfileEditView` is the main React component exported from this file.
 *
 * It destructures its props directly in the function signature -- the
 * `{ hasResume, onCancel, onFileUpload, isParsing, isRunning }` syntax
 * pulls those named properties out of the props object for convenient use.
 *
 * Return type `JSX.Element` guarantees we always return renderable JSX.
 */
export function ProfileEditView({
  hasResume,
  onCancel,
  onFileUpload,
  isParsing,
  isRunning
}: ProfileEditViewProps): JSX.Element {
  /**
   * `useRef<HTMLInputElement>(null)` creates a "ref" -- a persistent
   * reference to a DOM element that survives across re-renders.
   *
   * We attach this ref to the hidden `<input type="file">` element below.
   * Later, when the user clicks the visible "Select PDF Resume" button, we
   * call `fileInputRef.current?.click()` to programmatically open the
   * browser's file-picker dialog.
   *
   * The generic `<HTMLInputElement>` tells TypeScript the ref will point to
   * an `<input>` element.  The initial value `null` means the ref is empty
   * until React attaches it to the DOM node.
   */
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * `handleFileChange` is an async event handler that fires when the hidden
   * `<input type="file">` receives a new file selection.
   *
   * Parameters:
   *   `event` -- a React change event whose `target` is the `<input>`
   *              element.  `event.target.files` is a `FileList` containing
   *              the files the user selected.
   *
   * Return type `Promise<void>` because we `await` the async `onFileUpload`
   * callback provided by the parent.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    /**
     * `event.target.files?.[0]` grabs the first (and only) file the user
     * picked.  The `?.` is optional chaining -- it safely returns
     * `undefined` if `files` is `null` (which can happen if the user
     * cancels the dialog).
     */
    const file = event.target.files?.[0]

    /**
     * If no file was selected (user cancelled the dialog), exit early.
     */
    if (!file) return

    /**
     * Call the parent-provided `onFileUpload` function with the selected
     * file.  We `await` it because upload + parsing is asynchronous.
     */
    await onFileUpload(file)

    /**
     * After a successful upload, reset the file input's value to an empty
     * string.  This is necessary because if the user tries to upload the
     * *same* file again, the browser would not fire a new `change` event
     * (since the value hasn't actually changed).  Clearing it ensures that
     * re-selecting the same file still triggers the handler.
     */
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * The JSX returned below renders the card UI for resume upload.
   */
  return (
    /**
     * `<Card>` is the outermost wrapper -- a bordered, rounded container.
     *
     * Tailwind class:
     *   - `flex-shrink-0` : Prevents the card from shrinking when the
     *                        parent is a flex container and space is tight.
     *                        This ensures the upload card always keeps its
     *                        natural height.
     */
    <Card className="flex-shrink-0">
      {/**
       * `<CardHeader>` is the top portion of the card, typically holding a
       * title / subtitle.
       *
       * Tailwind class:
       *   - `pb-2` : Sets `padding-bottom` to 0.5rem (8px), reducing the
       *              default bottom padding so the header sits closer to
       *              the content below.
       */}
      <CardHeader className="pb-2">
        {/**
         * `<CardTitle>` renders a heading element styled as a card title.
         *
         * Tailwind class:
         *   - `text-sm` : Sets font size to small (0.875rem / 14px).
         *
         * The title text is dynamic:
         *   - If `hasResume` is true  -> "Replace Resume"
         *   - If `hasResume` is false -> "Upload Resume"
         * This is achieved via a ternary expression `condition ? a : b`.
         */}
        <CardTitle className="text-sm">{hasResume ? 'Replace Resume' : 'Upload Resume'}</CardTitle>
      </CardHeader>

      {/**
       * `<CardContent>` is the main body area of the card.
       *
       * Tailwind class:
       *   - `space-y-4` : Adds `1rem` (16px) of vertical spacing between
       *                    each direct child element.  This is a Tailwind
       *                    utility that automatically applies margin-top to
       *                    every child except the first.
       */}
      <CardContent className="space-y-4">
        {/**
         * A short instructional paragraph telling the user what to do.
         *
         * Tailwind classes:
         *   - `text-xs`              : Extra-small font (0.75rem / 12px).
         *   - `text-muted-foreground`: A softer/gray text color from the
         *                              app's theme -- used for secondary or
         *                              helper text.
         *   - `mb-4`                 : Adds `1rem` (16px) of margin below
         *                              this element to separate it from the
         *                              upload button.
         */}
        <div className="text-xs text-muted-foreground mb-4">
          Upload your resume (PDF only). We will automatically parse it to generate your job
          persona.
        </div>

        {/**
         * This is a native HTML file input, but it is *hidden* from the
         * user with `className="hidden"` (Tailwind's `display: none`).
         *
         * Why hide it?  Native file inputs are ugly and hard to style.
         * Instead, we use a styled `<Button>` (below) and programmatically
         * click this hidden input when the button is pressed.
         *
         * Attributes:
         *   - `type="file"`       : Makes this an file-picker input.
         *   - `ref={fileInputRef}`: Attaches our `useRef` reference to
         *                           this DOM node so we can call `.click()`
         *                           on it later.
         *   - `className="hidden"`: Hides the input from view (Tailwind
         *                           utility for `display: none`).
         *   - `accept=".pdf"`     : Limits the file-picker dialog to only
         *                           show PDF files, preventing users from
         *                           accidentally selecting other file types.
         *   - `onChange={handleFileChange}` : Fires our handler when the
         *                           user selects a file.
         */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />

        {/**
         * The visible "Select PDF Resume" button.
         *
         * Props:
         *   - `variant="outline"` : Renders the button with an outlined
         *                           style (border, no fill) rather than a
         *                           solid background.
         *   - `className="w-full"`: Makes the button stretch to the full
         *                           width of its container (Tailwind
         *                           `width: 100%`).
         *   - `onClick`           : When clicked, programmatically triggers
         *                           the hidden file input's click event,
         *                           which opens the file-picker dialog.
         *                           `fileInputRef.current?.click()` uses
         *                           optional chaining so it does nothing
         *                           if the ref hasn't been attached yet.
         *   - `disabled`          : The button is disabled when either
         *                           `isParsing` (currently parsing a file)
         *                           or `isRunning` (automation is active).
         *                           This prevents conflicting operations.
         *
         * Button label:
         *   - While parsing: "Parsing..."
         *   - Otherwise:     "Select PDF Resume"
         */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsing || isRunning}
        >
          {isParsing ? 'Parsing...' : 'Select PDF Resume'}
        </Button>

        {/**
         * Conditionally render a "Cancel" button if the `onCancel` prop
         * was provided by the parent.
         *
         * `{onCancel && (...)}` is a common React pattern called
         * "short-circuit evaluation":  If `onCancel` is undefined/null
         * (falsy), React renders nothing.  If it is a function (truthy),
         * React renders the `<Button>` inside.
         *
         * Button props:
         *   - `variant="ghost"` : A very subtle button style with no
         *                          border or background -- just text that
         *                          highlights on hover.
         *   - `size="sm"`       : A smaller button size.
         *   - `className="w-full mt-2"`:
         *       `w-full` -- full width.
         *       `mt-2`   -- `margin-top: 0.5rem` (8px) to add small space
         *                   above this button.
         *   - `onClick={onCancel}` : Calls the parent's cancel handler when
         *                            clicked.
         */}
        {onCancel && (
          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
