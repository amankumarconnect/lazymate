/**
 * Label Component (shadcn/ui)
 *
 * This file defines a Label component -- a text label used to identify and describe
 * form elements like inputs, checkboxes, selects, etc. Labels are critical for
 * accessibility because they tell screen readers what a form field is for, and
 * clicking on a label can focus or activate its associated form element.
 *
 * This component is part of shadcn/ui and is built on top of Radix UI's Label primitive.
 * Radix UI's Label provides accessible behavior out of the box:
 * - It renders a native <label> HTML element.
 * - It handles the association between the label and its form control (via `htmlFor` or nesting).
 * - It prevents text selection when double-clicking the label (standard label behavior).
 *
 * The component is styled with Tailwind CSS and uses the `cn` utility for class merging.
 */

// Import the entire React library. Required for JSX syntax and TypeScript types.
import * as React from 'react'

// Import the `Label` component from Radix UI and rename it to `LabelPrimitive`.
// We rename it to avoid naming conflicts with our own `Label` component defined below.
// Radix UI's Label is a "primitive" -- a low-level, unstyled, accessible component
// that provides the correct HTML semantics (<label>) and accessibility behavior
// (associating with form controls, preventing text selection on double-click, etc.).
// We wrap it with our own styling to create the final Label component.
import { Label as LabelPrimitive } from 'radix-ui'

// Import the `cn` utility function from the project's local utils file.
// `cn` merges multiple CSS class strings using `clsx` and `tailwind-merge`,
// allowing users to pass custom classNames that properly override defaults.
import { cn } from '@/lib/utils'

/**
 * Label Component
 *
 * An accessible text label for form elements. Built on Radix UI's Label primitive
 * for correct semantics and accessibility.
 *
 * Props:
 * - className (string): Optional additional CSS classes for customization.
 * - ...props: Any props accepted by Radix UI's LabelPrimitive.Root, which includes
 *             all standard HTML <label> props (htmlFor, children, onClick, etc.).
 *
 * The type `React.ComponentProps<typeof LabelPrimitive.Root>` means this component
 * accepts all the same props as the Radix UI Label primitive. This includes standard
 * HTML <label> props like `htmlFor` (to associate with a form control by ID) and
 * `children` (the label text).
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    // Render the Radix UI Label primitive. This creates a native <label> element
    // with built-in accessibility features.
    <LabelPrimitive.Root
      // data-slot="label" is a custom data attribute for shadcn/ui component identification.
      // Other components can use CSS selectors like `has-data-[slot=label]` to detect
      // the presence of a label and adjust their layout accordingly.
      data-slot="label"
      className={cn(
        // === LABEL CLASSES ===
        // Each Tailwind utility class is explained below:
        //
        // 'flex'            - Display as a flex container. This allows the label to contain
        //                     both text and inline elements (like icons or required indicators)
        //                     side by side.
        // 'items-center'    - Vertically center flex children within the label.
        // 'gap-2'           - Add 0.5rem (8px) gap between flex children (e.g., between
        //                     an icon and the label text).
        // 'text-sm'         - Set font size to small (0.875rem / 14px).
        // 'leading-none'    - Set line-height to 1 (no extra vertical spacing above/below text).
        // 'font-medium'     - Set font weight to medium (500) for slight emphasis.
        // 'select-none'     - Prevent text selection on the label. This is standard label
        //                     behavior -- clicking a label should focus/activate its associated
        //                     form control, not select the label text.
        //
        // 'group-data-[disabled=true]:pointer-events-none'
        //                   - If a parent element has `data-disabled="true"` AND that parent
        //                     has the "group" class, disable all pointer events on this label.
        //                     The "group-" prefix is a Tailwind feature that lets child elements
        //                     respond to states on a parent element marked with the "group" class.
        //                     This is used when the form field group is disabled.
        //
        // 'group-data-[disabled=true]:opacity-50'
        //                   - If the parent group is disabled, reduce the label's opacity to 50%
        //                     to visually indicate it is not interactive.
        //
        // 'peer-disabled:cursor-not-allowed'
        //                   - If a sibling element (like an input) with the "peer" class is
        //                     disabled, show the "not-allowed" cursor on this label. The "peer-"
        //                     prefix is a Tailwind feature that lets an element respond to
        //                     the state of a sibling element marked with the "peer" class.
        //
        // 'peer-disabled:opacity-50'
        //                   - If the sibling peer is disabled, reduce this label's opacity to 50%.
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        // Merge any user-provided className, allowing custom overrides.
        className
      )}
      // Spread all remaining props (htmlFor, children, onClick, id, aria-*, etc.)
      // onto the Radix UI Label primitive.
      {...props}
    />
  )
}

// Export the Label component for use throughout the application.
export { Label }
