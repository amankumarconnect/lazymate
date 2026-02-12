/**
 * ScrollArea Component (shadcn/ui)
 *
 * This file defines a ScrollArea component -- a custom scrollable container with styled
 * scrollbars. Instead of using the browser's default ugly scrollbars, this component
 * provides beautiful, minimal scrollbars that match the application's design system.
 *
 * This is especially useful for:
 * - Side panels with scrollable lists
 * - Chat message containers
 * - Dropdown menus with many items
 * - Any container where content might overflow and need scrolling
 *
 * This component is part of shadcn/ui and is built on top of Radix UI's ScrollArea primitive.
 * Radix UI's ScrollArea provides:
 * - Custom scrollbar rendering (replacing browser-native scrollbars with styled ones).
 * - Cross-browser consistent scrollbar appearance.
 * - Touch-friendly scrolling on mobile devices.
 * - Keyboard accessibility for the scrollable viewport.
 * - A Corner element for when both horizontal and vertical scrollbars are visible.
 *
 * The component consists of:
 * - ScrollArea: The main wrapper (Root + Viewport + ScrollBar + Corner).
 * - ScrollBar: A styled scrollbar (vertical or horizontal) with a draggable thumb.
 */

// 'use client' is a Next.js directive that marks this file as a Client Component.
// Client Components run in the browser and can use React hooks, event handlers,
// browser APIs, etc. This is needed because Radix UI's ScrollArea uses internal
// state and DOM interactions that require client-side rendering.
// Note: Even in non-Next.js projects, this directive is harmless and simply ignored.
'use client'

// Import the entire React library. Required for JSX syntax and TypeScript types.
import * as React from 'react'

// Import the `ScrollArea` component from Radix UI and rename it to `ScrollAreaPrimitive`.
// We rename it to avoid naming conflicts with our own `ScrollArea` component defined below.
// Radix UI's ScrollArea primitive provides the underlying custom scroll functionality:
// - Root: The outermost container that wraps everything.
// - Viewport: The scrollable content area where children are rendered.
// - ScrollAreaScrollbar: The custom scrollbar track (vertical or horizontal).
// - ScrollAreaThumb: The draggable thumb inside the scrollbar.
// - Corner: A small square element shown in the corner when both scrollbars are visible.
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'

// Import the `cn` utility function from the project's local utils file.
// `cn` merges multiple CSS class strings using `clsx` and `tailwind-merge`,
// ensuring user-provided classNames properly override defaults without conflicts.
import { cn } from '@/lib/utils'

/**
 * ScrollArea Component
 *
 * A scrollable container with custom-styled scrollbars. Wrap any content that might
 * overflow its container with this component to get beautiful, consistent scrollbars.
 *
 * Usage: <ScrollArea className="h-[300px]">...long content...</ScrollArea>
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization.
 *                        You typically set a fixed height (e.g., "h-[300px]" or "h-64")
 *                        so the content can scroll within it.
 * - children (ReactNode): The content to be rendered inside the scrollable area.
 * - ...props: Any other props accepted by Radix UI's ScrollAreaPrimitive.Root.
 *
 * The type `React.ComponentProps<typeof ScrollAreaPrimitive.Root>` means this component
 * accepts all the same props as the Radix UI ScrollArea Root primitive.
 */
