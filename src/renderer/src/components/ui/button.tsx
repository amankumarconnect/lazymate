/**
 * Button Component (shadcn/ui)
 *
 * This file defines a highly customizable Button component with multiple visual variants
 * and size options. Buttons are one of the most fundamental UI elements -- they allow
 * users to trigger actions like submitting forms, opening dialogs, navigating, etc.
 *
 * This component is part of shadcn/ui, a collection of accessible and customizable UI
 * components built on top of Radix UI primitives and styled with Tailwind CSS.
 *
 * Key concepts used in this file:
 * - cva (class-variance-authority): A utility for defining component styles with multiple
 *   variants (e.g., different colors and sizes). It generates the right CSS class string
 *   based on which variant and size props you pass.
 * - Radix UI Slot: Allows the button's styles and props to be "forwarded" to a child element
 *   instead of rendering a <button>. Useful for rendering a styled <a> link that looks like
 *   a button, for example.
 * - Tailwind CSS: A utility-first CSS framework where styles are applied via small,
 *   composable class names (e.g., "px-4" means padding-x of 1rem).
 */

// Import the entire React library. Required for JSX syntax (<button>, <Comp>, etc.)
// which gets compiled into React.createElement calls.
import * as React from 'react'

// Import `cva` and `VariantProps` from the "class-variance-authority" library.
// - `cva`: A function that lets you define base CSS classes plus variant-specific classes.
//   It returns a function you can call with variant options to get the final class string.
// - `VariantProps`: A TypeScript utility type that automatically infers the prop types
//   for all the variants you defined, so you get type-safe variant props.
import { cva, type VariantProps } from 'class-variance-authority'

// Import `Slot` from Radix UI. The Slot component implements the "asChild" pattern:
// instead of rendering its own DOM element, it merges all its props (className, onClick,
// data attributes, etc.) onto its single child element. This allows composition --
// for instance, rendering an <a> tag with all the button's styles and behavior.
import { Slot } from 'radix-ui'

// Import the `cn` utility function from the project's local utils.
// `cn` combines `clsx` (conditional class joining) with `tailwind-merge` (intelligent
// deduplication of conflicting Tailwind classes). This ensures that when a user passes
// a custom `className`, it properly overrides conflicting default classes rather than
// just being appended (which would cause unpredictable results with Tailwind).
import { cn } from '@/lib/utils'

/**
 * buttonVariants - Defines all the visual styles for the Button component using cva.
 *
 * The first argument is the BASE class string (always applied to every button).
 * The second argument is the configuration object with variants, sizes, and defaults.
 */
