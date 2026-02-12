// =====================================================================================
// FILE: src/renderer/src/lib/utils.ts
// PURPOSE: Utility functions used across the React application. Currently contains
//          the `cn()` function — a helper for merging Tailwind CSS class names.
//
// WHY IS cn() NEEDED? (for beginners):
//   When using Tailwind CSS, you often need to:
//   1. Combine multiple class strings: cn('text-red', 'bg-blue') → 'text-red bg-blue'
//   2. Handle conditional classes: cn(isActive && 'bg-blue', 'text-sm')
//      → 'bg-blue text-sm' (if isActive is true) or 'text-sm' (if false)
//   3. Resolve Tailwind conflicts: cn('p-4', 'p-2') → 'p-2'
//      Without cn(), both 'p-4' AND 'p-2' would be applied, causing unpredictable results.
//      cn() intelligently keeps only the LAST conflicting class.
//
// This is a very common pattern in React + Tailwind projects. You'll see cn() used in
// almost every component to construct their className props.
// =====================================================================================

// clsx: a tiny utility library that constructs className strings from various inputs.
// It handles: strings, objects, arrays, conditionals, and falsy values.
// Examples:
//   clsx('foo', 'bar')            → 'foo bar'
//   clsx('foo', false && 'bar')   → 'foo'
//   clsx({ active: true })        → 'active'
//
// ClassValue: the TypeScript type for any valid input to clsx
// (string, number, boolean, object, array, null, undefined)
import { clsx, type ClassValue } from 'clsx'

// twMerge: tailwind-merge — a utility that intelligently merges Tailwind CSS classes.
// It knows which Tailwind classes conflict with each other and keeps only the last one.
// Examples:
//   twMerge('p-4 p-2')          → 'p-2'    (p-2 overrides p-4)
//   twMerge('text-red text-blue') → 'text-blue' (text-blue overrides text-red)
//   twMerge('px-4 py-2 p-3')    → 'p-3'    (p-3 overrides both px-4 and py-2)
import { twMerge } from 'tailwind-merge'

// =====================================================================================
// FUNCTION: cn(...inputs)
// PURPOSE: Combines clsx (conditional class joining) + twMerge (Tailwind conflict resolution)
//          into one convenient function. This is the standard way to handle className props
//          in React components that use Tailwind CSS.
//
// HOW IT WORKS:
//   1. clsx() takes all the inputs and produces a single space-separated class string
//      (handling conditionals, arrays, objects, and falsy values along the way)
//   2. twMerge() takes that class string and resolves any Tailwind conflicts
//      (e.g., if both 'p-4' and 'p-2' are present, only 'p-2' survives)
//
// USAGE EXAMPLES:
//   cn('text-sm', 'font-bold')                    → 'text-sm font-bold'
//   cn('p-4', isActive && 'bg-blue-500')          → 'p-4 bg-blue-500' or 'p-4'
//   cn('text-red-500', className)                 → merges component's default + user's custom classes
//   cn('p-4', 'p-2')                              → 'p-2' (conflict resolved!)
//
// PARAMETERS:
//   - ...inputs: any number of ClassValue arguments (strings, booleans, objects, arrays, etc.)
// RETURNS: a single, clean, conflict-resolved class name string
// =====================================================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
