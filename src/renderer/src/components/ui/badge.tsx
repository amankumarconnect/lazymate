/**
 * Badge Component (shadcn/ui)
 *
 * This file defines a Badge component -- a small, pill-shaped label used to display
 * short pieces of information such as statuses, counts, tags, or categories.
 * Think of it like a label or tag you might see next to a notification count or
 * a status indicator (e.g., "New", "Active", "Error").
 *
 * This component is part of shadcn/ui, a collection of beautifully designed,
 * accessible, and customizable UI components. shadcn/ui components are built on
 * top of Radix UI primitives (for accessibility) and styled with Tailwind CSS
 * (for utility-first styling).
 *
 * Key concepts used in this file:
 * - cva (class-variance-authority): A utility for creating components with multiple
 *   visual variants. It lets you define a base set of CSS classes, then add
 *   conditional classes based on "variant" props (like "default", "destructive", etc.).
 * - Radix UI Slot: A pattern that allows a component to "merge" its props and behavior
 *   into its child element, instead of wrapping it in an extra DOM node.
 * - Tailwind CSS: A utility-first CSS framework where you style elements by composing
 *   small, single-purpose classes directly in your markup (e.g., "px-2" = padding-x 2 units).
 */

// Import the entire React library. This is needed because we are writing JSX (the HTML-like
// syntax in React), and JSX gets compiled into React.createElement calls under the hood.
import * as React from 'react'

// Import `cva` and `VariantProps` from the "class-variance-authority" library.
// - `cva` is a function that lets you define a component's CSS classes with support for
//   multiple "variants" (visual styles). You give it base classes and variant-specific classes,
//   and it returns a function that generates the correct class string based on the variant chosen.
// - `VariantProps` is a TypeScript type helper that automatically extracts the variant prop
//   types from a cva definition, so TypeScript knows which variants are valid.
import { cva, type VariantProps } from 'class-variance-authority'

// Import `Slot` from "radix-ui". Slot is a Radix UI utility component that implements
// the "Slot" pattern (also known as "asChild" pattern). Instead of rendering its own
// DOM element, Slot merges its props (like className, onClick, etc.) into its direct
// child element. This is useful when you want the Badge's styles and behavior but want
// to render a different element (like an <a> tag instead of a <span>).
import { Slot } from 'radix-ui'

// Import the `cn` utility function from the project's local utils file.
// `cn` is a helper that merges multiple Tailwind CSS class strings together intelligently.
// It uses a combination of `clsx` (for conditional class joining) and `tailwind-merge`
// (for resolving conflicting Tailwind classes -- e.g., if you have both "px-2" and "px-4",
// tailwind-merge keeps only the last one). This lets users pass custom `className` props
// that can override the component's default styles without class conflicts.
import { cn } from '@/lib/utils'

/**
 * badgeVariants - Defines all the visual styles for the Badge component using cva.
 *
 * The first argument to `cva(...)` is the BASE class string -- these classes are ALWAYS
 * applied to the badge regardless of which variant is selected. The second argument is
 * a configuration object that defines the available variants and their default values.
 */