const buttonVariants = cva(
  // === BASE CLASSES (always applied to every button, regardless of variant or size) ===
  // Each Tailwind utility class is explained below:
  //
  // 'inline-flex'          - Display as an inline flex container. The button sits inline with
  //                          surrounding text/elements but uses flexbox internally for layout.
  // 'items-center'         - Vertically center all flex children (text, icons) within the button.
  // 'justify-center'       - Horizontally center all flex children within the button.
  // 'gap-2'                - Add a 0.5rem (8px) gap between flex children (e.g., icon and text).
  // 'whitespace-nowrap'    - Prevent the button text from wrapping to multiple lines.
  // 'rounded-md'           - Apply medium border radius (0.375rem / 6px) for slightly rounded corners.
  // 'text-sm'              - Set font size to small (0.875rem / 14px).
  // 'font-medium'          - Set font weight to medium (500).
  // 'transition-all'       - Enable smooth CSS transitions on ALL properties (color, background,
  //                          transform, shadow, etc.) for polished hover/focus effects.
  // 'disabled:pointer-events-none' - When the button is disabled, prevent all mouse/touch events
  //                                   so the user cannot interact with it.
  // 'disabled:opacity-50'  - When disabled, reduce opacity to 50% to visually indicate the
  //                          button is not interactive.
  // '[&_svg]:pointer-events-none'  - All descendant SVG icons inside the button have pointer
  //                                   events disabled, so clicks pass through to the button.
  // "[&_svg:not([class*='size-'])]:size-4" - Any descendant SVG that does NOT already have an
  //                                          explicit size class gets sized to 1rem (16px).
  //                                          This ensures icons have a consistent default size
  //                                          but can be overridden with custom size classes.
  // 'shrink-0'             - Prevent the button from shrinking in a flex container.
  // '[&_svg]:shrink-0'     - Prevent any SVG icons inside the button from shrinking either.
  // 'outline-none'         - Remove the browser's default outline on focus.
  // 'focus-visible:border-ring'   - When focused via keyboard navigation (not mouse click),
  //                                  change the border to the theme's ring color.
  // 'focus-visible:ring-ring/50'  - Add a focus ring using the theme's ring color at 50% opacity.
  // 'focus-visible:ring-[3px]'    - Set the focus ring width to 3 pixels.
  // 'aria-invalid:ring-destructive/20'      - If aria-invalid="true" (form validation error),
  //                                            show a ring in the destructive color at 20% opacity.
  // 'dark:aria-invalid:ring-destructive/40' - In dark mode, increase the invalid ring opacity to 40%.
  // 'aria-invalid:border-destructive'       - If invalid, change the border to the destructive color.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    // === VARIANTS CONFIGURATION ===
    // The "variants" object defines all the different visual styles the button can have.
    // Each property inside "variants" becomes a prop on the Button component.
    variants: {
      // --- "variant" prop: Controls the button's color scheme / visual style ---
      variant: {
        // 'default' - The primary button style, used for main/primary actions.
        // 'bg-primary'              - Background uses the primary theme color (usually a brand color).
        // 'text-primary-foreground'  - Text color contrasts well against the primary background.
        // 'hover:bg-primary/90'     - On hover, slightly darken the background to 90% opacity.
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',

        // 'destructive' - For dangerous or destructive actions (delete, remove, etc.).
        // 'bg-destructive'                        - Red/error background color.
        // 'text-white'                             - White text for contrast on red.
        // 'hover:bg-destructive/90'               - On hover, darken to 90% opacity.
        // 'focus-visible:ring-destructive/20'      - Focus ring in destructive color at 20% opacity.
        // 'dark:focus-visible:ring-destructive/40' - In dark mode, focus ring at 40% opacity.
        // 'dark:bg-destructive/60'                 - In dark mode, soften the red to 60% opacity.
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',

        // 'outline' - A bordered button with no filled background.
        // 'border'                    - Show a visible border.
        // 'bg-background'             - Background uses the theme's background color (usually white).
        // 'shadow-xs'                 - Apply an extra-small box shadow for subtle depth.
        // 'hover:bg-accent'           - On hover, fill with the accent background color.
        // 'hover:text-accent-foreground' - On hover, change text to accent foreground color.
        // 'dark:bg-input/30'          - In dark mode, use the input background color at 30% opacity.
        // 'dark:border-input'         - In dark mode, use the input border color.
        // 'dark:hover:bg-input/50'    - In dark mode on hover, use input background at 50% opacity.
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',

        // 'secondary' - A less prominent button using the secondary theme color.
        // 'bg-secondary'              - Background uses the secondary color (usually gray/neutral).
        // 'text-secondary-foreground'  - Text contrasts against the secondary background.
        // 'hover:bg-secondary/80'     - On hover, darken to 80% opacity.
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',

        // 'ghost' - An invisible button that only shows background on hover.
        // Useful for toolbar buttons or less prominent actions.
        // 'hover:bg-accent'              - On hover, show the accent background color.
        // 'hover:text-accent-foreground'  - On hover, change text to accent foreground color.
        // 'dark:hover:bg-accent/50'       - In dark mode, the hover background is at 50% opacity.
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',

        // 'link' - A button styled to look like a text hyperlink.
        // 'text-primary'          - Text uses the primary theme color.
        // 'underline-offset-4'    - Underline is offset 4px below the text baseline.
        // 'hover:underline'       - On hover, show an underline decoration.
        link: 'text-primary underline-offset-4 hover:underline'
      },

      // --- "size" prop: Controls the button's dimensions (height, padding, font size) ---
      size: {
        // 'default' - Standard button size.
        // 'h-9'                - Height is 2.25rem (36px).
        // 'px-4'               - Horizontal padding of 1rem (16px).
        // 'py-2'               - Vertical padding of 0.5rem (8px).
        // 'has-[>svg]:px-3'    - If the button contains a direct child SVG icon, reduce
        //                        horizontal padding to 0.75rem (12px) for better visual balance.
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',

        // 'xs' - Extra small button size.
        // 'h-6'                - Height is 1.5rem (24px).
        // 'gap-1'              - Smaller gap (0.25rem / 4px) between children.
        // 'rounded-md'         - Medium border radius.
        // 'px-2'               - Horizontal padding of 0.5rem (8px).
        // 'text-xs'            - Extra small font size (0.75rem / 12px).
        // 'has-[>svg]:px-1.5'  - If it has an SVG child, reduce padding to 0.375rem (6px).
        // "[&_svg:not([class*='size-'])]:size-3" - Default icon size is 0.75rem (12px) for xs buttons.
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",

        // 'sm' - Small button size.
        // 'h-8'               - Height is 2rem (32px).
        // 'rounded-md'        - Medium border radius.
        // 'gap-1.5'           - Gap of 0.375rem (6px) between children.
        // 'px-3'              - Horizontal padding of 0.75rem (12px).
        // 'has-[>svg]:px-2.5' - If it has an SVG child, reduce padding to 0.625rem (10px).
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',

        // 'lg' - Large button size.
        // 'h-10'              - Height is 2.5rem (40px).
        // 'rounded-md'        - Medium border radius.
        // 'px-6'              - Horizontal padding of 1.5rem (24px).
        // 'has-[>svg]:px-4'   - If it has an SVG child, reduce padding to 1rem (16px).
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',

        // 'icon' - A square button sized for a single icon (no text).
        // 'size-9' - Both width and height are 2.25rem (36px), making a perfect square.
        icon: 'size-9',

        // 'icon-xs' - Extra small square icon button.
        // 'size-6'    - 1.5rem (24px) square.
        // 'rounded-md' - Medium border radius.
        // "[&_svg:not([class*='size-'])]:size-3" - Icon size is 0.75rem (12px).
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",

        // 'icon-sm' - Small square icon button.
        // 'size-8' - 2rem (32px) square.
        'icon-sm': 'size-8',

        // 'icon-lg' - Large square icon button.
        // 'size-10' - 2.5rem (40px) square.
        'icon-lg': 'size-10'
      }
    },

    // === DEFAULT VARIANTS ===
    // If no variant or size props are specified, use these defaults.
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

/**
 * Button Component
 *
 * A versatile, accessible button component with multiple visual variants and sizes.
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization. Merged with
 *                        defaults using `cn` so user classes can override defaults.
 * - variant ('default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'):
 *           Controls the button's visual style / color scheme. Defaults to 'default'.
 * - size ('default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'):
 *        Controls the button's dimensions. Defaults to 'default'.
 * - asChild (boolean): When true, renders a Radix UI Slot instead of a <button> element.
 *                      The Slot merges all button props into its child element, allowing you
 *                      to render, for example, an <a> tag that looks and behaves like a button.
 *                      Defaults to false.
 * - ...props: Any other valid HTML <button> attributes (children, onClick, disabled, type, etc.)
 *             are spread onto the rendered element.
 *
 * Type signature explained:
 * - React.ComponentProps<'button'>: All standard HTML <button> props (onClick, disabled, type, etc.)
 * - VariantProps<typeof buttonVariants>: The variant and size props extracted from cva definition.
 * - { asChild?: boolean }: The optional asChild prop for the Slot pattern.
 */
function Button({
  // Destructure `className` so we can merge it with the variant-generated classes.
  className,
  // Destructure `variant` with default value 'default' -- controls the color/style.
  variant = 'default',
  // Destructure `size` with default value 'default' -- controls dimensions.
  size = 'default',
  // Destructure `asChild` with default value false.
  // When true, uses Slot to merge props into the child element instead of rendering <button>.
  asChild = false,
  // Collect all remaining props (children, onClick, disabled, type, aria-*, etc.)
  // to spread onto the rendered element.
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  // Determine which element/component to render:
  // - If `asChild` is true, use Radix UI's `Slot.Root`. This does NOT create a new DOM
  //   element; instead, it passes all props (className, data-*, event handlers, etc.)
  //   to its single direct child. For example, <Button asChild><a href="/home">Home</a></Button>
  //   would render an <a> tag with all the button's classes and attributes.
  // - If `asChild` is false (default), render a standard HTML <button> element.
  const Comp = asChild ? Slot.Root : 'button'

  // Render the button (either a <button> or a Slot forwarding to its child).
  return (
    <Comp
      // data-slot="button" is a custom data attribute used by shadcn/ui for internal
      // component identification. Parent components can detect the presence of a button
      // using CSS selectors like `has-data-[slot=button]`.
      data-slot="button"
      // data-variant stores the current variant name on the DOM element.
      // Useful for parent CSS selectors like `data-[variant=destructive]:...`.
      data-variant={variant}
      // data-size stores the current size name on the DOM element.
      // Useful for parent CSS selectors like `data-[size=sm]:...`.
      data-size={size}
      // Build the final className by calling `buttonVariants` with the current variant,
      // size, and any user-provided className. The `cn` function inside `buttonVariants`
      // (and wrapping it here) ensures that conflicting Tailwind classes are resolved
      // properly, with user-provided classes winning over defaults.
      className={cn(buttonVariants({ variant, size, className }))}
      // Spread all remaining props onto the element (children, onClick, disabled, etc.).
      {...props}
    />
  )
}

// Export the Button component for use throughout the application.
// Also export buttonVariants so other components or utilities can reuse
// the same class generation logic (e.g., to style a link as a button).
export { Button, buttonVariants }
