# Third-party notices

`@discordkit/preview` includes material adapted from the following projects.

## Twemoji 17.0.3 (graphics)

- Project: https://github.com/jdecked/twemoji, the maintained continuation of Twitter's Twemoji
- Graphics licence: Creative Commons Attribution 4.0 International (CC-BY 4.0), https://creativecommons.org/licenses/by/4.0/
- Used in: `src/format/emoji.ts`, which names the image for each Unicode emoji

Copyright 2014–2021 Twitter, Inc. and other contributors; copyright 2022–present Jason Sofonia and Justine De Caires. The emoji graphics are licensed under CC-BY 4.0. No graphics are included in this package: when a scene contains a Unicode emoji, the Node renderer downloads that emoji's SVG from the jsDelivr CDN at the pinned release, keeps it in a local cache, and draws it in the rendered image. Images rendered by this package that show emoji therefore include Twemoji graphics, which you may share under the terms of CC-BY 4.0 with this attribution. The file-naming rule (code points in hex, joined by `-`, with U+FE0F dropped outside zero-width-joiner sequences) is Twemoji's, reimplemented here.

## Mirrordown spoiler plugin

- Project: https://github.com/saeris/markdown (`@mirrordown/mdit-spoiler`), by the same author as this package
- Licence: MIT
- Used in: `src/react/Spoiler.tsx` and `src/react/Spoiler.module.css`

What was adapted: the script-free click-to-reveal structure, a label wrapping a visually hidden checkbox and the spoiler's content, revealed by a sibling selector when the box is checked, with the bar redrawn on every wrapped line. The colours and radius are Discord's, not Mirrordown's.

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