const badgeVariants = cva(
  // === BASE CLASSES (always applied to every badge) ===
  // Each Tailwind utility class is explained below:
  //
  // 'inline-flex'         - Display as an inline flex container. This means the badge sits
  //                         inline with text (like a <span>) but can use flexbox layout inside.
  // 'items-center'        - Vertically center the flex children (e.g., text and icons).
  // 'justify-center'      - Horizontally center the flex children within the badge.
  // 'rounded-full'        - Make the badge fully rounded (pill-shaped / capsule shape).
  // 'border'              - Add a 1px border around the badge.
  // 'border-transparent'  - Make the border transparent by default (some variants override this).
  // 'px-2'                - Add horizontal padding of 0.5rem (8px) on left and right.
  // 'py-0.5'              - Add vertical padding of 0.125rem (2px) on top and bottom.
  // 'text-xs'             - Set font size to extra small (0.75rem / 12px).
  // 'font-medium'         - Set font weight to medium (500).
  // 'w-fit'               - Set width to fit-content (badge is only as wide as its content).
  // 'whitespace-nowrap'   - Prevent the badge text from wrapping to a new line.
  // 'shrink-0'            - Prevent the badge from shrinking when inside a flex container.
  // '[&>svg]:size-3'      - Any direct child SVG icon is sized to 0.75rem (12px) width and height.
  //                         The [&>svg] is a Tailwind arbitrary variant targeting direct child SVGs.
  // 'gap-1'               - Add a 0.25rem (4px) gap between flex children (e.g., between icon and text).
  // '[&>svg]:pointer-events-none' - Disable pointer events (clicks) on child SVG icons so clicks
  //                                  pass through to the badge itself.
  // 'focus-visible:border-ring'   - When the badge is focused via keyboard (not mouse), change
  //                                  the border color to the theme's "ring" color.
  // 'focus-visible:ring-ring/50'  - When keyboard-focused, add a ring (outline glow) using the
  //                                  theme's ring color at 50% opacity.
  // 'focus-visible:ring-[3px]'    - Set the focus ring width to 3px.
  // 'aria-invalid:ring-destructive/20'      - If the badge has aria-invalid="true" (indicating a
  //                                            validation error), show a ring in the "destructive"
  //                                            (error/red) color at 20% opacity.
  // 'dark:aria-invalid:ring-destructive/40' - In dark mode, increase the invalid ring opacity to 40%
  //                                            for better visibility against dark backgrounds.
  // 'aria-invalid:border-destructive'       - If invalid, change the border to the destructive color.
  // 'transition-[color,box-shadow]'         - Animate changes to color and box-shadow properties
  //                                            smoothly (e.g., when focus ring appears/disappears).
  // 'overflow-hidden'     - Hide any content that overflows the badge boundaries.
  'inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    // === VARIANTS CONFIGURATION ===
    // This object defines all the different visual styles ("variants") the badge can have.
    variants: {
      // The "variant" prop controls the badge's visual appearance / color scheme.
      variant: {
        // 'default' - The primary/main badge style.
        // 'bg-primary'              - Background uses the primary theme color.
        // 'text-primary-foreground'  - Text color is set to contrast well against the primary background.
        // '[a&]:hover:bg-primary/90' - If the badge is rendered as an <a> (anchor/link) element,
        //                              on hover, slightly darken the background to 90% opacity.
        //                              The [a&] syntax targets the element only when it IS an <a> tag.
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',

        // 'secondary' - A more subtle badge style using the secondary theme color.
        // 'bg-secondary'              - Background uses the secondary theme color (usually gray/neutral).
        // 'text-secondary-foreground'  - Text color contrasts against the secondary background.
        // '[a&]:hover:bg-secondary/90' - On hover (when it is an <a>), darken to 90% opacity.
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',

        // 'destructive' - A badge for errors, warnings, or destructive actions (usually red).
        // 'bg-destructive'                          - Background uses the destructive (red/error) color.
        // 'text-white'                               - Text is white for maximum contrast on red.
        // '[a&]:hover:bg-destructive/90'             - On hover (as <a>), darken to 90% opacity.
        // 'focus-visible:ring-destructive/20'        - Focus ring uses destructive color at 20% opacity.
        // 'dark:focus-visible:ring-destructive/40'   - In dark mode, focus ring is at 40% opacity.
        // 'dark:bg-destructive/60'                   - In dark mode, the background is at 60% opacity
        //                                              to look less harsh against dark backgrounds.
        destructive:
          'bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',

        // 'outline' - A badge with only a visible border and no filled background.
        // 'border-border'                      - Border uses the theme's standard border color.
        // 'text-foreground'                     - Text uses the default foreground (text) color.
        // '[a&]:hover:bg-accent'               - On hover (as <a>), fill background with accent color.
        // '[a&]:hover:text-accent-foreground'   - On hover (as <a>), change text to accent foreground.
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',

        // 'ghost' - A badge with no background or border at all -- it only shows on hover.
        // '[a&]:hover:bg-accent'              - On hover (as <a>), show an accent background.
        // '[a&]:hover:text-accent-foreground'  - On hover (as <a>), change text to accent foreground.
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',

        // 'link' - A badge styled to look like a hyperlink (underlined text).
        // 'text-primary'          - Text uses the primary theme color (usually blue).
        // 'underline-offset-4'    - The underline is offset 4px below the text baseline for aesthetics.
        // '[a&]:hover:underline'  - On hover (as <a>), show the underline decoration.
        link: 'text-primary underline-offset-4 [a&]:hover:underline'
      }
    },

    // === DEFAULT VARIANTS ===
    // If no "variant" prop is provided when using the Badge component,
    // it will use the 'default' variant automatically.
    defaultVariants: {
      variant: 'default'
    }
  }
)

