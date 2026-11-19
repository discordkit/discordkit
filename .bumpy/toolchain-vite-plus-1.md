---
---

Moves the workspace toolchain to Vite+ 1.6 (Vite 8.3, Vitest 5.1, tsdown 0.23) and refreshes development dependencies, including msw 3. Tests that need a DOM now run in a real browser through a separate Vitest `browser` project instead of a simulated one. No published package's runtime dependencies, peer ranges or public API change, so nothing is released from this on its own.
