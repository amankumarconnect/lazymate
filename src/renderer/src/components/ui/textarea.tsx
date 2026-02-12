/**
 * Textarea Component (shadcn/ui)
 *
 * This file defines a styled Textarea component -- a multi-line text input field where
 * users can type longer blocks of text. Unlike the single-line Input component, a textarea
 * allows multiple lines and is commonly used for:
 * - Comment boxes
 * - Message fields
 * - Description inputs
 * - Bio or "about me" sections
 * - Any form field that expects more than a single line of text
 *
 * This component is part of shadcn/ui, a collection of accessible, customizable UI
 * components styled with Tailwind CSS. Like the Input component, the Textarea does not
 * use cva (class-variance-authority) because it has a single visual style, and it does
 * not use Radix UI primitives because the native HTML <textarea> element already provides
 * the needed functionality and accessibility.
 *
 * The Textarea simply wraps a native HTML <textarea> element with carefully chosen
 * Tailwind CSS classes for consistent styling, focus states, validation states,
 * dark mode support, and disabled states.
 */

// Import the entire React library. Required for JSX syntax (<textarea>, etc.)
// which compiles to React.createElement calls.
import * as React from 'react'

// Import the `cn` utility function from the project's local utils file.
// `cn` merges multiple CSS class strings using `clsx` (conditional class joining)
// and `tailwind-merge` (resolving conflicting Tailwind utility classes). This allows
// users to pass a custom `className` prop that cleanly overrides default styles
// without class conflicts.
import { cn } from '@/lib/utils'

/**
 * Textarea Component
 *
 * A styled multi-line text input field for forms.
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization.
 * - ...props: Any valid HTML <textarea> attributes (value, onChange, placeholder,
 *             disabled, required, rows, cols, name, id, aria-*, etc.).
 *
 * The type `React.ComponentProps<'textarea'>` means this component accepts all the same
 * props as a native HTML <textarea> element, providing full compatibility.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      // data-slot="textarea" is a custom data attribute used by shadcn/ui for component
      // identification. Parent components can use CSS selectors like
      // `has-data-[slot=textarea]` to detect the presence of a textarea and adjust styling.
      data-slot="textarea"
      className={cn(
        // === TEXTAREA CLASSES ===
        // Each Tailwind utility class is explained below:
        //
        // 'border-input'             - Set the border color to the theme's input border color.
        // 'placeholder:text-muted-foreground' - Style placeholder text (the hint text shown
        //                                        when the textarea is empty) in a muted/lighter color.
        // 'focus-visible:border-ring' - When focused via keyboard navigation, change the border
        //                               color to the theme's ring color.
        // 'focus-visible:ring-ring/50' - Add a focus ring using the theme's ring color at 50% opacity.
        // 'aria-invalid:ring-destructive/20'      - If aria-invalid="true" (validation error),
        //                                            show a red ring at 20% opacity.
        // 'dark:aria-invalid:ring-destructive/40' - In dark mode, increase the invalid ring
        //                                            opacity to 40% for better visibility.
        // 'aria-invalid:border-destructive'       - If invalid, change the border to red.
        // 'dark:bg-input/30'         - In dark mode, give a subtle background using the
        //                              input color at 30% opacity.
        // 'flex'                     - Display as a flex container (allows additional layout control).
        // 'field-sizing-content'     - A newer CSS property that makes the textarea automatically
        //                              resize to fit its content. This means the textarea grows
        //                              taller as the user types more text, rather than showing
        //                              scrollbars. Browser support may vary.
        // 'min-h-16'                 - Set minimum height to 4rem (64px), ensuring the textarea
        //                              is at least a few lines tall even when empty.
        // 'w-full'                   - Take the full width of the parent container.
        // 'rounded-md'               - Apply medium border radius (0.375rem / 6px) for
        //                              slightly rounded corners.
        // 'border'                   - Add a 1px border.
        // 'bg-transparent'           - Make the background transparent by default.
        // 'px-3'                     - Horizontal padding of 0.75rem (12px).
        // 'py-2'                     - Vertical padding of 0.5rem (8px).
        // 'text-base'                - Base font size (1rem / 16px) -- prevents iOS zoom on focus.
        // 'shadow-xs'                - Apply an extra-small box shadow for subtle depth.
        // 'transition-[color,box-shadow]' - Smoothly animate color and box-shadow changes
        //                                    (e.g., focus ring appearing/disappearing).
        // 'outline-none'             - Remove the browser's default outline.
        // 'focus-visible:ring-[3px]' - Set the focus ring width to 3 pixels.
        // 'disabled:cursor-not-allowed' - When disabled, show the "not-allowed" cursor.
        // 'disabled:opacity-50'      - When disabled, reduce opacity to 50% to visually
        //                              indicate the textarea is not interactive.
        // 'md:text-sm'               - On medium screens and above, reduce font size to
        //                              0.875rem (14px). On mobile, the larger base size
        //                              prevents iOS from auto-zooming into the field.
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        // Merge any user-provided className, allowing custom overrides.
        className
      )}
      // Spread all remaining props onto the <textarea> element. This includes value,
      // onChange, placeholder, disabled, required, rows, cols, name, id, aria-*,
      // and any other valid textarea attributes.
      {...props}
    />
  )
}

// Export the Textarea component for use throughout the application.
export { Textarea }
