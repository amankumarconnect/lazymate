// =====================================================================================
// FILE: src/renderer/src/env.d.ts
// PURPOSE: This is a TypeScript reference directive that tells TypeScript to include
//          Vite's client-side type definitions. Without this, TypeScript wouldn't know
//          about Vite-specific features like import.meta.env, CSS module imports,
//          image imports (import logo from './logo.png'), and other Vite conventions.
//
// WHAT IS A TRIPLE-SLASH DIRECTIVE? (for beginners):
//   The "/// <reference types="..." />" syntax is a special TypeScript comment that
//   tells the compiler to include type definitions from a specific package.
//   It's like saying: "Hey TypeScript, please also load the types from 'vite/client'
//   so you know about Vite's special import features."
//
// WHAT TYPES DOES 'vite/client' PROVIDE?
//   - import.meta.env: access to environment variables (VITE_API_URL, etc.)
//   - CSS imports: import styles from './styles.css' (without TypeScript errors)
//   - Asset imports: import logo from './logo.png' (returns the URL string)
//   - The '?asset', '?raw', '?url' import suffixes used by Vite
// =====================================================================================

/// <reference types="vite/client" />
