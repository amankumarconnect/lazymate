/**
 * Input Component (shadcn/ui)
 *
 * This file defines a styled text input component. An input is a form element that
 * allows users to enter text, numbers, emails, passwords, and other single-line data.
 * Think of it as a text box where you type your username, email, search query, etc.
 *
 * This component is part of shadcn/ui, a collection of accessible, customizable UI
 * components styled with Tailwind CSS. Unlike the Badge and Button components, the
 * Input does not use cva (class-variance-authority) because it has a single, consistent
 * visual style. It also does not use Radix UI primitives because the native HTML <input>
 * element already provides the needed functionality and accessibility.
 *
 * The Input component simply wraps a native HTML <input> element with carefully chosen
 * Tailwind CSS classes for consistent styling, focus states, validation states, file
 * input styling, dark mode support, and disabled states.
 */

// Import the entire React library. This is needed for JSX syntax (<input>, etc.)
// which compiles to React.createElement calls.
import * as React from 'react'

// Import the `cn` utility function from the project's local utils file.
// `cn` merges multiple CSS class strings using `clsx` (conditional class joining)
// and `tailwind-merge` (resolving conflicting Tailwind classes). This allows users
// to pass a custom `className` prop that cleanly overrides default styles without
// class conflicts (e.g., if the user passes "h-12", it overrides the default "h-9").
import { cn } from '@/lib/utils'

/**
 * Input Component
 *
 * A styled single-line text input for forms.
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization.
 * - type (string): The HTML input type (e.g., "text", "email", "password", "number", "file").
 *                  This is destructured separately so it can be passed explicitly to the
 *                  native <input> element.
 * - ...props: Any other valid HTML <input> attributes (value, onChange, placeholder,
 *             disabled, required, name, id, aria-*, etc.).
 *
 * The type `React.ComponentProps<'input'>` means this component accepts all the same
 * props as a native HTML <input> element, providing full compatibility.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      // Pass the `type` prop to the native <input> element. This determines what kind
      // of data the input accepts (text, email, password, number, file, etc.).
      type={type}
      // data-slot="input" is a custom data attribute used by shadcn/ui for component
      // identification. Parent components can use CSS selectors like
      // `has-data-[slot=input]` to detect the presence of an input and adjust styling.
      data-slot="input"
      className={cn(
        // === MAIN INPUT CLASSES ===
        // Each Tailwind utility class is explained below:
        //
        // 'file:text-foreground'     - When the input type is "file", style the file button's
        //                              text color to use the theme's foreground color.
        // 'placeholder:text-muted-foreground' - Style placeholder text (the hint text shown
        //                                        when the input is empty) in a muted/lighter color.
        // 'selection:bg-primary'     - When the user selects/highlights text in the input,
        //                              use the primary theme color as the selection background.
        // 'selection:text-primary-foreground' - Selected text uses the primary foreground color.
        // 'dark:bg-input/30'         - In dark mode, give the input a very subtle background
        //                              using the input color at 30% opacity.
        // 'border-input'             - Set the border color to the theme's input border color.
        // 'h-9'                      - Set the height to 2.25rem (36px).
        // 'w-full'                   - Make the input take the full width of its container.
        // 'min-w-0'                  - Set minimum width to 0, which prevents the input from
        //                              overflowing its flex container (flexbox items have a
        //                              default min-width of "auto" which can cause overflow).
        // 'rounded-md'               - Apply medium border radius (0.375rem / 6px).
        // 'border'                   - Add a 1px border.
        // 'bg-transparent'           - Make the background transparent (input sits on whatever
        //                              background color is behind it).
        // 'px-3'                     - Horizontal padding of 0.75rem (12px).
        // 'py-1'                     - Vertical padding of 0.25rem (4px).
        // 'text-base'                - Base font size (1rem / 16px) -- important on mobile to
        //                              prevent iOS from zooming into the input on focus.
        // 'shadow-xs'                - Apply an extra-small box shadow for subtle depth.
        // 'transition-[color,box-shadow]' - Smoothly animate color and box-shadow changes
        //                                    (e.g., when focus ring appears).
        // 'outline-none'             - Remove the browser's default outline.
        // 'file:inline-flex'         - For file inputs, display the file button as inline-flex.
        // 'file:h-7'                 - For file inputs, set the file button height to 1.75rem (28px).
        // 'file:border-0'            - For file inputs, remove the file button's border.
        // 'file:bg-transparent'      - For file inputs, make the file button background transparent.
        // 'file:text-sm'             - For file inputs, set the file button text to small size.
        // 'file:font-medium'         - For file inputs, set the file button font to medium weight.
        // 'disabled:pointer-events-none'  - When disabled, prevent all mouse/touch interactions.
        // 'disabled:cursor-not-allowed'   - When disabled, show the "not-allowed" cursor (circle with line).
        // 'disabled:opacity-50'           - When disabled, reduce opacity to 50% to indicate
        //                                    the input is not interactive.
        // 'md:text-sm'               - On medium screens and above, reduce font size to small
        //                              (0.875rem / 14px). On mobile, the base size prevents zoom.
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',

        // === FOCUS-VISIBLE CLASSES ===
        // These classes apply when the input is focused via keyboard navigation
        // (the :focus-visible pseudo-class, not triggered by mouse clicks).
        //
        // 'focus-visible:border-ring'   - Change the border color to the theme's ring color.
        // 'focus-visible:ring-ring/50'  - Add a ring (glow/outline) in the ring color at 50% opacity.
        // 'focus-visible:ring-[3px]'    - Set the ring width to 3 pixels.
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',

        // === ARIA-INVALID CLASSES ===
        // These classes apply when the input has aria-invalid="true", which indicates
        // a form validation error. This provides visual feedback to the user.
        //
        // 'aria-invalid:ring-destructive/20'      - Show a ring in the destructive (red/error)
        //                                            color at 20% opacity.
        // 'dark:aria-invalid:ring-destructive/40'  - In dark mode, increase the ring opacity to 40%
        //                                            for better visibility.
        // 'aria-invalid:border-destructive'        - Change the border to the destructive color.
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',

        // Merge any user-provided className, allowing custom overrides.
        className
      )}
      // Spread all remaining props onto the <input> element. This includes value, onChange,
      // placeholder, disabled, required, name, id, aria-*, and any other valid input attributes.
      {...props}
    />
  )
}

// Export the Input component for use throughout the application.
export { Input }
