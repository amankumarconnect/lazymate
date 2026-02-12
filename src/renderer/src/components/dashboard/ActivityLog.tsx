/**
 * ActivityLog.tsx
 *
 * This file defines the `ActivityLog` component and several helper
 * sub-components that together render a scrollable, real-time activity feed
 * on the dashboard.  Each entry in the log represents something the
 * automation did -- for example, evaluating a job listing, matching against
 * the user's resume, skipping a listing, or encountering an error.
 *
 * Sub-components defined in this file:
 *   - `MatchScoreBar`  -- A tiny horizontal progress bar showing the
 *                          match-score percentage for a job listing.
 *   - `LogIcon`        -- A small colored dot indicating the category of a
 *                          log entry (success, error, info, etc.).
 *   - `LogEntryRow`    -- Renders a single log entry -- either as a
 *                          highlighted card (for job-specific events) or as
 *                          a simple inline row (for general messages).
 *   - `ActivityLog`    -- The top-level exported component that wraps all
 *                          entries in a scrollable area with a header showing
 *                          matched/skipped counts.
 *
 * How it fits into the app:
 * -  The dashboard renders `ActivityLog` in its main content area.  As the
 *    automation processes job listings, new `LogEntry` objects are appended
 *    to a `logs` array in the parent's state, and `ActivityLog` re-renders
 *    to show the latest activity.  The scroll area auto-scrolls to the
 *    bottom so the most recent entry is always visible.
 */

/**
 * Import React hooks and type utilities.
 *
 * - `useEffect` : A React hook that runs a side-effect (in this case,
 *                  scrolling to the bottom) after every render where its
 *                  dependency array changes.
 * - `useRef`    : A React hook that creates a persistent reference to a DOM
 *                  element -- here, the invisible `<div>` at the bottom of
 *                  the log list so we can scroll it into view.
 * - `JSX`       : TypeScript type namespace providing `JSX.Element`.
 */
import { useEffect, useRef, JSX } from 'react'

/**
 * Import the `Badge` component from the shared UI library (shadcn/ui).
 *
 * A `Badge` is a small pill-shaped label.  In this file it is used inside
 * job-specific log entries to show a "Match" or "Skip" label next to the
 * job title.
 */
import { Badge } from '../ui/badge'

/**
 * Import the `ScrollArea` component from shadcn/ui.
 *
 * `ScrollArea` wraps content in a custom-styled scrollable container with
 * subtle, non-intrusive scrollbars.  We use it for the log list so that
 * long activity feeds scroll nicely without the browser's default,
 * platform-specific scrollbar styling.
 */
import { ScrollArea } from '../ui/scroll-area'

/**
 * Import the `cn` utility function from the project's shared `lib/utils`.
 *
 * `cn` is a helper that merges multiple CSS class strings together.  It is
 * built on top of the `clsx` and `tailwind-merge` libraries:
 *   - `clsx` lets you conditionally include class names (e.g. pass `false`
 *      to exclude a class).
 *   - `tailwind-merge` intelligently resolves conflicting Tailwind classes
 *      (e.g. if you pass both `text-red-500` and `text-blue-500`, the last
 *      one wins).
 *
 * Using `cn` is the standard way to compose and conditionally apply
 * Tailwind classes in shadcn/ui projects.
 */
import { cn } from '@/lib/utils'

/**
 * `LogEntry` is a TypeScript interface describing a single activity log
 * record.  It is exported so other parts of the app (e.g. the parent
 * dashboard component that manages the `logs` array) can use the same type.
 */
export interface LogEntry {
  /**
   * `message` -- A human-readable description of what happened.
   * Example: "Applied to Software Engineer at Acme Corp"
   */
  message: string

  /**
   * `type` -- A union type (one of five string literals) that categorizes
   * the log entry:
   *   - `'info'`    : A neutral, informational message (e.g. "Starting
   *                    automation...").
   *   - `'success'` : A positive outcome (e.g. "Successfully applied").
   *   - `'error'`   : Something went wrong (e.g. "Failed to load page").
   *   - `'skip'`    : The job was evaluated but skipped because the match
   *                    score was too low.
   *   - `'match'`   : The job was a good match (similar to `success` but
   *                    specifically about the matching step).
   *
   * This type is used throughout the file to pick colors, icons, and
   * badge labels.
   */
  type: 'info' | 'success' | 'error' | 'skip' | 'match'