function ScrollArea({
  // Destructure `className` so we can merge it with default classes.
  className,
  // Destructure `children` explicitly because we need to place them inside the Viewport,
  // not directly inside the Root.
  children,
  // Collect all remaining props to spread onto the Root element.
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    // Render the Radix UI ScrollArea Root -- the outermost container that sets up
    // the custom scroll context. This replaces the browser's native scrollbar system.
    <ScrollAreaPrimitive.Root
      // data-slot="scroll-area" for shadcn/ui component identification.
      data-slot="scroll-area"
      className={cn(
        // 'relative'         - Set position to relative so child elements (like scrollbars)
        //                      can be positioned absolutely within this container.
        // 'overflow-hidden'  - Hide any overflow. The actual scrolling is handled by the
        //                      Viewport inside, not by this Root element.
        'relative overflow-hidden',
        className
      )}
      // Spread remaining props onto the Root.
      {...props}
    >
      {/* The Viewport is the actual scrollable container where content is rendered.
          All children are placed inside the Viewport, not directly in the Root.
          The Viewport handles the real scrolling behavior while the Root manages
          the custom scrollbar overlay. */}
      <ScrollAreaPrimitive.Viewport
        // data-slot="scroll-area-viewport" identifies this as the scrollable viewport.
        data-slot="scroll-area-viewport"
        // === VIEWPORT CLASSES ===
        // 'focus-visible:ring-ring/50' - When the viewport is focused via keyboard (e.g., Tab),
        //                                show a ring in the theme's ring color at 50% opacity.
        // 'size-full'                  - Set both width and height to 100% of the parent,
        //                                filling the entire ScrollArea Root.
        // 'rounded-[inherit]'          - Inherit the border-radius from the parent element.
        //                                This ensures the viewport's rounded corners match
        //                                the Root's rounded corners if any are applied.
        // 'transition-[color,box-shadow]' - Smoothly animate color and box-shadow changes
        //                                    (e.g., focus ring appearance).
        // 'outline-none'               - Remove the browser's default outline.
        // 'focus-visible:ring-[3px]'   - Set focus ring width to 3 pixels.
        // 'focus-visible:outline-1'    - Add a 1px outline when focused via keyboard.
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {/* Render the children (the actual content to be scrolled) inside the viewport. */}
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* Render the custom scrollbar. By default, it renders a vertical scrollbar.
          If horizontal scrolling is needed, you can add <ScrollBar orientation="horizontal" />
          as an additional child of ScrollArea. */}
      <ScrollBar />

      {/* The Corner element is a small square that appears in the bottom-right corner
          when BOTH horizontal and vertical scrollbars are visible simultaneously.
          It fills the gap where the two scrollbars would overlap. */}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

/**
 * ScrollBar Component
 *
 * A styled scrollbar with a draggable thumb. Can be either vertical or horizontal.
 * This component is used internally by ScrollArea but is also exported so you can
 * customize it or add additional scrollbars (e.g., both vertical and horizontal).
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization.
 * - orientation ('vertical' | 'horizontal'): The direction of the scrollbar.
 *               Defaults to 'vertical'.
 * - ...props: Any other props accepted by Radix UI's ScrollAreaScrollbar primitive.
 */
function ScrollBar({
  // Destructure `className` so we can merge it with orientation-specific classes.
  className,
  // Destructure `orientation` with default 'vertical'. This determines whether
  // the scrollbar is on the right side (vertical) or bottom (horizontal).
  orientation = 'vertical',
  // Collect remaining props to spread onto the scrollbar element.
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    // Render the Radix UI ScrollAreaScrollbar -- the scrollbar track that contains
    // the draggable thumb. Radix handles all the scroll interaction logic.
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      // data-slot="scroll-area-scrollbar" for component identification.
      data-slot="scroll-area-scrollbar"
      // Pass the orientation to Radix so it knows whether this is a vertical or
      // horizontal scrollbar and adjusts its behavior accordingly.
      orientation={orientation}
      className={cn(
        // === BASE SCROLLBAR CLASSES (always applied) ===
        // 'flex'          - Display as a flex container (for layout of the thumb inside).
        // 'touch-none'    - Disable touch event handling on the scrollbar itself,
        //                   preventing accidental interactions on touch devices.
        // 'p-px'          - Add 1 pixel of padding on all sides. This creates a tiny
        //                   gap between the scrollbar track and its container edge.
        // 'transition-colors' - Smoothly animate color changes (e.g., hover effects).
        // 'select-none'   - Prevent text selection when interacting with the scrollbar.
        'flex touch-none p-px transition-colors select-none',

        // === VERTICAL SCROLLBAR CLASSES (applied when orientation is 'vertical') ===
        // 'h-full'               - Full height of the container (scrollbar runs top to bottom).
        // 'w-2.5'                - Width is 0.625rem (10px) -- the thickness of the scrollbar.
        // 'border-l'             - Add a left border (separating the scrollbar from the content).
        // 'border-l-transparent' - Make the left border transparent (adds spacing without
        //                          a visible line).
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',

        // === HORIZONTAL SCROLLBAR CLASSES (applied when orientation is 'horizontal') ===
        // 'h-2.5'                - Height is 0.625rem (10px) -- the thickness of the scrollbar.
        // 'flex-col'             - Stack children vertically (the thumb inside sits vertically).
        // 'border-t'             - Add a top border (separating the scrollbar from the content).
        // 'border-t-transparent' - Make the top border transparent.
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',

        // Merge any user-provided className.
        className
      )}
      // Spread remaining props onto the scrollbar.
      {...props}
    >
      {/* Render the ScrollAreaThumb -- the draggable "handle" inside the scrollbar track.
          The user can click and drag this to scroll the content. Radix automatically sizes
          the thumb proportionally to the visible content and handles all drag interactions. */}
      <ScrollAreaPrimitive.ScrollAreaThumb
        // data-slot="scroll-area-thumb" for component identification.
        data-slot="scroll-area-thumb"
        // === THUMB CLASSES ===
        // 'bg-border'     - Background uses the theme's border color, making the thumb
        //                   visible but not too prominent (a subtle gray).
        // 'relative'      - Set position to relative for potential internal positioning.
        // 'flex-1'        - Allow the thumb to grow to fill available space in the flex
        //                   container (Radix controls the actual size via styles).
        // 'rounded-full'  - Fully rounded corners, giving the thumb a pill/capsule shape.
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

// Export both ScrollArea and ScrollBar for use throughout the application.
// - ScrollArea is the main component you wrap around scrollable content.
// - ScrollBar is exported separately in case you need to customize it or add
//   additional scrollbars (e.g., <ScrollBar orientation="horizontal" />).
export { ScrollArea, ScrollBar }
