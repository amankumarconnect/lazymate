/**
 * Progress Component (shadcn/ui)
 *
 * This file defines a Progress bar component -- a visual indicator that shows how much
 * of a task or process has been completed. Think of it like a loading bar that fills up
 * from left to right as something progresses from 0% to 100%.
 *
 * This component is part of shadcn/ui and is built on top of Radix UI's Progress primitive.
 * Radix UI's Progress provides:
 * - Correct ARIA attributes (role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax)
 *   for screen readers and assistive technologies.
 * - A structured layout with a Root container and an Indicator for the filled portion.
 *
 * The component is styled with Tailwind CSS. The progress animation is achieved using
 * a CSS transform (translateX) to slide the indicator bar from left to right based on
 * the current value.
 */

// Import the entire React library. Required for JSX and TypeScript types.
import * as React from 'react'

// Import the `Progress` component from Radix UI and rename it to `ProgressPrimitive`.
// We rename it to avoid naming conflicts with our own `Progress` component defined below.
// Radix UI's Progress is a "primitive" -- an unstyled, accessible component that provides
// the correct HTML structure and ARIA attributes for a progress bar. It has two parts:
// - Root: The outer container (the "track" or background of the progress bar).
// - Indicator: The inner element that represents the filled/completed portion.
import { Progress as ProgressPrimitive } from 'radix-ui'

// Import the `cn` utility function from the project's local utils file.
// `cn` merges multiple CSS class strings using `clsx` and `tailwind-merge`,
// allowing users to pass custom classNames that properly override defaults.
import { cn } from '@/lib/utils'

/**
 * Progress Component
 *
 * A visual progress bar that shows completion percentage (0 to 100).
 *
 * Props:
 * - className (string): Optional additional CSS classes to customize the progress bar track.
 * - value (number): The current progress value, from 0 to 100. Determines how much of
 *                   the bar is filled. If not provided, defaults to 0 (empty).
 * - ...props: Any other props accepted by Radix UI's ProgressPrimitive.Root (which includes
 *             standard HTML <div> props and Radix-specific props like `max`).
 *
 * The type `React.ComponentProps<typeof ProgressPrimitive.Root>` means this component
 * accepts all the same props as the Radix UI Progress primitive.
 */
function Progress({
  // Destructure `className` so we can merge it with default track classes.
  className,
  // Destructure `value` -- the current progress percentage (0-100).
  value,
  // Collect all remaining props to spread onto the Radix primitive.
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    // Render the Radix UI Progress Root -- this is the outer track/container of the
    // progress bar. Radix automatically adds role="progressbar" and appropriate ARIA
    // attributes (aria-valuenow, aria-valuemin, aria-valuemax) for accessibility.
    <ProgressPrimitive.Root
      // data-slot="progress" is a custom data attribute for shadcn/ui component
      // identification. Other components can detect and style based on this attribute.
      data-slot="progress"
      className={cn(
        // === PROGRESS TRACK CLASSES ===
        // 'bg-primary/20'       - Background color is the primary theme color at 20% opacity.
        //                         This creates a subtle, lighter version of the primary color
        //                         as the "empty" track background.
        // 'relative'            - Set position to relative so the absolutely-positioned or
        //                         transformed indicator inside it is positioned relative to this track.
        // 'h-2'                 - Height of 0.5rem (8px) -- a thin horizontal bar.
        // 'w-full'              - Take the full width of the parent container.
        // 'overflow-hidden'     - Hide any content that overflows the track boundaries. This is
        //                         important because the indicator uses translateX to slide in,
        //                         and we don't want the hidden portion to be visible.
        // 'rounded-full'        - Fully rounded corners (pill-shaped track).
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      // Spread all remaining props (like `max`, `getValueLabel`, etc.) onto the Root.
      {...props}
    >
      {/* Render the Radix UI Progress Indicator -- this is the filled/colored portion
          of the progress bar that grows from left to right as the value increases. */}
      <ProgressPrimitive.Indicator
        // data-slot="progress-indicator" identifies this as the progress indicator element.
        data-slot="progress-indicator"
        // === INDICATOR CLASSES ===
        // 'bg-primary'       - Background uses the full primary theme color (the filled part).
        // 'h-full'           - Height is 100% of the track (fills the track vertically).
        // 'w-full'           - Width is 100% of the track. The actual visible width is controlled
        //                      by the translateX transform below, not by changing the width.
        // 'flex-1'           - Allow the indicator to grow to fill available flex space.
        // 'transition-all'   - Smoothly animate all CSS property changes (especially the transform),
        //                      creating a nice sliding animation as the progress value changes.
        className="bg-primary h-full w-full flex-1 transition-all"
        // The CSS transform controls how much of the indicator is visible:
        // - The indicator is always full-width (w-full), but we shift it to the left using
        //   translateX with a negative percentage.
        // - At value=0:   translateX(-100%) -- the indicator is fully shifted left (hidden).
        // - At value=50:  translateX(-50%)  -- half the indicator is visible.
        // - At value=100: translateX(0%)    -- the indicator is fully visible (complete).
        // - The `(value || 0)` ensures that if `value` is undefined/null, it defaults to 0.
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

// Export the Progress component for use throughout the application.
export { Progress }