  /**
   * `jobTitle` (optional) -- The title of the job listing this entry
   * relates to.  If present, the entry may be rendered as a highlighted
   * card instead of a plain text row.
   */
  jobTitle?: string

  /**
   * `matchScore` (optional) -- A number from 0-100 representing how well
   * the user's resume matches the job listing.  When present and >= 0, a
   * `MatchScoreBar` is rendered to visualize the percentage.
   */
  matchScore?: number

  /**
   * `timestamp` -- A `Date` object recording when this event occurred.
   * Displayed on the right side of plain log rows as "HH:MM:SS".
   */
  timestamp: Date
}

/**
 * `ActivityLogProps` is the props interface for the main `ActivityLog`
 * component.  It receives just one prop: the array of log entries to
 * display.
 */
interface ActivityLogProps {
  /**
   * `logs` -- An array of `LogEntry` objects.  Each entry will be rendered
   * as a `LogEntryRow`.  The array is expected to grow over time as the
   * automation produces new events.
   */
  logs: LogEntry[]
}

/**
 * `MatchScoreBar` is a small helper component that renders a horizontal
 * progress bar representing the match-score percentage for a job.
 *
 * Props (inline destructured):
 *   - `score` : A number 0-100 representing the match percentage.
 *   - `type`  : The `LogEntry` type, used to decide the bar's color
 *               (green for good outcomes, red for bad).
 *
 * This is a "presentational" / "dumb" component -- it has no state or
 * side-effects; it only renders UI based on its props.
 */
function MatchScoreBar({ score, type }: { score: number; type: LogEntry['type'] }): JSX.Element {
  /**
   * `isGood` is a boolean that is `true` when the log type is either
   * `'success'` or `'match'`.  This determines whether the bar is colored
   * green (good) or red (bad).
   */
  const isGood = type === 'success' || type === 'match'

  return (
    /**
     * Outer container for the progress bar and score label.
     *
     * Tailwind classes:
     *   - `flex`          : Enables flexbox layout (horizontal row).
     *   - `items-center`  : Vertically centers the bar and the label.
     *   - `gap-2`         : 0.5rem (8px) horizontal gap between the bar
     *                        and the percentage text.
     *   - `mt-1.5`        : 0.375rem (6px) margin-top to separate from
     *                        the content above.
     */
    <div className="flex items-center gap-2 mt-1.5">
      {/**
       * The "track" of the progress bar -- the full-width gray background.
       *
       * Tailwind classes:
       *   - `flex-1`          : Takes up all remaining horizontal space
       *                          (pushes the percentage label to the right).
       *   - `bg-muted`        : Light gray background (theme color).
       *   - `rounded-full`    : Fully rounded corners (pill shape).
       *   - `h-1.5`           : 0.375rem (6px) height -- very thin bar.
       *   - `overflow-hidden`  : Hides any part of the inner "fill" that
       *                          might overflow the track's rounded corners.
       */}
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        {/**
         * The "fill" of the progress bar -- its width represents the score.
         *
         * Tailwind classes (applied via `cn` for conditional logic):
         *   - `h-full`                     : Fill the entire track height.
         *   - `rounded-full`               : Rounded corners matching the
         *                                     track.
         *   - `transition-all duration-500` : Smooth 500ms CSS transition
         *                                     when the width changes.
         *   - `bg-emerald-500`             : Green fill when `isGood` is
         *                                     true (success / match).
         *   - `bg-destructive`             : Red fill when `isGood` is
         *                                     false (skip / error).
         *
         * The inline `style` sets the width as a percentage.  `Math.min`
         * caps it at 100% to prevent visual overflow if the score somehow
         * exceeds 100.
         */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isGood ? 'bg-emerald-500' : 'bg-destructive'
          )}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      {/**
       * The percentage label to the right of the bar.
       *
       * Tailwind classes (via `cn`):
       *   - `text-[10px]`      : Custom font size of 10px (arbitrary
       *                           value syntax in Tailwind).
       *   - `font-bold`        : Bold weight to make the number stand out.
       *   - `tabular-nums`     : Uses tabular (fixed-width) numerals so
       *                           numbers don't shift when they change.
       *   - `min-w-[32px]`     : Minimum width of 32px so the label
       *                           doesn't shrink for small numbers.
       *   - `text-right`       : Right-aligns the text within its box.
       *   - `text-emerald-500` : Green when `isGood`.
       *   - `text-destructive` : Red when not `isGood`.
       */}
      <span
        className={cn(
          'text-[10px] font-bold tabular-nums min-w-[32px] text-right',
          isGood ? 'text-emerald-500' : 'text-destructive'
        )}
      >
        {/* Display the score followed by a percent sign */}
        {score}%
      </span>
    </div>
  )
}

