# Third-party notices

`@discordkit/preview` includes material adapted from the following projects.

## simple-markdown 0.7.3

- Project: https://github.com/Khan/simple-markdown (published on npm as `simple-markdown`)
- Licence: MIT
- Used in: `src/markdown/engine.ts` and `src/markdown/rules.ts`

What was adapted: the parsing algorithm (rules tried in a fixed order at each position, the first match wins, rules sharing an order compete on a quality score, and a rule's parse recurses into its content with threaded state), and the patterns for italic (`em`), bold (`strong`), underline (`u`), escapes, bare URLs, heading closing-hash stripping, inline-code padding, and the list item prefix. The code is a rewrite in TypeScript, not a copy; where a simple-markdown pattern could backtrack catastrophically (links, inline code), it was replaced with a scanner that gives the same result.

```
The MIT License (MIT)

Copyright (c) 2018 Khan Academy, Aria Buckles, Christopher Jeffrey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
