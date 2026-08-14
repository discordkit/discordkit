/**
 * Vite resolves `import "./styles.css"` at build time, but TypeScript needs to
 * be told the module exists — otherwise the side-effect import is a TS2882.
 */
declare module "*.css";