/**
 * Badge Component
 *
 * A small, pill-shaped label component for displaying statuses, tags, or short info.
 *
 * Props:
 * - className (string): Optional additional CSS classes to customize the badge's appearance.
 *                        These will be merged with the default classes using the `cn` utility.
 * - variant ('default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'):
 *           Controls the visual style of the badge. Defaults to 'default'.
 * - asChild (boolean): When true, the Badge does not render its own <span> element.
 *                      Instead, it uses the Radix UI Slot pattern to merge its props into
 *                      its direct child element. This is useful when you want the Badge's
 *                      styles on a different element, like <a> or <button>.
 *                      Defaults to false.
 * - ...props: Any other valid HTML <span> attributes (e.g., onClick, id, aria-label, children, etc.)
 *             are spread onto the rendered element.
 *
 * The component's type signature uses:
 * - React.ComponentProps<'span'>: All standard HTML <span> element props.
 * - VariantProps<typeof badgeVariants>: The variant prop types extracted from the cva definition.
 * - { asChild?: boolean }: The optional asChild prop for the Slot pattern.
 */
function Badge({
  // Destructure `className` so we can merge it with our default classes.
  className,
  // Destructure `variant` with a default value of 'default'.
  variant = 'default',
  // Destructure `asChild` with a default value of false.
  // When true, the badge renders as a Slot (merging into its child) instead of a <span>.
  asChild = false,
  // The rest operator `...props` collects all remaining props (like children, onClick, id, etc.)
  // so we can pass them through to the rendered element.
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  // Determine which component/element to render:
  // - If `asChild` is true, use `Slot.Root` from Radix UI. Slot.Root does not create a new
  //   DOM element; instead, it merges all its props (className, data attributes, event handlers,
  //   etc.) into its single direct child element. This is the "composition" pattern.
  // - If `asChild` is false (the default), render a plain HTML <span> element.
  const Comp = asChild ? Slot.Root : 'span'

  // Render the badge element (either a <span> or a Slot).
  return (
    <Comp
      // data-slot="badge" is a custom data attribute used by shadcn/ui for internal
      // component identification. Other components (like CardHeader) can use CSS selectors
      // like `has-data-[slot=badge]` to detect the presence of a badge and adjust layout.
      data-slot="badge"
      // data-variant stores the current variant name as a data attribute on the DOM element.
      // This can be used for CSS selectors like `data-[variant=destructive]:...` to apply
      // conditional styles from parent components.
      data-variant={variant}
      // Build the final className by:
      // 1. Calling badgeVariants({ variant }) to get the base + variant-specific classes.
      // 2. Passing the result and any user-provided `className` to `cn()`, which merges
      //    them intelligently (resolving any Tailwind class conflicts so user overrides win).
      className={cn(badgeVariants({ variant }), className)}
      // Spread all remaining props onto the element. This includes `children` (the badge text/content),
      // event handlers, ARIA attributes, and any other valid HTML attributes.
      {...props}
    />
  )
}

// Export the Badge component so it can be imported and used in other files.
// Also export badgeVariants so other components can reuse the same variant
// class logic if needed (e.g., for styling links to look like badges).
export { Badge, badgeVariants }
