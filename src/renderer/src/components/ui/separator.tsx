/**
 * Separator Component (shadcn/ui)
 *
 * This file defines a Separator component -- a visual divider line used to separate
 * sections of content. Think of it as a horizontal rule (<hr>) but more flexible,
 * supporting both horizontal and vertical orientations with proper accessibility.
 *
 * Common uses:
 * - Dividing sections in a sidebar or menu
 * - Separating groups of form fields
 * - Creating visual breaks between content blocks
 * - Vertical dividers between toolbar buttons
 *
 * This component is part of shadcn/ui and is built on top of Radix UI's Separator primitive.
 * Radix UI's Separator provides:
 * - Correct ARIA semantics (role="separator" or role="none" for decorative separators).
 * - Support for both horizontal and vertical orientations.
 * - The `decorative` prop to indicate whether the separator is meaningful content
 *   or purely visual decoration (affects screen reader behavior).
 */

// Import the entire React library. Required for JSX syntax and TypeScript types.
import * as React from 'react'

// Import the `Separator` component from Radix UI and rename it to `SeparatorPrimitive`.
// We rename it to avoid naming conflicts with our own `Separator` component below.
// Radix UI's Separator is a "primitive" -- an unstyled, accessible component that renders
// the correct HTML element with proper ARIA attributes for a visual divider. It provides:
// - Root: The separator element with role="separator" (or role="none" if decorative).
// - `orientation` support for horizontal or vertical layout.
// - `decorative` prop to control accessibility semantics.
import { Separator as SeparatorPrimitive } from 'radix-ui'

// Import the `cn` utility function from the project's local utils file.
// `cn` merges multiple CSS class strings using `clsx` and `tailwind-merge`,
// allowing user-provided classNames to properly override defaults.
import { cn } from '@/lib/utils'

/**
 * Separator Component
 *
 * A visual divider line that can be horizontal or vertical.
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization.
 * - orientation ('horizontal' | 'vertical'): The direction of the separator line.
 *               'horizontal' renders a thin horizontal line (full width, 1px tall).
 *               'vertical' renders a thin vertical line (full height, 1px wide).
 *               Defaults to 'horizontal'.
 * - decorative (boolean): Whether the separator is purely decorative or semantically
 *               meaningful. When true (the default), the separator gets role="none",
 *               meaning screen readers will ignore it (it is just visual decoration).
 *               When false, it gets role="separator", which screen readers will announce
 *               as a content boundary. Defaults to true.
 * - ...props: Any other props accepted by Radix UI's SeparatorPrimitive.Root.
 *
 * The type `React.ComponentProps<typeof SeparatorPrimitive.Root>` means this component
 * accepts all the same props as the Radix UI Separator primitive.
 */
function Separator({
  // Destructure `className` so we can merge it with default/orientation-specific classes.
  className,
  // Destructure `orientation` with default 'horizontal'. Controls whether the separator
  // is a horizontal line (spanning the full width) or a vertical line (spanning the full height).
  orientation = 'horizontal',
  // Destructure `decorative` with default true. When true, the separator is treated as
  // purely visual decoration and hidden from screen readers (role="none").
  // When false, screen readers will announce it as a separator (role="separator").
  decorative = true,
  // Collect remaining props to spread onto the Radix primitive.
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    // Render the Radix UI Separator Root. This creates a <div> element with the
    // appropriate ARIA role based on the `decorative` prop.
    <SeparatorPrimitive.Root
      // data-slot="separator" for shadcn/ui component identification.
      data-slot="separator"
      // Pass the `decorative` prop to Radix. This controls the ARIA role:
      // - true: role="none" (screen readers ignore it -- it is just visual decoration).
      // - false: role="separator" (screen readers announce it as a content boundary).
      decorative={decorative}
      // Pass the `orientation` to Radix. This sets the `data-orientation` attribute
      // on the element and the `aria-orientation` when not decorative.
      orientation={orientation}
      className={cn(
        // === SEPARATOR CLASSES ===
        // 'bg-border'   - Background color uses the theme's border color (usually a light gray),
        //                  making the separator visible as a subtle line.
        // 'shrink-0'    - Prevent the separator from shrinking in a flex container.
        //                  Without this, a flex parent might compress the 1px separator to nothing.
        //
        // 'data-[orientation=horizontal]:h-px'   - When the orientation is horizontal,
        //                                           set height to 1 pixel (a thin horizontal line).
        // 'data-[orientation=horizontal]:w-full'  - When horizontal, take the full width
        //                                           of the parent container.
        //
        // 'data-[orientation=vertical]:h-full'    - When the orientation is vertical,
        //                                            take the full height of the parent container.
        // 'data-[orientation=vertical]:w-px'      - When vertical, set width to 1 pixel
        //                                            (a thin vertical line).
        //
        // Note: The `data-[orientation=...]` syntax is a Tailwind arbitrary variant that
        // applies classes conditionally based on the value of the `data-orientation` attribute,
        // which Radix sets automatically based on the `orientation` prop.
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        // Merge any user-provided className for custom overrides.
        className
      )}
      // Spread remaining props onto the Radix Separator.
      {...props}
    />
  )
}

// Export the Separator component for use throughout the application.
export { Separator }