/**
 * `LogIcon` is a small helper component that renders a tiny colored dot
 * to the left of a log message.  The dot's color indicates the category
 * of the log entry.
 *
 * Props:
 *   - `type` : The `LogEntry` type string (info, success, error, etc.).
 */
function LogIcon({ type }: { type: LogEntry['type'] }): JSX.Element {
  /**
   * `baseClass` contains Tailwind classes shared by every dot variant:
   *   - `size-1.5`     : Sets both width and height to 0.375rem (6px).
   *   - `rounded-full` : Makes the element a perfect circle.
   *   - `shrink-0`     : Prevents the dot from shrinking in a flex layout.
   *   - `mt-[5px]`     : 5px top margin to vertically align the dot with
   *                       the first line of text next to it.
   */
  const baseClass = 'size-1.5 rounded-full shrink-0 mt-[5px]'

  /**
   * A `switch` statement picks the dot color based on the entry type.
   * `cn(baseClass, 'bg-...')` merges the shared base classes with the
   * type-specific background color.
   */
  switch (type) {
    /**
     * `success` and `match` both use an emerald (green) dot to signal a
     * positive outcome.  The `case 'success':` falls through to the
     * `case 'match':` case -- a standard JavaScript switch fall-through
     * pattern.
     */
    case 'success':
    case 'match':
      return <div className={cn(baseClass, 'bg-emerald-500')} />
    /**
     * `error` and `skip` both use a destructive (red) dot to signal a
     * negative or skipped outcome.
     */
    case 'error':
    case 'skip':
      return <div className={cn(baseClass, 'bg-destructive')} />
    /**
     * For `'info'` (and any unexpected type), use a muted gray dot.
     *
     * `bg-muted-foreground/40` means the muted-foreground color at 40%
     * opacity -- a subtle, low-contrast dot.
     */
    default:
      return <div className={cn(baseClass, 'bg-muted-foreground/40')} />
  }
}

/**
 * `LogEntryRow` renders a single log entry.  Depending on the content, it
 * renders one of two layouts:
 *
 *   1. **Job-context card** -- If the entry has a `jobTitle` AND its type
 *      is `skip`, `success`, or `match`, it renders as a highlighted,
 *      bordered card with the job title, a badge ("Match" or "Skip"), the
 *      message, and an optional score bar.
 *
 *   2. **Simple inline row** -- Otherwise, it renders as a compact row
 *      with a colored dot, the message text, and a timestamp.
 *
 * Props:
 *   - `log` : A single `LogEntry` object.
 */
function LogEntryRow({ log }: { log: LogEntry }): JSX.Element {
  /**
   * `hasJobContext` is `true` when this entry is about a specific job
   * listing AND is one of the types that should be displayed as a card.
   * The `&&` operator ensures BOTH conditions must be met.
   */
  const hasJobContext =
    log.jobTitle && (log.type === 'skip' || log.type === 'success' || log.type === 'match')

  /**
   * `hasScore` is `true` when a valid match score exists.  We check
   * `!== undefined` first (the property may be absent) and then `>= 0`
   * to ensure the number is non-negative.
   */
  const hasScore = log.matchScore !== undefined && log.matchScore >= 0

  /**
   * Convenience booleans for color logic:
   *   - `isGood` : true for positive outcomes (green styling).
   *   - `isBad`  : true for negative outcomes (red styling).
   */
  const isGood = log.type === 'success' || log.type === 'match'
  const isBad = log.type === 'skip' || log.type === 'error'

  /**
   * ---- LAYOUT 1: Job-context card ----
   *
   * Rendered when the entry references a specific job listing.
   */
  if (hasJobContext) {
    return (
      /**
       * Outer card wrapper `<div>`.
       *
       * Tailwind classes (via `cn` for conditional logic):
       *   - `rounded-lg`        : Large border-radius for softer corners.
       *   - `border`            : 1px solid border.
       *   - `p-2.5`             : 0.625rem (10px) padding on all sides.
       *   - `transition-colors` : Smooth color transition on hover / state
       *                            change.
       *
       * Conditional classes:
       *   - When `isGood`:
       *       `border-emerald-500/30` -- green border at 30% opacity.
       *       `bg-emerald-500/5`      -- very faint green background.
       *   - When `isBad`:
       *       `border-destructive/30` -- red border at 30% opacity.
       *       `bg-destructive/5`      -- very faint red background.
       */
      <div
        className={cn(
          'rounded-lg border p-2.5 transition-colors',
          isGood && 'border-emerald-500/30 bg-emerald-500/5',
          isBad && 'border-destructive/30 bg-destructive/5'
        )}
      >
        {/**
         * Row that holds the job title (left) and the badge (right).
         *
         * Tailwind classes:
         *   - `flex`            : Horizontal flexbox.
         *   - `items-start`     : Align items to the top of the row.
         *   - `justify-between` : Push title and badge to opposite ends.
         *   - `gap-2`           : 0.5rem (8px) gap between them.
         */}
        <div className="flex items-start justify-between gap-2">
          {/**
           * The job title text.
           *
           * Tailwind classes:
           *   - `text-xs`     : Extra-small font (12px).
           *   - `font-medium` : Medium-weight (500) font.
           *   - `break-words` : Allows long titles to wrap instead of
           *                      overflowing.
           *   - `min-w-0`     : Allows the element to shrink below its
           *                      content width in a flex container (needed
           *                      for word wrapping to work properly).
           *   - `flex-1`      : Takes up remaining horizontal space.
           */}
          <p className="text-xs font-medium break-words min-w-0 flex-1">{log.jobTitle}</p>
          {/**
           * A `<Badge>` showing "Match" or "Skip".
           *
           * Props:
           *   - `variant` : `"default"` for good outcomes (shows with the
           *                  theme's default badge color) or `"destructive"`
           *                  for bad outcomes (red).
           *
           * Tailwind classes (via `cn`):
           *   - `shrink-0`       : Prevents the badge from shrinking.
           *   - `text-[10px]`    : 10px font size (tiny label).
           *   - `px-1.5`         : 0.375rem (6px) horizontal padding.
           *   - `py-0`           : Zero vertical padding (keeps badge
           *                         compact).
           *   - When `isGood`:
           *       `bg-emerald-500 hover:bg-emerald-500` -- overrides the
           *       default badge background with a green that stays green
           *       even on hover.
           */}
          <Badge
            variant={isGood ? 'default' : 'destructive'}
            className={cn(
              'shrink-0 text-[10px] px-1.5 py-0',
              isGood && 'bg-emerald-500 hover:bg-emerald-500'
            )}
          >
            {/* Show "Match" for positive, "Skip" for negative */}
            {isGood ? 'Match' : 'Skip'}
          </Badge>
        </div>
        {/**
         * The log message text, styled according to outcome.
         *
         * Tailwind classes (via `cn`):
         *   - `text-[11px]` : 11px font size.
         *   - `mt-0.5`      : 0.125rem (2px) top margin.
         *   - When `isGood`:
         *       `text-emerald-600 dark:text-emerald-400` -- green text
         *       color, with a lighter green variant for dark mode
         *       (Tailwind's `dark:` prefix applies only when dark mode is
         *       active).
         *   - When not `isGood`:
         *       `text-destructive` -- red text color.
         */}
        <p
          className={cn(
            'text-[11px] mt-0.5',
            isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          )}
        >
          {/* The human-readable description of what happened */}
          {log.message}
        </p>
        {/**
         * If this entry has a numeric match score, render the
         * `MatchScoreBar` progress bar below the message.
         *
         * `{hasScore && <MatchScoreBar ... />}` -- short-circuit rendering.
         *
         * `log.matchScore!` -- the `!` is TypeScript's non-null assertion
         * operator.  We already checked `matchScore !== undefined` via
         * `hasScore`, so we tell TS it is safe to use.
         */}
        {hasScore && <MatchScoreBar score={log.matchScore!} type={log.type} />}
      </div>
    )
  }

  /**
   * ---- LAYOUT 2: Simple inline row ----
   *
   * Used for general / informational messages that do not have a job
   * context card treatment.
   */
  return (
    /**
     * Outer row container.
     *
     * Tailwind classes:
     *   - `flex`         : Horizontal flexbox.
     *   - `items-start`  : Align items to the top.
     *   - `gap-2`        : 0.5rem (8px) gap between the icon, text, and
     *                       timestamp.
     *   - `px-1`         : 0.25rem (4px) horizontal padding.
     *   - `py-0.5`       : 0.125rem (2px) vertical padding.
     */
    <div className="flex items-start gap-2 px-1 py-0.5">
      {/**
       * Render the small colored dot icon that represents the entry type.
       */}
      <LogIcon type={log.type} />
      {/**
       * The message text container.
       *
       * Tailwind classes:
       *   - `min-w-0`     : Allows shrinking for text wrapping in flex.
       *   - `flex-1`      : Takes remaining horizontal space.
       *   - `text-xs`     : Extra-small font (12px).
       *   - `break-words` : Wraps long words to prevent overflow.
       */}
      <p className="min-w-0 flex-1 text-xs break-words">
        {/**
         * The main message text, color-coded by log type.
         *
         * Tailwind classes (via `cn`):
         *   - `text-destructive`                          : Red text for
         *                                                     errors.
         *   - `text-emerald-600 dark:text-emerald-400`    : Green text for
         *                                                     successes.
         *   - `text-muted-foreground`                     : Gray text for
         *                                                     informational
         *                                                     messages.
         *
         * Only the matching class is applied -- the others evaluate to
         * `false` (which `cn` / `clsx` simply ignores).
         */}
        <span
          className={cn(
            log.type === 'error' && 'text-destructive',
            log.type === 'success' && 'text-emerald-600 dark:text-emerald-400',
            log.type === 'info' && 'text-muted-foreground'
          )}
        >
          {log.message}
        </span>
        {/**
         * If this entry has a `jobTitle` (but did NOT qualify for the card
         * layout above), show it as a small italic annotation after the
         * message, preceded by an em dash.
         *
         * Tailwind classes:
         *   - `text-[10px]`              : 10px font.
         *   - `text-muted-foreground/70` : Muted gray at 70% opacity --
         *                                   even subtler than the default
         *                                   muted-foreground.
         *   - `ml-1`                     : 0.25rem (4px) left margin to
         *                                   separate from the message.
         *   - `italic`                   : Italic text.
         */}
        {log.jobTitle && (
          <span className="text-[10px] text-muted-foreground/70 ml-1 italic">— {log.jobTitle}</span>
        )}
      </p>
      {/**
       * The timestamp label on the right side of the row.
       *
       * Tailwind classes:
       *   - `text-[10px]`              : 10px font.
       *   - `text-muted-foreground/50` : Muted gray at 50% opacity -- very
       *                                   subtle so it doesn't distract.
       *   - `tabular-nums`             : Fixed-width numerals so the
       *                                   timestamps align vertically.
       *   - `shrink-0`                 : Prevents the timestamp from
       *                                   shrinking in the flex row.
       *
       * `toLocaleTimeString` formats the `Date` into a locale-aware time
       * string.  The options object requests 2-digit hours, minutes, and
       * seconds (e.g. "14:05:09").
       */}
      <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
        {log.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
      </span>
    </div>
  )
}

/**
 * `ActivityLog` is the main exported component. It receives the full array
 * of log entries and renders them inside a scrollable area with a header
 * that shows matched / skipped counts.
 *
 * Props:
 *   - `logs` : An array of `LogEntry` objects (see `ActivityLogProps`).
 */
export function ActivityLog({ logs }: ActivityLogProps): JSX.Element {
  /**
   * `bottomRef` is a ref attached to an invisible `<div>` placed after
   * the last log entry.  Whenever new logs are added, we call
   * `scrollIntoView` on this element to auto-scroll to the bottom.
   *
   * `useRef<HTMLDivElement>(null)` creates a ref typed for a `<div>`
   * element, initialized to `null` until React attaches it.
   */
  const bottomRef = useRef<HTMLDivElement>(null)

  /**
   * `useEffect` is a React hook that runs the provided callback every time
   * one of its dependencies changes.
   *
   * Dependency array: `[logs]` -- the effect re-runs whenever the `logs`
   * array reference changes (i.e., when new entries are added).
   *
   * Inside the effect:
   *   `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })` smoothly
   *   scrolls the bottom sentinel `<div>` into the visible area. The `?.`
   *   optional chaining ensures no error if the ref is not yet attached.
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    /**
     * Outermost wrapper.
     *
     * Tailwind classes:
     *   - `flex-1`           : Fills all remaining vertical space in the
     *                           parent flex column layout. This makes the
     *                           activity log grow to fill available room.
     *   - `min-h-0`          : Overrides the default `min-height: auto` of
     *                           flex children, which is necessary for the
     *                           scroll area to actually scroll instead of
     *                           expanding infinitely.
     *   - `flex flex-col`    : Column-direction flexbox so the header and
     *                           scroll area stack vertically.
     *   - `overflow-hidden`  : Clips any content that overflows the
     *                           container bounds.
     */
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/**
       * Header row above the log list.
       *
       * Tailwind classes:
       *   - `flex`            : Horizontal flexbox.
       *   - `items-center`    : Vertically center children.
       *   - `justify-between` : Push the title left and the stats right.
       *   - `mb-2`            : 0.5rem (8px) bottom margin separating the
       *                          header from the scroll area.
       *   - `flex-shrink-0`   : Prevents the header from shrinking when
       *                          the scroll area needs space.
       */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        {/**
         * Section heading.
         *
         * Tailwind classes:
         *   - `text-sm`       : Small font (14px).
         *   - `font-semibold` : Semi-bold weight (600).
         */}
        <h3 className="text-sm font-semibold">Activity Log</h3>
        {/**
         * Matched / skipped statistics -- only shown when there are logs.
         *
         * `{logs.length > 0 && (...)}` -- short-circuit rendering.
         *
         * Tailwind classes on the `<span>`:
         *   - `text-[10px]`           : 10px font.
         *   - `text-muted-foreground` : Subtle gray color.
         *
         * The two `.filter().length` expressions count:
         *   1. Entries with type `'success'` or `'match'` = "matched".
         *   2. Entries with type `'skip'` = "skipped".
         *
         * The `{' / '}` between them renders a literal " / " separator.
         */}
        {logs.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {logs.filter((l) => l.type === 'success' || l.type === 'match').length} matched
            {' / '}
            {logs.filter((l) => l.type === 'skip').length} skipped
          </span>
        )}
      </div>
      {/**
       * `<ScrollArea>` -- the custom scrollable container from shadcn/ui.
       *
       * Tailwind classes:
       *   - `flex-1`      : Takes up remaining vertical space.
       *   - `rounded-md`  : Medium border radius on the scroll container.
       *   - `border`      : 1px solid border.
       *   - `bg-muted/30` : Very faint muted background at 30% opacity.
       */}
      <ScrollArea className="flex-1 rounded-md border bg-muted/30">
        {/**
         * Inner padding wrapper.
         *
         * Tailwind classes:
         *   - `p-2`        : 0.5rem (8px) padding on all sides.
         *   - `space-y-1.5`: 0.375rem (6px) vertical gap between each log
         *                     entry row.
         */}
        <div className="p-2 space-y-1.5">
          {/**
           * Conditional rendering:
           *   - If there are NO logs, show a centered placeholder message.
           *   - If there ARE logs, map over them and render a `LogEntryRow`
           *     for each one.
           */}
          {logs.length === 0 ? (
            /**
             * Empty-state placeholder.
             *
             * Tailwind classes on the outer `<div>`:
             *   - `flex`            : Flexbox.
             *   - `items-center`    : Vertical centering.
             *   - `justify-center`  : Horizontal centering.
             *   - `py-8`            : 2rem (32px) vertical padding to give
             *                          the empty state visual weight.
             *
             * Tailwind classes on the `<p>`:
             *   - `text-xs`              : Extra-small font (12px).
             *   - `text-muted-foreground`: Subtle gray color.
             */
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-muted-foreground">
                No activity yet. Start the automation to see logs.
              </p>
            </div>
          ) : (
            /**
             * `.map()` iterates over the `logs` array and renders one
             * `<LogEntryRow>` component per entry.
             *
             * Props passed to each row:
             *   - `key={i}` : A unique key for React's reconciliation
             *                  algorithm.  Using the array index `i` is
             *                  acceptable here because log entries are
             *                  only appended (never reordered or deleted).
             *   - `log={log}` : The individual `LogEntry` object.
             */
            logs.map((log, i) => <LogEntryRow key={i} log={log} />)
          )}
          {/**
           * An invisible sentinel `<div>` at the very bottom of the list.
           * We attach `bottomRef` to it so our `useEffect` can call
           * `scrollIntoView` on it whenever new logs are added, keeping
           * the scroll position at the latest entry.
           */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
