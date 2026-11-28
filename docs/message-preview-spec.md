# Spec — `@discordkit/preview`, a Discord message renderer that agents can drive

> Status: **Draft, awaiting review** · Owner: Drake Costa · Spec dated 2026-11-24
>
> Scope of v0: **render a message payload to a PNG that matches the Discord web client**, from a Node API and a CLI, for the component set Inbou and Tome actually use. The interactive editor comes after the renderer is proven.
>
> Package and binary names in this document are proposals. Nothing has been published.
>
> Progress is tracked in the slice table in §13. Sections marked "as built" (§4a, §6a) record what an implemented slice established, and take precedence over the proposal text around them.

## 1. Goal

Close the review loop on Discord message design. Today an agent can build a message payload and validate it, but it cannot see it. Every layout decision in Inbou and Tome was made by posting to a dev channel and waiting for a human to send screenshots back.

The tool has three audiences, in priority order:

1. **Agents and test suites.** Payload in, PNG out, with lint findings alongside. No bot token, no channel, no command re-registration.
2. **Developers at a terminal.** The same thing as a CLI, plus generated code for a payload.
3. **Humans designing a message.** An interactive editor in the spirit of [message.style](https://message.style/features/components-v2), editing the same document the CLI reads.

The requirement that outranks the rest: **the preview must match how Discord really renders the message**. An approximate previewer already existed (Inbou's review page had a hand-rolled one) and it did not remove the live play test.

Non-goals for v0: sending messages, saved-message storage, an MCP server, polls, reactions, replies, threads, forwarded messages, and pixel parity with the native mobile apps. The design must not preclude them.

## 2. Key findings that shaped this design

Each finding says how it was established. "Read" means the source was read directly while writing this spec. "Reported" means a research pass reported it and it has not been independently re-checked.

1. **The pain was visual, never structural** (reported, from both repos' history and session notes). What kept changing: which lines are `##`, `###` or `-#`; one card or several; gallery size and crop by item count; desktop versus mobile; button label shape; what a card looks like after it is edited closed. Validation caught none of it. → The renderer is the product. The editor is a client of it.

2. **Both bots author messages as plain object literals** typed against `@discordkit/client` (`ComponentType.Container`, `ButtonStyle.Secondary`, `MessageComponent`), inside pure render functions that already run in plain Node (reported). → Generated code is an object literal in that style. No builder API is needed, and the tool takes the payload those functions return.

3. **`@discordkit/client` models every component type as a valibot schema, in camelCase** (`customId`, `accentColor`); the request layer converts to snake_case on send (reported; schema files read). There are no builders, no markdown or formatting helpers, no renderer, and no package with a `bin`. → The tool accepts both key styles and normalises to the camelCase input shape. That shape is the document; there is no third model.

4. **Four schema defects block the tool** and are fixed first (§11). Three were confirmed by reading the source, one by reading the schema and its comment.

5. **No existing renderer is fit to depend on** (reported, with licences checked):
   - `@skyra/discord-components` (MIT): no Components V2, pre-refresh styling, maintenance mode.
   - message.style / `embed-generator` (MIT): dark only; measurements differ from Discord's (13px text and 8px/12px container padding where Discord uses 14px and 16px); its maintainer's open issue describes its markdown as not matching Discord.
   - Discohook (AGPL-3.0): the most accurate established preview and the best record of per-context markdown rules. It can be read as a reference. Its code cannot be copied into this MIT repo.
   - `Kyzegs/discord-preview` (MIT): covers every component including modals and agreed with Discord's CSS wherever it was cross-checked, but it was created on 2026-11-18 by one contributor. Useful as a checklist of values to verify, not as a dependency.

6. **Discord's production stylesheets are public and are the measurement source** (reported; a copy from stable build 679963 was fetched without login). They contain the real rules for container, section, separator, thumbnail, text sizing, the media mosaic, embeds and buttons, and colour tokens for four themes. Class names are hashed and change per build, so extraction matches on rule shape. → Values are taken as facts into our own stylesheet. Discord's files are never committed.

7. **CSS cannot answer two things.** Layout that Discord decides in JavaScript (which mosaic grid for N gallery items, image upscaling) needs the live client: Tome's docs had to retract three inferred conclusions about exactly this. And the native mobile apps are React Native, so there is no stylesheet to read at all. → Live-client calibration is part of the plan (§7), and native mobile parity is out of v0.

8. **gg sans cannot be shipped.** Discord states the font is not open source. Discord's own first Latin fallback is Noto Sans (OFL). → Bundle Noto Sans; accept a developer-supplied gg sans by path, the same bring-your-own pattern as the Social SDK binary.

9. **The toolchain already supports what this needs** (read in `node_modules/vite-plus/docs`): `vp pack` bundles CSS Modules with no extra dependency, and Vitest 5 browser mode provides `toMatchScreenshot`. `playwright`, `react`, `react-dom` and `react-aria-components` are in the yarn catalog. → No new build tooling. What is unproven is the output shape of CSS Modules under this repo's `unbundle: true` pack config, and importing that output from Node for server rendering. Slice 1 proves it before anything is built on it.

10. **Discord's brand guidelines forbid copying or imitating the app's look and feel.** A faithful renderer is in tension with that wording; every comparable tool does it anyway. → Own stylesheet, no Discord fonts or icons shipped, a non-affiliation notice, and a third-party notices file. This is a risk the owner has accepted by asking for fidelity, not a legal opinion.

## 3. Decisions

Made by the owner on 2026-11-24:

| Decision     | Choice                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Styling      | CSS Modules for both the renderer and the editor. This is a new convention in this repo, whose examples use Tailwind v4.                                                                                                                         |
| Font         | Noto Sans by default, with a bring-your-own path for gg sans.                                                                                                                                                                                    |
| Ground truth | Screenshots of the real client, taken by the owner, of test messages posted by a bot. Nothing drives the owner's account: on 2026-11-27 the earlier idea of reading styles from a logged-in browser session was withdrawn (see §7, Calibration). |
| Build order  | Renderer and CLI first, on Inbou's and Tome's component subset; then wider coverage; then the editor.                                                                                                                                            |

Made in this spec, open to challenge:

- **One published package with subpaths**, not several packages. It matches the repo's "import only what you need" exports and avoids versioning four packages that change together.
- **The document is the Discordkit request body.** Validation uses the same schemas the client sends with, so preview and send cannot drift.
- **Rendering is server-side React into headless Chromium.** No dev server, no app to boot, and the editor's preview is the same component.
- **Markdown is our own rule set on our own small engine that follows simple-markdown's algorithm**: rules sorted by a fixed order, the first rule whose `match` succeeds at the current position wins, and its `parse` recurses. That is the engine Discord's clients are built on, so rule-ordering quirks come out the same way. We do not depend on the package itself: `@khanacademy/simple-markdown` 4.0.3 (checked on npm, 2026-11-25) declares React 18 as a peer and pulls in a Perseus utility package, which would put React into a subpath meant to run anywhere and conflicts with this repo's React 19; the original `simple-markdown` 0.7.3 has not been released since 2022. The engine core is small, and owning it gives a typed AST.
  - **Considered and not used as the parser: Mirrordown** (`@mirrordown/mdit-spoiler` and siblings, the owner's own plugins for markdown-it, remark and Sätteri). Its `||spoiler||` pairing is a port of markdown-it's emphasis delimiter algorithm, so it inherits CommonMark's flanking rules and paragraph splitting. Run on markdown-it 14.2 with `breaks`, no HTML and `linkify`: `|| spaced ||` and a spoiler or bold span across a blank line stay literal, `**テスト。**テスト` and `これは**「重要」**です` stay literal, `__x__` is bold, a line after `> quote` joins the quote, blank lines collapse, `####` is a heading and `---` is a rule. Discord differs on each (the quote and underline cases were observed in the client; the rest are to confirm in calibration). Matching Discord would mean replacing most of the host engine's rules. Mirrordown is reused where it fits: the spoiler's rendered treatment (script-free click to reveal, a bar per wrapped line, blurred images with a pill) in the renderer, and its spoiler edge cases as calibration inputs.
- **Design tokens keep Discord's own names** (`--space-8`, `--radius-sm`, `--background-surface-high`). A value's provenance is then a one-line lookup, and a re-extraction after a Discord redesign is a diff of one file.

## 4. Architecture

```mermaid
flowchart LR
  subgraph inputs[Inputs]
    P[Payload JSON<br/>camelCase or snake_case]
    S[Scene file]
    F[Render function<br/>called from a spec]
  end

  subgraph pkg["@discordkit/preview"]
    N[normalise + validate<br/>client schemas]
    L[lint<br/>cross-tree limits]
    M[markdown<br/>parser to AST]
    R[React renderer<br/>CSS Modules + tokens]
    C[codegen<br/>typed object literal]
    A[Node API<br/>SSR + Playwright]
  end

  subgraph out[Outputs]
    PNG[PNG / HTML]
    J[Findings as JSON]
    TS[TypeScript source]
  end

  P --> N
  S --> N
  F --> N
  N --> L --> J
  N --> R
  M --> R
  R --> A --> PNG
  N --> C --> TS

  CLI[discordkit-preview CLI] --> A
  CLI --> L
  CLI --> C
  ST[Studio editor] --> R
  ST --> L
  ST --> C
```

Proposed subpaths, each independently importable:

| Subpath                        | Contents                                                                       | Runtime                  |
| ------------------------------ | ------------------------------------------------------------------------------ | ------------------------ |
| `@discordkit/preview/scene`    | Scene types, normalisation, snake_case intake                                  | Any                      |
| `@discordkit/preview/markdown` | Parser, AST types, per-context rule sets                                       | Any                      |
| `@discordkit/preview/lint`     | Findings for limits and rules the schemas do not enforce                       | Any                      |
| `@discordkit/preview/codegen`  | Payload to TypeScript source                                                   | Any                      |
| `@discordkit/preview/react`    | `<Scene>`, `<Message>` and per-component React components, plus the stylesheet | Browser, SSR             |
| `@discordkit/preview/node`     | `renderScene()` to PNG or HTML                                                 | Node, needs `playwright` |

`playwright` is an optional peer dependency, needed only by `/node` and the CLI.

### 4a. What the pipeline proof established

Slice 1 built a container holding one text display, rendered it to a PNG from plain Node in all four themes, and tested it in the browser project. Observed, not assumed:

- **`vp pack` compiles each CSS Module to a scoped stylesheet and a separate class-name map, and the JavaScript does not import the CSS.** That is what lets plain Node import the React subpath and server-render it. Turning on CSS injection breaks it: Node cannot import a `.css` file.
- **The package ships one stylesheet, `dist/styles.css`.** A `build:done` hook joins the per-module files in path order. This is the one deviation from the shared pack config; the built-in single-file option produced a different rule order on every build.
- **A bundler consumer imports the stylesheet explicitly**, with `import "@discordkit/preview/react/styles.css"`. Without it no CSS arrives.
- **The Node API works from the built package only.** There is no compiled CSS under `src`, so it fails with a message saying to build first. The package's own Node spec imports from `dist`. Consumers install a build, so this only affects this repo's tests.
- **Renders are byte-identical across runs.** Fonts are served from disk through a route handler and every other request is refused, so a render never touches the network.
- **A render costs about 5 seconds cold, of which about 3 is launching Chromium, and 160 to 300 ms with a browser reused.** `renderScene` accepts a `browser`, and the CLI and any batch mode must reuse one.
- **The package cannot be published to JSR.** A dry run fails on the first CSS Module import: JSR publishes source and accepts only JavaScript and TypeScript modules. It ships to npm only.
- **The React lint preset is applied from a root override.** `vp check` reads only the root lint block, so a per-package merge never runs.

## 5. The scene

A bare payload is enough to render one message. A scene adds what the payload does not carry: who sent it, what its mentions resolve to, what time it is, and what else is in the channel.

```ts
interface Scene {
  /** One or more messages, drawn top to bottom as they would stack in a channel. */
  messages: SceneMessage[];
  /** What mentions, emoji and attachments resolve to. Unresolved ids render the way Discord shows unknowns. */
  context?: {
    users?: Record<string, { name: string; avatar?: string; bot?: boolean }>;
    roles?: Record<string, { name: string; color?: number }>;
    channels?: Record<string, { name: string; type?: number }>;
    emoji?: Record<string, { name: string; url: string; animated?: boolean }>;
    attachments?: Record<string, { path: string; size?: number }>;
  };
  /** Fixed clock, zone and locale, so `<t:…:R>` and the header's "4:05 PM" are the same on every machine. */
  now?: string;
  timeZone?: string;
  locale?: string;
  theme?: "light" | "ash" | "dark" | "onyx";
  /** Width of the chat column in CSS pixels. */
  width?: number;
}

interface SceneMessage {
  /** The body you would pass to `createMessage`: content, embeds, components, flags. */
  payload: MessagePayload;
  author?: string; // key into context.users
  ephemeral?: boolean; // "Only you can see this"
  edited?: boolean;
}
```

Sequences matter because several iterations in both bots were about state after an edit: a closed card with disabled buttons and a different accent colour, a countdown that should have stopped. Rendering "open" and "closed" as two messages in one scene shows both in one image.

As built in slice 3b, a payload may be classic instead of Components V2: `content`, `embeds` and action rows, with `components` optional. A message is treated as V2 when the flag is set or it holds any component other than an action row, and a V2 message that also carries content or embeds is an error that says why. `context.skus` gives Premium buttons their product name and price. An author with no avatar gets a neutral one drawn locally (a coloured circle with an initial), so a bare payload needs no network except for emoji and no image carries Discord's logo unless a scene asks for one.

As built in slice 3a, the scene type also has: `timestamp` on a message (the header needs a send time, and Discord groups consecutive messages by author and time), `verified` on a user (the check mark on the app tag), and `revealSpoilers` on the scene. `now` defaults to a fixed instant, the zone to UTC and the locale to en-US, so a scene that sets none of them still renders the same everywhere.

Two properties of `width` and `locale` that are easy to miss:

- **`width` is the chat column, not the card.** A 600px column leaves 504px for a card after the avatar inset and the right padding.
- **`locale` chooses the CJK font stack, as it does in Discord.** With en-US, Japanese text on a Windows machine falls back per glyph and can mix a Japanese font for kana with a Chinese one for kanji; with `ja` it renders in one Japanese face. A bot whose users run Discord in Japanese should preview with `locale: "ja"`.

Theme names follow Discord's settings UI. The mapping to the stylesheet's classes (`ash` → `.theme-dark`, `dark` → `.theme-darker`, `onyx` → `.theme-midnight`) is inferred from token values and is confirmed during calibration.

## 6. Markdown

A parser from Discord-flavoured markdown to a typed AST, with no React dependency, so lint and length checks can use it too.

Rule sets differ by context and are data, not branches:

| Context                                                | Rule set                                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Message content, text display, embed description       | Full                                                                                      |
| Embed field value                                      | Full, minus headings                                                                      |
| Embed title, embed field name, embed author and footer | Reduced: inline styles, inline code, links, spoilers, timestamps, channel mentions, emoji |

That table comes from Discohook's rule map (reported) and is verified against the live client in calibration before it is treated as fact.

The acceptance tests are the quirks that cost real iterations in Inbou and Tome:

- A heading styles one line; the next line is body text.
- `-#` without its trailing space renders literally.
- A block quote ends at a newline unless every line carries `>`; `>>>` runs to the end.
- Bold inside a heading is not visibly bold, because the heading already is.
- `__text__` is underline and `_text_` is italic.
- A masked link wrapped as `[label](<url>)` suppresses the link preview.
- A user mention does not resolve inside an embed title.
- `<t:N:R>` renders relative to the scene clock, and all nine style letters (`t T d D f F s S R`) are covered.
- Custom emoji render as images, including on buttons, and a message of only emoji renders them at jumbo size.

Syntax highlighting in fenced code blocks is deferred: neither bot uses code blocks.

### 6a. As built (slice 2)

- `parseMarkdown(source, context)` returns a `MarkdownNode[]`: one union over `type` that a renderer switches over exhaustively. Ids are never resolved in the AST.
- Chat text is one inline run with no paragraphs. Every newline is its own node, so blank lines survive. Headings, subtext, quotes and lists check that they start a line.
- The engine is "first match in rule order wins", plus one more load-bearing piece taken from simple-markdown: italic, bold and underline share an order and compete on a quality score, which is what decides `***x***`.
- No rule decides whether a delimiter can open or close by classifying its neighbours, except the underscore forms. Anything above U+00C0 is plain text, so full-width punctuation can never be a delimiter. This is what makes `**テスト。**テスト` bold.
- Two of simple-markdown's patterns (links and inline code) can backtrack catastrophically and were replaced with single-pass scanners. The parser never throws, and recursion stops at depth 32.
- **160 behavioural cases exist as data, each with a provenance: 12 observed in the client, 25 from Discord's documentation, 123 assumed.** The assumed ones follow from the algorithm but nobody has checked them in the client. Calibrating them is the largest piece of unverified behaviour left. It cannot be done by reading the client's DOM from a session an agent controls (see §7, Calibration); it is done from screenshots of the cases posted to a channel, or from a copy of the page the owner saves themselves.
- Most doubtful assumptions, to check first: embed footers and author names may render no markdown at all (§6 puts them in the reduced set); whether `||text\||` is a spoiler; whether `# I love C#` drops its trailing hash; where a list ends; whether a bare URL balances parentheses.
- Not implemented: the game-profile mention `<@$GAME_ID>` from Discord's formatting reference. It parses as text.

## 7. Fidelity

### Sources of truth, in order

1. **The live web client**, measured: computed styles for a fixed fixture set, in each theme.
2. **Discord's shipped stylesheets**, extracted by rule shape. Authoritative for anything static.
3. **The official component reference**, for limits, nesting rules and defaults. It gives no dimensions.
4. Other renderers, as checklists of what to verify. Never as a source of a number.

A script fetches the public stylesheets into a gitignored cache, the same arrangement as `scripts/docs/fetch.ts` and `.discord-docs/`. What gets committed is a values table with provenance (build number, rule, date), not Discord's CSS.

Values already extracted from build 679963 (reported), to seed slice 1:

| Component           | Rule                                                                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container           | Surface-high background, 1px subtle border, 8px radius, 16px padding, 8px gap between children; accent is a 4px bar drawn as a pseudo-element on the leading edge                                                            |
| Top level (V2)      | 8px row gap, max width `min(600px, 100%)`                                                                                                                                                                                    |
| Text in a container | 0.875rem, line height `1.375rem × 0.875`; subtext 0.75rem; a heading with nothing before it has no top margin, and one with no element after it has no bottom margin (so a heading followed only by plain text loses it too) |
| Separator           | 1px line in `--background-mod-strong`; small spacing adds nothing beyond the container's gap, large spacing adds 8px above and below                                                                                         |
| Section             | 12px between text and accessory, 4px between text rows; a button accessory is capped at half the width less 12px                                                                                                             |
| Thumbnail           | 85px square, 8px radius, cover fit                                                                                                                                                                                           |
| Media gallery       | 4px grid gap, 2px item radius, 8px outer radius, max height 350px, max width 600px                                                                                                                                           |
| Button              | 32px tall, 60px minimum width, 3px by 11px padding, 18px line height                                                                                                                                                         |
| Action row          | Wrapping row, 8px gap                                                                                                                                                                                                        |
| Embed               | Surface-high background, 1px border, 4px leading colour bar, 4px radius; padding 2px top, 16px right, 16px bottom, 12px left; 8px field gap                                                                                  |

### Media gallery layouts, as built (slice 3b)

Which layout Discord uses for N items is decided in its JavaScript. The mapping is one data table in `format/galleryLayout.ts`, each entry carrying its evidence, so calibration corrects it by editing the table. Corrected after the first calibration (§7b); the table below is the corrected one.

| Items   | Layout drawn                                                                                                                                                                                                                | Evidence                                                                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | The picture at its file's own size, never scaled up, scaled down (keeping its shape) to the column's width and 350px tall. The gallery, and so a container holding it, is only as wide as the picture                       | Desktop captures: 88×64, 128×128 and 256×144 files at their own size, a wide picture at the container's width, a tall one 350px tall                                 |
| 2       | Each picture at its own size, 4px apart, at most 280px tall; a pair wider than the column shrinks in proportion to the pictures' widths; different shapes keep their shapes, top-aligned. The container shrinks to the pair | Desktop captures of two 256×144 files only. Large and mixed pairs are unobserved: the 280px cap is the stylesheet's, and the shrinking and top alignment are choices |
| 3       | One picture taking two thirds of the width beside two stacked, filling the width                                                                                                                                            | iOS captures only (one 181pt square beside two 88pt squares in a fixed box); the desktop drawing is unobserved                                                       |
| 4       | A 2 by 2 grid of equal rows filling the width, at most 350px tall, so square pictures become wide tiles                                                                                                                     | Desktop captures: 16:9 pictures as 281.6×158.4px tiles in a 600px container; 32px icons scaled up to rows 172.8px tall                                               |
| 5 to 10 | Rows of three squares, with the remainder (one or two pictures) in a band on top, filling the width                                                                                                                         | Inferred from the stylesheet's grid classes; no capture on either client                                                                                             |

A picture's aspect ratio comes from the payload's `media.width` and `media.height` when given, as Discord's API returns them, and otherwise from the image once it loads.

### Sections, thumbnails, files, selects and spoilered containers, as built (slice 6)

Every component a message can hold is now drawn; only the modal components refuse. `supportedComponents` gained two positions, a section's text (`section`) and its accessory (`accessory`), so lint and the renderer still read one list.

- **Section and thumbnail.** The values in the table above were re-read from build 679963 and hold. The stylesheet also has `.verticallyCenterAlign_*`, which centres the text against a taller accessory; when the client adds it is decided in JavaScript, so it is not drawn and the text starts at the top.
- **File.** Drawn as Discord's attachment row (`.fileWrapper_*` and `.file_*`: up to 432px, 16px padding, surface background, subtle border, 8px radius, the low shadow, a 30 by 40 icon 8px before the text, the name in the link colour). The icon is our own drawing. The name is the payload's `name`, else the `attachment://` reference's; the size is the payload's `size`, else `context.attachments[name].size`. With neither, only the name is drawn: the preview shows nothing it does not know, and the row keeps its height because the icon sets it. The renderer does not read file sizes from disk.
- **Selects.** Discord's message select (`.select_*` at 400px wide, `.optionTag_*`, `.labelContainer_*`, `.description_*`, `.offset_*`) sits on its older general select (`.select_*`, `.option_*`, `.popout_*`, `.optionPill_*`, `.multiSelectCheckbox_*`), not on the newer design-system select field, which the build also ships. That older select no longer defines its closed box's fill and border; they are taken from Discord's input field (`--input-background-default`, a 1px `--input-border-default`, 8px radius). Chosen values are drawn by count: `maxValues` above 1 draws a string select's defaults as tags and the other selects' as pills; otherwise the first default is drawn on its own. Default users, roles and channels resolve through `context` as mentions do.
- **The open select is scene data.** `SceneMessage.openSelect` names a String Select by `customId`. The list is drawn outside the card, as the client's popout layer is, and placed with CSS anchor positioning against the closed control, so the card's `overflow: hidden` does not clip it. The Node renderer grows the scene's bottom padding until the list fits in the screenshot. Lint reports an `openSelect` that names nothing or a non-string select (`open-select-missing`), and the renderer refuses it with the same reason. A later slice that draws other overlays (a modal, a menu) can reuse the `data-discordkit-preview-overlay` marker the renderer measures.
- **Spoilers.** A spoilered container, thumbnail or file shares one cover (`SpoilerCover`): the content blurred by 44px over `--spoiler-hidden-background`, an 8px-radius clip, and the gallery's "Spoiler" pill, revealed by the scene's `revealSpoilers` or a click. On an 85px thumbnail the pill fills the width and is clipped at its ends with Noto Sans, as Discord's own `overflow: hidden` would clip it.
- **New lint rules**, each checked against the live component reference on 2026-11-25: `section-component-count`, `file-not-attachment`, `select-option-count`, `select-option-label-length`, `select-option-value-length`, `select-option-description-length`, `select-placeholder-length`, `select-values-range`, `select-default-count` and `open-select-missing`.
- **Waiting on #106.** The client's schemas reject a select in an action row's array and a File without `name` and `size`. Fixtures are written the way Discord expects, so intake reports `schema` errors for them; the specs that read them assert everything else and say so.

### 7b. First calibration against real captures (2026-11-25)

The first check of the renderer against the real client, using 91 screenshots the owner took while developing Tome and Inbou: 50 of real desktop messages, 14 of the real iOS app, and the rest reference art. They are private and are kept out of the repository, in a locally ignored `.discord-reference/captures/` with a catalogue. What follows are measurements, which are facts about Discord and contain nothing private.

How they were read. Every client capture is the dark theme. Desktop captures are crops at 1.0 or 1.25 image pixels per CSS pixel, with each one's scale derived from a button's 32px height or an avatar's 40px. The phone is an iPhone 14 Pro (393 by 852 points); its captures were downscaled when attached, so each set's scale was derived from its width. Greys in the desktop captures read true, but saturated colours are shifted, so reds, greens and blurple must not be calibrated from them.

#### Desktop: confirmed as drawn

Container (16px padding, 8px radius, 8px gap, a 4px accent bar inside the padding, shrinking to its content); separator; buttons (32px tall, 60px minimum width, 8px gap, 8px radius, 1px border, disabled colours); text in a container (h2 at 20px, body at 14px); classic embeds line by line (4px bar, 12px inset, every text line within 1px, content-sized inline field columns); the mention pill's colours and padding (its height was 1px too tall, as item 7 explains); `@unknown-user` for an uncached user; the app tag and the 40px avatar; the four-item gallery; 8px between grouped messages; and a mention in an embed title staying literal.

#### Desktop: wrong, most consequential first (fixed in slice 9a)

1. **A single gallery picture is drawn at the file's own size, not scaled up.** An 88 by 64 file is 88 by 64px; large pictures do scale down, to the container's content width (566px in a 600px container) and to 350px tall (a tall page was 223 by 350px), left-aligned. The renderer scaled small pictures up; it now draws the file at its own size and scales down under both caps. A picture whose size is neither in the payload nor loaded is drawn as a 350px square, as before (unobserved).
2. **A container holding a one- or two-item gallery shrinks to it.** The renderer forced the container to the full width; a one- or two-item gallery is now only as wide as its pictures, so the container shrinks to it unless something else in it is wider. A four-item gallery does fill 600px, and still does. Galleries of three and of five to ten still fill the width, which no desktop capture shows.
3. **A pair of small pictures is drawn at their own size, 4px apart** (two 256 by 144 files in a 550px container). The renderer shared the full width between them; it now draws each at its own size. A pair of large or mixed pictures has not been captured, so what the renderer does with one is a choice, marked as such in `format/galleryLayout.ts`: each picture at most 280px tall (the stylesheet's cap for a pair), a pair wider than the column shrinking in proportion to the pictures' widths, and pictures of different shapes keeping their shapes, top-aligned, rather than one being cropped to the other's height. The two bands of two in galleries of five and eight still fill the width.
4. **The message header shows only the time for a message sent today** ("2:57 PM"), in every capture across four months. The renderer said "Today at …"; it now writes the time alone. For an older message it writes a short date and the time ("4/20/21, 4:20 PM"), as the iOS app does, since no desktop capture shows one; for the day before it still says "Yesterday at …", which no capture shows. An embed footer's time is unchanged ("Today at …"), and also uncaptured.
5. **The chat background in the dark theme is `#1a1a1e`.** The renderer used `#121214`, which in the real client appears only outside the chat column. The error carried into everything blended over it, such as the ephemeral row and a secondary button drawn on the chat. The stylesheet explains it: `.chatContent_*`, the message column, paints `--background-base-lower`, and only `.chat_*` around it paints `--background-base-lowest`. `--background-base-lower` is `#1a1a1e` in `.theme-darker` and in no other theme, which also confirms that the theme the owner calls Dark is `.theme-darker`. The renderer now paints the chat with `--background-base-lower` in every theme: `#fbfbfb` in light, `#323339` in ash, `#000000` in onyx. Those three are unverified, as is the ash and onyx mapping.
6. **"(edited)" on a Components V2 message sits below the components**, at their leading edge with no space before it, its ink 12 to 13px under the container; its baseline is 19px under the container's bottom edge, and a following message in the same group starts 32px under that edge (8px without the mark). The renderer drew it between the header and the first container; it now draws it under the components, matching all three measurements at 1×. The rule Discord draws it with was not found, so the line's 1px of padding above and below is ours, fitted to the captures.
7. **The inline timestamp chip is 18px tall, not 19, and so is the mention pill.** Rows of fallback-font characters (the bar-chart blocks) are 19.25px apart in the client and were 20 in the renderer at 1×, which changes a card's height. Two causes, both fixed:
   - The chip and pill are inline boxes whose height is the font's ascent plus descent. Noto Sans's (1.069em and 0.293em) gave 19px at 14px; the captures put the baseline 14px below the chip's top and 4px above its bottom at 1×, and 18 and 6 device pixels at 1.25×, which Chromium gets by rounding each separately. The bundled Noto Sans is now declared with gg sans's metrics as measured (`ascent-override: 101.8%`, `descent-override: 31.8%`, the middle of the range all three captures allow), in the Node renderer and in Studio. Every chip, pill and hidden spoiler is now 18px at 14px. Glyph shapes and widths still differ.
   - The rows did not grow because of the block characters, which come from a fallback font but cannot change a line whose height is fixed. They grew because each row holds inline code. Discord gives inline code an 18px line height, which fits inside the line with gg mono; the code font that stands in for it is whatever the machine has (Consolas here), whose metrics sit that 18px box lower, so it reached below the line and pushed every row to 20px. Inline code now has a line height of 0, which paints the same and never changes a line's height, so rows holding code are 19.25px apart on any machine. The code box itself is still the stand-in font's size: 14px tall here at 14px text, where gg mono's is 18.

The renders before and after each fix, against the capture that shows it, are described in the slice 9a report; none of them is committed.

#### What Tome's notes got right and wrong

The gallery table in §7 rested on these notes. Checked against the same images:

- "Discord upscales a gallery item to fill a fixed slot" holds only for four items on desktop, and for two, three and four on iOS. It is wrong for a single item on both clients and for a pair on desktop.
- The three-item mosaic was captured on iOS only, never on desktop.
- "A pair of square icons renders as proper squares" has no capture behind it; the only square pair captured, on iOS, is cropped at the sides.
- Four items are forced wide, and the thumbnail slot is square: both hold. No desktop thumbnail was ever captured, so its 85px size is still unverified.

So in the gallery table, the entry for one item was wrong, the entry for two was unsupported, three is observed on iOS only, four holds, and five to ten have no observation. Both tables (§7 and `format/galleryLayout.ts`) now say so, entry by entry.

#### iOS: the layout, in points

The iOS app is not the desktop layout at a narrow width.

| Thing                         | Value                                                                                                                                                                                   | Confidence                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Content column                | Starts at 68, ends 16 from the right edge; 309 wide on a 393-point screen                                                                                                               | High                          |
| Avatar                        | 40 square, 16 from the left, 12 before the content                                                                                                                                      | High                          |
| Header name and time          | About 17, and about 12 to 13; the time alone for a message sent today, a short date and time for an older one                                                                           | Medium                        |
| App tag                       | 38 by 16                                                                                                                                                                                | High                          |
| Container                     | Fill `#242429` with a hairline `#323237` border; radius about 8; 16 padding on every side; 8 between children; accent bar about 4 on the left edge                                      | High, radius medium           |
| Body text                     | About 15, on a 20 line height                                                                                                                                                           | Size medium, line height high |
| Second-level heading          | About 22                                                                                                                                                                                | Medium                        |
| Button                        | 32 tall, about 12 padding each side, **no minimum width** (a one-letter button is 33 to 35 wide), radius about 8, 8 between buttons and between rows                                    | High                          |
| Gallery of two, three or four | **Always one box, 273 by 181**, with 4 gaps, cover-cropped. Two: 135 by 181 each. Three: a 181 square beside two 88 squares. Four: 135 by 88 each. Outer radius about 12, inner about 2 | High                          |
| Single picture                | The file's own size when it fits; a large one fills the content width                                                                                                                   | High                          |
| ALT badge                     | Drawn bottom-left on a picture that has a description. Desktop draws none                                                                                                               | Medium                        |
| Separator                     | About a 1-point line with 8 above and below                                                                                                                                             | Medium-high                   |
| Inline timestamp              | A chip the full height of the line, which wraps mid-phrase with each fragment filled                                                                                                    | High                          |
| Section with a thumbnail      | 60 square, radius about 8, right- and top-aligned                                                                                                                                       | High                          |

Not captured on iOS at all, and so still unknown: any classic embed; subtext, quotes, lists, code, mentions, emoji in text, and first- and third-level headings; coloured, disabled, link or emoji buttons; selects, files and spoilers; galleries of five to ten; anything outside a container; "(edited)", an ephemeral reply, a grouped follow-up; and the light theme. (Long labels were captured after all: "A. Anti-Mage" is a 111-point button on `tome-019`.) Also never shown: italic, underlined and struck-through text, links, timestamps other than relative ones, separators with large spacing or without a line, a section with a button, a tall single picture, a header dated yesterday, and the ash and onyx themes.

**As drawn (slice 9c).** The iOS layout draws everything in the table above. Re-measuring the captures while building it refined several values and found a few the table did not have; the stylesheets carry each beside the rule it sets, with the capture it came from:

| Thing                  | Value drawn                                                                                                                                              | From                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Container content      | 16 from the card's outer edge, hairline included, so 277 wide on the 14 Pro (not 275)                                                                    | `tome-054`                         |
| Gallery of two to four | 2 in from the content on every side, so 273 wide on the 14 Pro, keeping the 273:181 shape on other phones (unobserved)                                   | `tome-019`, `tome-023`             |
| Any gallery            | 3.5 more space above it than the 8-point gap (11.5 from the text above to a lone picture)                                                                | `tome-023`                         |
| Header                 | A 22-point line; the name's baseline 17.2 under the avatar's top; the card 27.3 under it (5 under the header); the tag 3.4 to 4 under the avatar's top   | `tome-019`, `tome-023`, `tome-054` |
| Name and time          | Name about 17, semibold (wider than desktop's medium); time about 13, on the name's baseline; 5 between name and tag and between tag and time            | same                               |
| Second-level heading   | 22 on a 28-point line, and 4 more under a heading that ends its text (12 to the next text, where text to text is 8)                                      | `tome-019`, `tome-021`, `tome-026` |
| Button                 | Label 15 semibold; a hairline border (`#36363b` on a `#323237` fill, as desktop's secondary colours)                                                     | `tome-019`, `tome-029`             |
| Timestamp chip         | Fill `#313137` on `#242429` (the subtle grey, about 12%, where desktop's is 16%); square-looking corners                                                 | `tome-019`, `tome-056`             |
| Separator              | `#4d4d52` in the Dark theme, lighter than desktop's `#3b3b41`                                                                                            | `tome-019`, `tome-056`             |
| ALT badge              | 31 to 32 wide, 16 to 20 tall, 5 to 8 from the picture's left and 9 to 10 from its bottom, regular-weight white on near-black; drawn 7 and 10 in, 18 tall | `tome-020`, `tome-021`, `tome-056` |
| Accent bar             | About 4.3 from the card's outer edge, as desktop                                                                                                         | `tome-054`, `tome-056`             |
| End of a channel       | The last message ends 31 above the message box                                                                                                           | `tome-029`                         |

What the captures do not show is drawn from the desktop design at the app's text sizes (subtext at 13 on 17, first- and third-level headings at 26 and 18, top-level text at the container's 15 on 20, everything else at desktop's own sizes), and each render reports, per viewport, which of those parts its scene holds (§12d).

#### Still needed

For desktop: galleries of three and of five to ten, and pairs of large and mixed pictures; a narrow window, which no capture shows; thumbnails and sections; an embed with every part, including a footer with a timestamp; the header of a message from yesterday and of an older one; the light, ash and onyx themes; and one whole-window capture. For iOS: the list above. The fixtures for each already exist as scenes; they need posting to a channel and capturing as PNG files at native size.

### Test layers

Whole-image diffs against real Discord are noisy, because the font differs unless gg sans is supplied. So fidelity is checked in three layers:

1. **Computed-style assertions.** Browser-project specs (`*.browser.spec.tsx`) render a fixture and assert padding, gap, radius, size and colour against the values table. Font-independent, fast, and they run in CI.
2. **Screenshot regression against our own baselines**, with `toMatchScreenshot`. This catches unintended change. Baselines differ by platform (Windows locally, Linux in CI), so this layer starts local-only.
3. **Overlay against a real capture** of the same fixture, reviewed by a person when a component is first built or Discord ships a redesign.

### Calibration

**No agent drives the owner's Discord account, in any form.** An earlier draft of this section preferred having the owner log in to the web client in a browser an agent controls, so the agent could read computed styles. The owner withdrew that on 2026-11-27: Discord now requires a phone number for a new account, so there is no second account to use, and automating their one personal account is too great a risk. A snippet pasted into the page's console is not proposed either: it would only read, but it is still code running inside a logged-in client.

The method that replaced it had already proved itself. Section 7b was measured entirely from screenshots the owner had taken for other reasons, and they located values to about a pixel.

- **Test messages are posted by a bot**, to a channel in a server the owner keeps for testing. A bot or webhook posting is an official feature and is not the owner's account acting. Interactive components need a bot's token; a plain webhook can post the rest.
- **The owner looks, and takes screenshots**, on desktop and on their phone, as PNG files at native size saved to a folder. Each fixture is preceded by a one-line label (`F01 · …`) posted by a webhook, a different author, so a screenshot can be matched to its fixture whatever its order or file name, and the fixture keeps its own header: a label posted by the bot itself would make the fixture a continuation of its group and take the header away. Only the markdown cases carry their number (`M012`) inside the message, on a line of its own. The set comes in three tiers so the part that matters fits one sitting: **essential**, what the owner's bots send, packed into 5 fixtures and 10 screenshots on desktop and 9 on the phone; **extended**, everything else a message can hold, about 70 a platform; and **markdown cases**, the 122 assumed cases, 21 screenshots on desktop only, since parsing belongs to the parser and nothing yet suggests the iOS app parses differently.
- **An agent reads the files afterwards**: matches each to its fixture, renders ours at the same scale, and measures the difference.
- **Optional, for desktop only, and untested:** the owner saves the channel's page from the web client in their ordinary browser ("Save page as", complete). A browser writes out the page it has already loaded, with its stylesheets, and that copy can be opened offline with scripts disabled to read exact sizes and structure. It would settle the unverified markdown cases far faster than screenshots can. A saved page holds everything that was on screen, so a script keeps only the message area and discards the rest before anything else reads it.

Screenshots and saved pages are private. They stay in the locally ignored `.discord-reference/` folder and never enter the repository; only measurements do. The phone screenshots are the only reference the iOS app will ever have.

#### As built (slice 9d): the capture kit

The kit is maintainer tooling in `scripts/calibration/`, not part of the package, run as root tasks, each taking `--tier essential|extended|markdown|all` (essential by default). `vp run calibration:post` prints every request posting a tier would send (the default, needing no token) and posts it with `--send`; `calibration:delete` deletes exactly what a run's manifest lists; `calibration:ingest <folder>` files screenshots into `.discord-reference/captures/calibration/` with an index of their sizes, and refuses a destination git does not ignore; `calibration:scenes` writes each fixture as a scene the preview's command line renders, to lay over its screenshot. `scripts/calibration/CAPTURE.md` is the owner's checklist, written from the capture set by `calibration:instructions` and checked against it by a spec. Secrets come only from `DISCORD_CALIBRATION_BOT_TOKEN`, `DISCORD_CALIBRATION_WEBHOOK_URL` and `DISCORD_CALIBRATION_CHANNEL_ID`.

The essential tier packs the bots' content so one fixture answers several questions without changing what is measured: the question card holds every kind of text they use, a separator and three button styles, and is edited after posting; the closed card adds disabled and emoji buttons, a row outside the container and a message continuing the group; two gallery fixtures hold a 3:2 picture that meets both of desktop's caps, a mixed pair and a mixed three, each gallery alone in its container (a text line beside it would stop the container shrinking to it); and Inbou's two classic embeds. A four-picture gallery, observed on both clients, waits in the extended tier. Every fixture was rendered for a 1920 × 1080 window and an iPhone 14 Pro to check it fits one screen. The kit has been tested only against a local server standing in for Discord's API, never against Discord.

### Fonts and emoji

- Latin text uses Noto Sans unless a gg sans path is configured. With Noto Sans, line breaks can differ from the real client, and the output says so. Noto Sans comes from the `@fontsource-variable/noto-sans` dependency (OFL), so no font binaries are committed.
- The Node renderer must decide what "gg sans" means instead of leaving it to the machine. Discord's font stack names gg sans first, so a machine with it installed system-wide would render differently from one without. When a path is configured, the renderer declares gg sans from that file; when none is, the stack it renders with starts at Noto Sans. To do in slice 4, with the bring-your-own option.
- CJK text uses a fallback stack mirroring Discord's, which resolves to system fonts, as it does in the real client. That makes the image depend on the machine, in a way that matters for Inbou: its users are US English speakers, mostly on macOS, while its developer is on Windows. Under en-US, Windows draws kana in a Japanese font and kanji in a Chinese one (Microsoft YaHei). macOS is believed to use Hiragino for both, which has not been checked on a Mac. So the developer's own client is not what the audience sees.
- **CJK pinning, to build in slice 4 with the font options.** A scene or CLI option pins CJK to an open Japanese-design font (Noto Sans JP, OFL, from a fontsource package so only the needed Unicode subsets load). This gives the same image on every machine and in CI, and Japanese glyph shapes, which is closer to the macOS majority than the Windows mix. Unpinned stays available for seeing what one particular machine does. Apple's fonts themselves cannot be shipped.
- Unicode emoji render as Twemoji (graphics CC-BY 4.0, attribution in the notices file). The images are fetched and cached, not installed: the only npm package of the SVGs, `@twemoji/svg`, stopped at 15.0.0 in 2023 (8 MB, 3723 files) and lacks newer emoji, while the maintained set (jdecked/twemoji 17) is distributed from its repository and jsDelivr.

### Remote assets

Emoji, custom-emoji images, avatars and media-gallery images are all the same problem: a URL the render needs, which must not make the output depend on the network at screenshot time. One loader handles them all.

- The Node renderer resolves every asset before the browser sees the page: `attachment://name` from the scene's attachments, everything else by URL through a disk cache keyed by the URL. The browser itself still reaches nothing.
- A missing or failed asset renders as a visible placeholder and is reported as a finding. An offline option makes a cache miss a finding instead of a fetch.
- The React components take the resolved URL, so in a browser (the editor) they load images directly.
- Discord draws an empty box while its media proxy is cold; both bots hit this. The placeholder is that state, so a scene can show it on purpose.

## 8. Node API and CLI

```ts
import { renderScene } from "@discordkit/preview/node";

const { png, width, height, findings } = await renderScene(scene, { scale: 2 });
```

Called from a spec, this needs no module-resolution workaround: the test runner already resolves the bot's render functions. That replaces Tome's `post-samples.mjs`, which hand-converts keys and hand-copies the renderer.

The CLI wraps the same API. Arguments are parsed with `node:util`'s `parseArgs`; no argument-parsing dependency is added.

| Command                                   | Does                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `discordkit-preview render <scene.json>`  | Writes a PNG (or HTML with `--html`). Reads stdin when no file is given. Options for theme, width, scale and output path. |
| `discordkit-preview lint <scene.json>`    | Reports schema errors and lint findings. Non-zero exit on errors.                                                         |
| `discordkit-preview codegen <scene.json>` | Prints TypeScript source for the payload.                                                                                 |
| `discordkit-preview diff <a.png> <b.png>` | Reports whether two renders differ and writes a diff image.                                                               |
| `discordkit-preview studio [scene.json]`  | Serves the editor against a scene file on disk (§12, §12a).                                                               |

Every command takes `--json` and then prints one machine-readable object: output paths, image dimensions, and findings with a path into the payload. Error messages follow the repo's standard: what happened, why, and the concrete next step.

Renders are deterministic: fixed clock and zone from the scene, animations off, images awaited, and a visible placeholder for an image that fails to load.

### 8a. As built (slice 4b)

- **The binary is a small hand-written script, `bin/discordkit-preview.mjs`, that imports the compiled `dist/cli.mjs`.** It exists so that running the command before the package is built says to build it, instead of Node failing to find a module. Yarn links it as `node_modules/.bin/discordkit-preview` with a `.cmd` shim on Windows; it runs the same through the shim and directly with `node`.
- **Exit status: 0 ran and found nothing wrong (for `diff`, the images match); 1 ran and an input has errors or could not be drawn (for `diff`, they differ); 2 could not run.** With `--json`, a failure to run is still one JSON document, `{ "error": { "message" } }`.
- **`render(input, options)` in `./node` is what the `render` command runs per input**: intake, lint and the renderer in one findings list. Lint's `component-unsupported` becomes an error there and no image is drawn; any other scene the components refuse becomes a `scene-undrawable` finding. Neither throws. A machine problem (no browser, package not built, unreadable gg sans) still throws.
- **One `Finding` type.** The renderer's asset findings now have a severity (`warning`), a path into the input where the image is named (empty for an emoji, which is named by text), and `asset`. Lint's `attachment-missing` carries `asset` too, and `render` keeps only lint's copy.
- **Fonts.** `ggSans` takes a file or a directory; each file's weight and style are read from its `OS/2` and `fvar` tables (TrueType, OpenType, WOFF, WOFF2), since Discord's copies have hashed names. `cjk: "noto-sans-jp"` puts Noto Sans JP (`@fontsource-variable/noto-sans-jp`, a regular dependency, 5.8 MB unpacked) right after the Latin fonts. Every render reports which fonts drew the text, read from Chromium's `CSS.getPlatformFontsForNode` per text node, with `machineDependent` and a `note` when CJK text was left to the machine or any text used an installed font. That report is beside the findings, not one of them: it describes the image, not the message.
- **Observed on the owner's Windows machine, en-US, unpinned:** Inbou's question card drew kana with an installed Noto Sans JP and kanji with Microsoft YaHei, as this section predicted. Pinned, the kanji change shape and the kana barely move.
- **HTML** is the page after the browser has finished with it (placeholders, gallery shapes), with only the font files the page requested and the images inlined. The Inbou card is about 280 KB pinned.
- **`diff`** decodes PNG with Node's zlib (every colour type, bit depth, palette, `tRNS` and Adam7; checked against Chromium's decoder), compares premultiplied RGBA with a per-channel tolerance that defaults to 0, and draws a faded grey copy of the first image with differences in red.

## 9. Lint

The client schemas answer "is this a valid request body". Lint answers the questions that are still open after that, and reports counts so an agent can see headroom ("32 of 40 components"):

- Total components across the whole tree, against 40.
- Total text-display characters, against 4000; `content` against 2000; embed totals against 6000.
- V2 components present without the `IS_COMPONENTS_V2` flag, and `content` or `embeds` present with it.
- A button whose style does not match its fields (`customId`, `url`, `skuId`).
- An `attachment://` reference with no matching attachment in the scene.
- Markdown that will not render as written: `-#` without a space, a mention in an embed title.

The flag rule is advisory in lint and not a schema error, because an edit to an existing V2 message may omit `flags`.

## 10. Codegen

Emits the style both bots already write:

```ts
import { ComponentType, type MessageComponent } from "@discordkit/client";

export const components: MessageComponent = [
  {
    type: ComponentType.Container,
    accentColor: 0x5865f2,
    components: [
      { type: ComponentType.TextDisplay, content: `## Which hero is this?` }
    ]
  }
];
```

Enum members instead of numbers, hex for colours, backtick strings per the house style, one import statement naming only what the output uses, and output that passes `vp check` unchanged.

### 10a. As built (slice 4a)

Three subpaths with no React, DOM or Node built-ins, each returning plain data a CLI can print as JSON.

- **`readScene(input)`** (`./scene`) accepts a scene, a message payload, a component array or a single component, as an object or a JSON string, in snake_case, camelCase or a mix. It never throws. It validates with `createMessageSchema`'s body from `@discordkit/client`. Keys that are data are left alone: context maps are keyed by id and attachments by filename.
- **`lint(input)`** (`./lint`) is the one call an agent needs: intake findings plus lint findings, the counts, and `valid`. A finding is `{ code, severity, path, message }`, and its path uses the caller's own spelling, so `accent_color` stays `accent_color`. A count is `{ metric, used, limit, summary }`, reported whether or not a limit is broken.
- **`codegen(input, options)`** (`./codegen`) returns source typed as `MessageComponent`, `Embed[]` or a message body.
- 26 lint rules, each with a stable code, and each limit a named constant citing its source in Discord's documentation as read on 2026-11-25. Removing any one rule fails a test.
- Generated source is proven by type-checking it against `@discordkit/client` and by evaluating it back to the input, for every fixture. All of it passed the formatter and linter unchanged. Not implemented: the formatter's "fill" layout for long arrays of numbers.
- One list, `supportedComponents`, says which component types can be drawn where. Lint and the renderer both read it, and a spec renders every type in every position to prove they agree.

Open after this slice:

- **Character counting.** Lint counts Unicode code points; the client schemas count UTF-16 units. Which Discord uses, and whether it trims first, is unverified.
- **`valid` can be true for a scene the renderer will refuse**, because an undrawable component is a warning. Settled in 4b: `render` raises it to an error and draws nothing (§8a).
- **Two `Finding` types existed**: the Node renderer's for assets and this one. Merged in 4b (§8a).
- **Misspelled keys pass silently**, since the schemas drop unknown keys. A candidate rule.

## 11. Prerequisite fixes in `@discordkit/client`

Shipped as their own pull request before the preview package, since they are bugs in a released package.

1. **A select menu cannot go in an action row.** `ActionRow.components` is a union of a button array and a bare select or text-input object ([ActionRow.ts](../packages/client/src/components/types/ActionRow.ts)). Discord sends and expects an array in every case.
2. **A File component cannot be sent.** `name` and `size` are required but are response-only ([File.ts](../packages/client/src/components/types/File.ts)).
3. **Webhook embeds require every field.** `executeWebhook` rebuilds the embed object without `partial` ([executeWebhook.ts](../packages/client/src/webhook/executeWebhook.ts)). Sibling endpoints are checked for the same pattern.
4. **The 40-component limit is counted at the top level only**, though the schema's own comment says it counts the whole tree ([MessageComponent.ts](../packages/client/src/messages/types/MessageComponent.ts)). The 4000-character text limit is not checked at all.

`createMessage` also bounded `content` at 20000, where the documented limit is 2000; that is fixed in the same pull request (#106).

Found later, while building intake against these schemas, and not yet fixed:

- A Unicode emoji on a button needs `id: null`. Discord accepts `{ name: "🔥" }` alone; the schema requires the `id` key.
- Core's `boundedArray` replaces every nested issue's message with its own "Expected an array with a length", so a missing field deep inside a bounded array reports the wrong problem.
- `createMessage` does not cap `embeds` at 10.
- The interaction-callback body puts no maximum on `content` and accepts any integer for `flags`.
- The message-body type the interaction callbacks use lacks `stickerIds` and `messageReference`.

## 12. The editor (Studio)

The interactive editor, in the spirit of message.style, built on the renderer, intake, lint and codegen that already exist. Its distinguishing property is that a person and an agent can work on the same message at the same time.

### Decisions

- **Studio lives inside `packages/preview`, not in `apps/`.** An earlier draft of this spec put it in a private `apps/studio`. But `discordkit-preview studio` has to work from an installed package in Inbou or Tome, which means the built app must ship in the package the CLI is in. So Studio is a second build output of the same package: a static site in `dist/studio`, served by the CLI. Its form libraries are bundled into that static build and are dev dependencies; they are not runtime dependencies of the library subpaths.
- **The document is a scene file on disk.** `discordkit-preview studio scene.json` serves the editor against that file. Edits in the browser are written to the file; changes to the file from outside (an agent editing it, a bot's spec regenerating it) appear in the browser. There is no separate project format, database or account.
- **The form state is the scene.** Field paths in the form are paths into the scene, which are the paths lint findings already carry. A finding lands on its field with no mapping table. message.style keeps a separate normalised editor model and a converter that returns an id-to-path map; this design needs neither.
- **Validation is `lint`.** The form's resolver calls the package's own `lint` and turns findings into field errors. The editor cannot disagree with the CLI about what is wrong with a message.
- **The preview is `<Scene>`.** The same component the Node renderer screenshots, so what the editor shows is what `render` writes, given the same fonts.
- **Stack, as the owner specified:** React 19, react-aria-components for every control, react-hook-form for form state, CSS Modules for styling. The with-electron Rich Presence Visualizer is the in-repo precedent for a form with a live preview and a "Show Code" tab.

### The file bridge

`discordkit-preview studio [scene.json]` starts a small HTTP server on the loopback interface and prints its address.

- It serves the static app, the scene file's content, a write endpoint, and a stream of change events from watching the file.
- **It binds to loopback only and requires a per-run secret**, carried in the printed address. A page on another site can make a browser send requests to `localhost`; without the secret such a page could overwrite the scene file. The server also rejects requests whose `Host` or `Origin` is not its own.
- **It writes exactly one file**, the one named on the command line, and reads that file and the image attachments the scene itself lists. Two later routes reach a little further and are bounded for it: the emoji route fetches Twemoji images by code point from one fixed host, and the export route draws the scene with the Node renderer. Both write only the renderer's asset cache, which `render` writes too, and neither accepts a path from the request.
- **Writes carry the version they were based on.** If the file changed on disk in the meantime, the write is refused. The person's text is kept on screen under a banner that offers both ways out, and loading the file's version is a step that undo can take back. An agent's write to the file is never silently lost to a stale browser tab.
- The file keeps the key style and shape it had: a snake_case component array stays a snake_case component array when Studio saves it, unless the person asks to convert it.
- Without a file argument, and when the static build is opened from anywhere else, Studio works on a draft kept in the browser's storage and can import and export files by hand.

### What a person can do

- **Edit the component tree**: add, remove, duplicate and reorder components, with each parent offering only the children Discord allows there, and a form for every field of every component the renderer supports, plus content and embeds for classic messages.
- **See what is wrong while typing**: a finding under the field it belongs to, a marker on any collapsed ancestor, and a summary with the counts ("13 of 40 components").
- **See the result**: the live preview with controls for theme, width (desktop and phone presets), locale, clock, spoiler reveal and which select is open.
- **Describe the surroundings**: the author, the users, roles, channels and emoji that mentions resolve to, and attachments.
- **Edit several messages** in one scene, for sequences such as an open card and its closed state.
- **Take the result away**: generated TypeScript, the JSON in either key style, and a PNG rendered by the same Node renderer the CLI uses (available when Studio is served by the CLI).
- **Undo and redo**, across both their own edits and changes that arrived from the file.

Not in the first version: sending to Discord, saved-message storage, templates, drag and drop across parents, and a markdown toolbar. Modals, left out of the first version, were added later (§12f).

### Slices

| #   | Slice                               | Done when                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8a  | Shell, file bridge and live preview | `discordkit-preview studio scene.json` opens an app showing the live preview, the findings and counts, the generated code, and the JSON in an editable text pane. Editing the file outside updates the browser within a second; editing the JSON in the browser writes the file. Preview controls work. |
| 8b  | Structured editing                  | The component tree and a form per component, embed and message field, with findings on their fields. A person can build Inbou's question card from an empty scene without touching JSON.                                                                                                                |
| 8c  | Surroundings and finish             | Context and attachment editors, several messages, undo and redo, PNG export through the bridge, keyboard and screen-reader passes.                                                                                                                                                                      |

### 12a. As built (slice 8a)

What 8b and 8c build on, observed rather than planned:

- **Two build outputs.** The package's `build` task is `vp pack && vp build --config vite.studio.config.ts`. `vp pack` builds the library as before, with `src/studio/**` left out of its entry; the second step bundles the app from `src/studio` (React, react-aria-components, react-hook-form, valibot, the client schemas, the preview itself and Noto Sans) into `dist/studio`. The pack step empties `dist/`, so the order matters; on a cache hit Vite Task restores `dist/studio`. The site is about 666 kB of JavaScript (206 kB gzipped), 53 kB of CSS and 0.95 MB of Noto Sans subsets (1.4 MB in all on disk), loaded per Unicode range. react-aria-components and react-hook-form are dev dependencies, so the library subpaths gain no runtime dependency, and `./scene`, `./lint`, `./codegen` and `./markdown` still import from plain Node.
- **The bridge is `src/bridge/`** (Node only, packed with the CLI): `server.ts`, `watch.ts`, and `protocol.ts`, which the app shares. Routes live under `/<secret>/`: the app's files, `api/file` (`GET` a snapshot, `PUT` `{ text, baseVersion }`), `api/events` (server-sent events, one snapshot per change, starting with the current one) and `api/attachments/<name>`. A version is the SHA-256 of the file's bytes. A `PUT` whose base is stale gets `409` with the file as it is now; text that is not JSON gets `400`; a body that is not `application/json` gets `415`. Reads and writes take turns, so no write lands between another write's version check and its write. Writes are in place, not by rename, and keep a byte-order mark the file had. The page the bridge serves carries a `<meta name="discordkit-preview-bridge">`; without it the app keeps a draft in `localStorage`.
- **Watching on Windows.** The directory is watched, not the file, so editors that save by rename keep being followed; events are debounced (60 ms) and compared by content hash, so a save that raises several events, or rewrites the same bytes, is announced once; reads retry through `EBUSY`, `EPERM` and a momentary `ENOENT`; and the file's size and modification time are polled every 750 ms in case an event is missed. The end-to-end spec holds a change on disk to reaching the browser's preview in under a second, on Windows.
- **State.** The JSON pane and the file are a pure reducer (`studio/document/documentState.ts`); text is held with line feeds and written back with the file's own line endings. The form (`react-hook-form`, values typed as `Scene`) holds the normalised camelCase scene that `readScene` makes of the text, and is reset from each text that parses. Its resolver is `lint`: a finding becomes a field error at its scene path; a finding on an object or array goes under that path's `root` key, and one about the whole input under `root.lint`. The error's `type` is the worst severity there and `types` holds every finding there by code. 8b registers fields at those paths and reads `getFieldState(path).error`.
- **Saving through the file's shape** (`studio/document/fileShape.ts`). The pane's own text is written exactly as typed. A change Studio makes itself (in this slice, only a preview setting in a scene file) is written by unwrapping the scene back to what the file holds (message, components or one component), giving each key the spelling it already had in the file and new keys the file's majority style, and keeping its indentation. 8b's field edits should save the same way. A side effect: such a save reformats the whole file as `JSON.stringify` indents it, so a hand-formatted file's compact arrays expand.
- **Preview settings are scene fields.** Theme, width, locale, time zone, clock, spoiler reveal and the open select are set on the form. In a scene file they are written to it. A bare payload has no place for them, so they are kept in Studio across changes to the file and never written, and the toolbar says so. Studio draws one select open at a time.
- **Conflicts.** A change from disk replaces the pane's text when nothing in it is unsaved. When something is (text that does not parse, or a write refused as stale), the pane keeps the person's text, saving stops, the preview, findings and code show the file, and the pane offers "Discard mine, load the file" or "Overwrite the file with mine" (only once the text parses). The echo of Studio's own write is recognised by its text and is not a conflict. This is 8a's stand-in for the undo history §12 describes; 8c can replace the banner's "discard" with an undo entry.
- **Isolation.** The preview sits in a box with `all: initial`, so none of Studio's inherited text styles reach it, and it sets the brand font to the bundled Noto Sans, as the Node renderer does without gg sans. Studio's tokens are all `--st-*` on `:root`, and its stylesheet has no universal selectors.
- **Not done in 8a:** the structured editor, undo and redo, PNG export, line numbers in the JSON pane, a dev server for working on Studio itself (`vp dev --config vite.studio.config.ts` runs it in draft mode only), and a way to convert a bare payload to a scene from the toolbar.

### 12b. As built (slice 8b)

What 8c builds on:

- **Where things are.** `studio/editor/` holds the structured editor. The pure parts, each with a Node spec: `paths.ts` (a scene path is the form field name, the tree node id and lint's finding path at once), `tree.ts` (the tree, its summaries, and which children each parent takes, from `supportedComponents` plus the counting rules in `lint/limits.ts`), `edits.ts` (insert, remove, duplicate, move; each returns the new scene, the path to select, and a `remap` for every other path), `messageKind.ts` (classic and V2, and what a switch discards), `prune.ts`, `color.ts` and `startingPoints.ts`. The React parts: `EditPanel` (toolbar, tree, form), `ComponentTree` (react-aria `Tree`), `forms.tsx` and `MessageForm.tsx` (a form per kind), `fields.tsx` (the bound controls) and `ItemList.tsx` (options, defaults, pictures, embed fields, each item keyed so its fields move with it). `EditorContext` gives every field the form's `Control<Scene>`, `write`, `apply` and the file's kind. Field names are built at run time, so `fieldPath` in `paths.ts` checks each is a message path and gives it react-hook-form's `FieldPath<Scene>` type; values read back are `unknown` and checked where they are used. A change wider than one field (a button's style, a message's kind, a flag, the author, a list's items) goes through `apply` with `setValueAt` or the list edits, like the tree's edits. `useFieldArray` is not used: its `append` over the union of the scene's array paths types as `never`.
- **One form, two speeds.** The form still holds the whole scene. The selected node's form and the toolbar read it as typed; the tree, the preview, lint and codegen read a `useDeferredValue` copy, so a keystroke never waits for a redraw. Lint no longer runs inside a keystroke: the form's mode is `onSubmit` and Studio calls `trigger()` 60 ms after the last change (`relint`), which fills the field errors 8a's resolver makes. On a 40-component message, typing in a text display measured 16 ms median and 24 ms at the 95th percentile from key to next paint (Event Timing, headless Chromium), and 36 ms from the last key to the preview showing it; Inbou's card, 8 and 16 ms. Before lint was moved out of the keystroke it was 32 and 48 ms.
- **Writes.** Every change calls `write`, which prints the pruned form over the pane's current text with `toFileTextOver` (`document/preserveFormat.ts`): unchanged values keep their text, changed objects keep their layout, new values follow their neighbours' style, and nothing is written when the text comes out the same. The written text is remembered as the form's echo and is not read back into the form, which already holds it; reading it back would `reset` and regenerate every field array's keys under the person's caret. Any other text (the JSON pane, the disk, a conflict resolved either way) is read and resets the form as in 8a, and clears the echo. The debounced save, the version check and the conflict reducer are 8a's, unchanged.
- **Conflicts with form edits.** A form edit makes the pane unsaved for the 250 ms the save waits, so an agent's write in that window is a conflict exactly as for JSON: the person's version stays in the pane, the preview, tree and forms show the file, and the forms are disabled until they choose. The banner moved out of the JSON pane to above the tabs (`ConflictBanner`), so it is seen from the Edit tab.
- **Cleared fields.** A cleared optional field is set to `undefined`, and `prune` drops it (and an object all of whose keys were dropped) before lint, the preview, codegen and the write. A switch or choice set back to Discord's default also removes its key. A Unicode emoji is written `{ id: null, name }`, the shape the client's schema requires and Discord accepts.
- **Selecting in the preview.** The preview's components call `useInspect(object)` (`react/Inspect.ts`, internal) and spread what it returns on their outermost element. Without a provider it returns `undefined` and the markup is unchanged (a Node spec renders every fixture both ways and compares). Studio's `PreviewPane` provides it with a `WeakMap` from each scene object to its tree id, reads `data-dkp-node` from a click, and draws the selection outline as its own element over the preview, measured per pane from its own refs. Nothing in it assumes one preview, so two viewports side by side can each carry their own.
- **Starting points** are offered when the scene has no messages (`{ "messages": [] }` or an empty file). The two bot cards are copies of the fixtures, held equal by a spec.
- **The JSON pane is no longer the first tab.** Studio opens on Edit; specs that type JSON open the JSON tab first.
- **Size.** The site's JavaScript went from 666 kB (204 kB gzipped) to 876 kB (269 kB gzipped); CSS from 53 kB to 68 kB. react-aria's drag and drop would have added another 139 kB (29 kB gzipped), so rows are moved with the keyboard and the toolbar only.
- **Not done in 8b:** dragging rows; moving a component into another parent; adding, removing or reordering messages; forms for the scene's context, so the author can only be chosen from users already in it; undo and redo (the kind switch's warning says there is none yet); a form for the scene's view settings beyond the 8a toolbar; and converting a bare payload to a scene. A finding at a path no field shows (a response-only key, say) appears only in the findings list and as a tree marker.

### 12c. As built (slice 9b): devices and viewports

The owner asked for desktop and mobile views, side by side, chosen from a list of known devices as in a browser's device toolbar. This slice draws any number of viewports side by side, in Studio and from the command line, but every one of them with the desktop web layout: a phone shows how a message wraps at the phone's width, not what the app shows. The iOS layout is the next slice.

**The device registry** (`src/devices.ts`, no Node built-ins, exported from `./scene` and `./node`) is plain data: per device an id, a name, a platform (`desktop`, `ios`, `android`), a form (`window`, `phone`, `tablet`), the portrait screen or window in CSS pixels, the pixel density, safe-area insets for phones and tablets, the layout it asks for, and a source. It holds five desktop windows (1024 × 768 to 1920 × 1080; chosen, not measured), ten iPhones from the SE (375 × 667 at 2x) to the 17 Pro Max (440 × 956 at 3x) with the iPhone 14 Pro (393 × 852 at 3x, safe areas 59 and 34), two iPads, six Android phones from the folded Galaxy Z Fold 5 (344 wide) to the Pixel 9 Pro XL (448), and a Galaxy Tab. iPhone numbers are from Use Your Loaf's screen-size tables (read 2026-11-25); Android and iPad numbers from Chrome DevTools' emulated device list (`EmulatedDevices.ts` on devtools-frontend's main branch, the same day). The SE's and iPads' insets, and every Android inset (24 and 24), are not in those sources and are marked as such. The 13 mini's density is its panel's 2.88, so a render of it at its own density is as wide as its screenshots (1080).

**A desktop window's chat column** is the window less four widths from Discord's stylesheet (build 679963, the copy fetched 2026-11-24), at the default density:

| Part         | Width | Rule                                                                                                                                                                                                              |
| ------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server rail  | 72    | `--custom-guild-list-width`: `--guildbar-avatar-size` (40) plus twice `--custom-guild-list-padding` (`--space-md`, 16; 12 compact, 20 cozy)                                                                       |
| Channel list | 196   | `.sidebar_*` is `--custom-guild-sidebar-width` (268) and holds the rail and the list; `.sidebarList_*` is `calc(268px - 72px - 1px)` plus a 1px leading border. It can be dragged wider, which JavaScript records |
| Member list  | 264   | `--custom-member-list-width` (256 compact, 268 cozy), the second column of `.channel_*`'s grid. Open by default; a desktop viewport can close it                                                                  |
| Scrollbar    | 16    | the message list's managed scroller always scrolls (`overflow-y: scroll`), its `auto` scrollbar is 16px, and `.chatGradientBase_*` stops 16px short of the edge                                                   |

So a 1280-pixel window leaves 732 for the chat, or 996 with the member list closed. The stylesheet also carries an older flex layout in which the 268px sidebar is the channel list alone beside a separate rail (340 in all, `--custom-app-sidebar-target-width`); the grid layout's own `calc` puts the rail inside the 268, and that is the one used. Which one the live client runs, and whether it hides the member list in a narrow window (no rule for that was found), want one whole-window capture to settle. The 1px border `.page_*` gets in the onyx theme is ignored.

**The visible chat on a phone** was measured from one full-screen capture of the iOS app on the iPhone 14 Pro (`tome-056`, 2.3461 pixels per point): the channel header's bottom border is 114 points down, the message box spans 761 to 816, and the home-indicator inset takes the rest. So the app shows chat from 114 to 761, 647 points, under a 55-point header and over a 55-point message box sitting 2 points above the 34-point inset. Every other phone keeps the header and box and swaps in its own insets: the SE 535, the 17 Pro Max 748. That is worked out, not measured, and for Android and tablets it is an estimate; everything says "approximate".

**The scene** gains one field, `viewports?: SceneViewport[]`, each `{ device, memberList? }` or `{ width }`. `width` keeps its meaning: with no `viewports` it is one free-width viewport. `sceneViewports(scene, fallback)` is the one rule: `viewports` if any, else `width`, else the fallback, which is one 600-pixel column for the command line (so every render made before this slice is unchanged, byte for byte) and a 1280 × 800 window beside the iPhone 14 Pro for Studio. Intake validates the shape; lint adds `viewport-device-unknown` (an error naming the three closest ids, by edit distance over ids and names) and `viewport-width-ignored` (a warning when both are set). Lint's other findings and the counts never depend on a viewport. Studio treats `viewports` as a view field: written to a scene file through the format-preserving path (replacing a `width`), kept in Studio for a bare payload.

**Resolving** (`src/viewport.ts`): `resolveViewport` gives everything a caption or a report needs, as plain JSON: device, platform, screen, density, member list, the layout drawn and the one asked for, `calibrated`, the chat width, `visibleChat`, a label and, when not calibrated, a `note` saying in words what the drawing is and is not.

**Drawing** (`src/node/Sheet.tsx`, `renderScene`'s `viewports` option): a single viewport whose layout is its device's own is drawn bare, exactly as before. Anything else is drawn on a sheet: each viewport's scene under a caption (device, size, density, chat column, layout, and for an uncalibrated one the note, in amber), captions on one grid row so the drawings start level, 16px around and 24px between, and a dashed line with a label where a phone's first screen ends, removed when the drawing fits. The sheet is this package's styling in fixed colours and the bundled Noto Sans, never Discord's. A sheet of one viewport has no side padding, so a phone at its own density is exactly as wide as its screenshots. Each viewport's place in the image is measured in the browser after layout and reported as `box` and `drawing`; a crop at `drawing` matches the same viewport rendered alone to all but a handful of antialiased pixels (the spec allows 0.1%). One image has one scale; `--scale device` there needs one density, and otherwise says to use `--separate`.

**Studio**: the preview pane holds the shared settings and one `ViewportPanel` per viewport, each with a react-aria `Select` whose popover holds an `Autocomplete` (search field plus a sectioned `ListBox`), a width field for a free width, a member-list switch for a desktop window, and a remove button. Drawings are scaled with a transform so their layout stays the renderer's, with a box sized to the scaled drawing; one zoom for all, the largest in 1% steps at which they fit in a row, never below 50%, after which panels wrap to the next line. The selection map is built once, and each panel measures its own outline, so a click in any viewport outlines the component in all of them. The pane's heading id comes from `useId`, the whole row is `data-testid="preview"` and each drawing `data-testid="preview-viewport"`.

**A scene that cannot be drawn is no longer drawn to find out.** Studio's preview draws a deferred copy of the form. When that deferred render threw (an `openSelect` naming nothing, an unsupported component), React retried the whole root synchronously, and in that retry `useDeferredValue` can hand back the previous scene, which drew; React then reported the first throw as a recoverable error ("There was an error during concurrent rendering but React was able to recover…"), which Vitest counts as unhandled. It predates this slice and happened once per viewport, every time in the "cannot be drawn" test run alone (10 of 10) and intermittently in full runs (2 of 20 runs of the Studio spec). Now `undrawableCodes` in `findings.ts` names lint's codes for what the renderer refuses (`component-unsupported`, `open-select-missing`; both read the same lists the components do), Studio passes the first such finding's message to every viewport as its `refusal`, and `DrawBoundary` shows it without rendering the scene. The boundary still catches anything unforeseen. A Node spec holds the two sets equal by rendering each case with `renderToStaticMarkup`. The Node renderer and the command line are unchanged: they render outside React's concurrent mode, and keep reporting `component-unsupported` and `scene-undrawable` as before.

**For the iOS layout slice.** Every iPhone and iPad already asks for the `ios` layout (`device.layout`), and every Android device for `android`. `layouts` in `devices.ts` holds only `desktop`; `drawnLayout(requested)` returns the requested layout when `layouts` has it and `desktop` otherwise, and `isCalibrated(layout, platform)` reads the layout's `calibratedFor`. So adding `ios: { name: "Discord's iOS layout", calibratedFor: ["ios"] }` makes every iPhone draw it, drops its note and amber caption, and lets a single iPhone render go bare (no caption, so `--scale device` gives an image the size of a screenshot's chat area), with no change to a device or a caller. The layout reaches the components as `Scene`'s `layout` prop, which today only marks the scene element with `data-discordkit-preview-layout`; the new slice decides how the components read it (a class, a token set, or context). It also needs: §7b's iOS measurements (they are in points, which are the CSS pixels here), the 55-point header and message box above, and the question of what a calibrated phone's image should frame, since a real screenshot includes the status bar and header that the drawing does not.

### 12d. As built (slice 9c): the iOS layout

**The layout.** `layouts` in `devices.ts` gained `ios: { name: "Discord's iOS layout", calibratedFor: ["ios"], calibratedForms: ["phone"] }`. Every iPhone picks it up with no change to a device, drops its note, and an iPhone render whose scene holds only observed parts is drawn bare. `isCalibrated` takes the device's form, so an iPad, which asks for the same layout, draws it but is not calibrated: its note says the layout was measured on an iPhone and nothing has been captured on an iPad. That is deliberate. The iPad runs the same app, whose text sizes, button shapes, ALT badges and chips are certainly closer to the iPhone's than to the desktop web client's; what is unknown is its chat width and gallery sizes, which the note and the per-scene report (every part listed) say. Android keeps the desktop layout and its warning.

**How components read it.** Through the scene element's `data-discordkit-preview-layout`, which already existed. Each component's stylesheet has one block of rules under `[data-discordkit-preview-layout="ios"]`, after its desktop rules, with the capture and measurement beside each value; numbers shared by several components are tokens on the scene root under the same attribute in `tokens.module.css` (`--dkp-ios-*`: the hairline, text sizes, the Dark theme's separator colour). Where only a number differs, the iOS block sets a custom property the desktop rule already reads (`--dkp-markup-font-size`, `--__thumbnail-size`). Where the markup differs, a component reads `useLayout()` (`react/Layout.ts`, internal): only the gallery does, to pick its arrangement table and draw the ALT badge. The desktop rules, markup and tokens are unchanged, so a desktop render is byte-identical: all 22 fixtures and sheets, bare in four themes, at the 600-pixel default and on a two-window sheet (132 PNGs), compared before and after the slice.

**Structural differences, where to find them.** The fixed gallery box: `iosGalleryArrangements` in `format/galleryLayout.ts` (sizing `box`) and `.box` in `MediaGallery.module.css`. Buttons with no minimum width: the iOS block in `ButtonBase.module.css`. The ALT badge: `AltBadge` in `MediaGallery.tsx`. The chip that wraps mid-phrase: `box-decoration-break: clone` in `Timestamp.module.css`. The content column and message chrome: the iOS block in `Message.module.css` (a one-line flex header, whose name is cut with an ellipsis when Noto Sans, wider than gg sans, would otherwise push the time onto a second line) and `AppTag.module.css`. The end-of-channel space: `Scene.module.css`.

**The per-scene report.** `parts.ts` (pure, exported from `./scene` and `./node`) holds the one list of parts, each with the captures of the app that show it, or `null`. `sceneParts(scene)` walks a scene with the same switches the components draw with (exhaustive over the markdown node union, so a new node type fails to compile there), using the grouping rule the scene itself uses (`format/groups.ts`, moved out of `Scene.tsx`). `viewportFidelity(scene, viewport)` gives `{ unobserved, limits }`: on an iPhone the scene's parts with no capture; on an iPad all of them; on desktop and Android nothing, since desktop draws from Discord's stylesheet and Android's note already disowns its drawing. `limits` says when a Unicode emoji (in text or on a button) is drawn as Twemoji where the app draws Apple's. The command line adds both to each viewport's JSON and prints them; the caption lists the parts in amber, or says in green that every part was measured; Studio shows the same text over each iPhone viewport in place of the blanket warning. The list is kept in `parts` order, so it reads the same every time.

**Framing a screen.** `--frame screen` (Node: `frame: "screen"`) draws a phone or tablet as its whole screen: plain labelled bands for the status bar (the safe-area top), the channel header (55), the message box (55) and the home indicator (2 plus the safe-area bottom), all whole pixels, around the chat (647 on the 14 Pro), with the messages anchored to the chat's bottom as at the end of a channel. A single framed viewport has no caption, so with `--scale device` the image is a screenshot's size (1179 × 2556) and `diff` compares the two at their top-left corners; the report goes to the JSON and the terminal instead. No change to `diff` was needed. The bands' heights are `sheetCss` rules keyed by panel, like each panel's width, and each viewport's `drawing` box is the screen.

**Not done.** No iPad, Android or light-theme capture exists, so none is calibrated. The header's yesterday wording, a section's button accessory and everything in the list above remain unobserved. Font differences remain: Noto Sans is wider than gg sans, so lines and button widths run a little longer than the app's (a one-letter button is 35 points where the app's is 34).

### 12e. As built (slice 8c): surroundings and finish

**Several messages.** A scene's messages were already tree rows; now they are a list like any other. `insertMessage` (`editor/edits.ts`) adds an empty Components V2 or classic message after the selected one, sent by the same author, and `duplicateAt`, `moveBy` and `removeAt` work on `["messages", i]` unchanged. Only a scene file's messages can be copied, moved or removed (`isMovable` in `EditPanel.tsx`); in a bare payload the add menu's message items are disabled with the reason. The message row's summary adds "edited" and "ephemeral". With more than one message, `FindingsPanel` groups findings and limits by message (counts now carry their scene path beside the file's spelling, `ShownCount`). Removing the last message shows the starting points again.

**Converting a payload.** `toSceneText` (`document/fileShape.ts`) wraps the file's own parsed value at the place `readScene` puts it, so the existing key spellings are found, and prints the scene, view settings included, at the file's indentation. `ConvertToScene` is an alert dialog saying where the payload will be (`messages[0].payload` and so on) and that anything else reading the file must follow it; it sits in the message form, the preview toolbar's note and the Surroundings tab. It is an ordinary edit, so undo takes it back.

**Surroundings.** `editor/contextUsage.ts` (pure, Node spec) walks a scene with the package's markdown parser, in the context each text is rendered in, and finds every author, mention, custom emoji (in text and on buttons and options), select default value and `attachment://` reference (in the payload, and in users' avatars and emoji images), giving `uses` per entry and `unknown` for what is used but undefined. Studio adds no lint rule for this: Discord sends an unknown mention fine, so it is not a finding about the message but about the preview's surroundings, and it would add a warning to every bare payload `lint` sees. The notes appear under the field whose text uses the id (`UnknownNotes`, through `Description` in `fields.tsx`), at the top of the Surroundings tab, and under "Not described in the scene" in the findings, each with one button that starts the entry (`newEntry`: an empty name, or an emoji's name from the text), switches to the tab and puts the cursor in its first field. `SurroundingsPanel` is not made of form fields: ids are snowflakes longer than a JavaScript number and file names hold dots, either of which breaks a react-hook-form path, so entries are read with `useWatch({ name: "context" })` and written whole through `setContext` with `withEntry`, which keeps every other entry in its place so a change is a one-line diff. Each entry lists where it is used (links that select the field), and one nothing uses is marked _Unused_ with a remove button. An attachment entry asks the bridge whether it can be served by fetching `api/attachments/<name>` once the file is saved (`Backend.checkAttachment`), and shows the type, size and a thumbnail or the bridge's own refusal; a draft says it cannot check. In the preview an attachment the scene does not list is a placeholder at once, a listed one is asked for with its path in the address (so naming another file reloads it), and an image that fails to load is turned into the renderer's placeholder rather than the browser's broken-image icon. SKUs are left to the JSON pane.

**Undo and redo.** The history is part of the document reducer (`documentState.ts`, Node spec): `history.done` and `history.undone`, each step `{ before, after, origin, label, group, at }` where a snapshot is the pane's text (plus, for a bare payload, Studio's view settings, which its text cannot hold). An edit of the pane (`edited`, with a `StepInfo` naming it) is a `mine` step; a change from disk that replaces the pane is a `file` step labelled "Change on disk"; _Load the file_ in a conflict is a `file` step whose `before` is the person's text. Edits with the same group (a field's path, the JSON pane) within a second of each other merge into one step. The rule chosen: **undo steps back exactly one step, whoever made it, and every step is shown in the order it was on screen.** So an undo never skips over an agent's change to reach an older edit of the person's, which would mean writing a text no one has seen (the person's old edit merged under the agent's newer one, or the agent's change silently dropped); to get back past it, the person undoes that change first, and the Undo button names it ("Undo Change on disk"). From the keyboard nothing on screen names the step, so the first Ctrl+Z over a `file` step only announces which change the next press would take back. Everything undo or redo restores was in this tab's pane, and it is saved like any edit, on top of the version the tab last received, so a change on disk the tab has not heard of yet makes the bridge refuse the write and the conflict banner appears; the agent's change is never overwritten unseen. A new step of either kind clears `undone`, so redo cannot reapply text written before a newer change from the file. Undo and redo are off while a conflict waits on the person. The form's echo needed one fix for this: a text the form had moved on from was cached as "already read" (`readTextOnce`), so undoing back to it did not reset the form; writing from the form now drops that cache. `History` (top bar) has Undo, Redo and a popover listing the steps, newest first, with the current one marked. Removing a component or a message asks for nothing, and the kind switch's warning now says undo brings the content back.

**PNG export.** `bridge/exporter.ts` draws with `render` from `node/render.js`, loaded on the first export only (so starting Studio never loads React's server renderer or Playwright), on one browser launched on first use, relaunched if it closed, and closed with the server. The bridge's `api/render` answers `GET` with whether this machine can draw (Playwright importable, its Chromium downloaded, or, with `--channel`, unknown until a launch, after which a failed launch is reported) and `POST { baseVersion, viewports?, theme?, now?, timeZone?, locale? }` with `image/png`. Every rule the other routes have applies to it (loopback, the secret, its own `Host` and `Origin`, so a cross-site form post is refused; `application/json` only, so such a post cannot be sent without a preflight), and it adds its own: the body is at most 64 KB and is checked field by field (at most 8 viewports, a known theme, short strings); it draws the file only at `baseVersion`, so the image is never of something the person has not seen (`409` otherwise); one drawing at a time (`429`), at most 20 a minute (`429` with `Retry-After`), each stopped after 60 seconds by closing its browser (`504`); attachment paths are resolved against the bridge's directory as its attachment route does, so it reads only what `render` reads for that file; and the PNG is returned, never written. The one write is the renderer's asset cache, which `render` writes too. Studio sends `viewports` when the file names none (the two Studio shows), and for a bare payload its view settings; it waits while an edit is being saved. The end-to-end spec exports and compares with `render --device desktop-1280x800 --device iphone-14-pro` on the same file: identical. `discordkit-preview studio` gained `--channel`.

**Emoji.** Studio's CSP already allowed images from `https:`. What drew nothing was the CDN: the preview asked jsDelivr for each emoji on every page load, with nothing cached in a fresh browser, and drew an empty box until it answered (still empty two seconds after the text had drawn, in a probe on this machine), and forever offline; `render` fetches through its disk cache before the page loads, so it never showed. The bridge now has `api/emoji/<code points>.svg`, which accepts only Twemoji's own file names, fetches the pinned release into the renderer's asset cache once (concurrent requests share one fetch) and serves it from there, sandboxed like attachments. Studio maps Twemoji URLs to it when there is a bridge (`Backend.emojiUrl`); a draft loads from the CDN as before.

**Layout fixes.** Viewport heads (controls, caption, notes) in one row are made as tall as the tallest (`useLevelHeads`, measured on screen, levelled in the next frame to avoid a resize-observer loop), so drawings start level. A component picked in the preview has its form scrolled into view when it is not (`reveal` in `EditPanel`), which is what a narrow window needed. The selection outline no longer draws a glow next to the node and stands 3 pixels clear of it, so a container's accent bar is seen.

**Keyboard and screen reader.** Walked with the keyboard and the accessibility tree (Playwright `ariaSnapshot`) on a two-message scene. Found and fixed: focus dropped to the page when an undo removed the field that had it, when an undo removed a context entry being typed in, and when the last message was removed; `useFocusRescue` (`studio/focusRescue.ts`) now moves it to the tree's selected row, or the open tab's first control. The Surroundings tab's count is a badge hidden from the accessibility tree with its meaning in text ("Surroundings (1 not described)"). Unchanged and still worth a look: each tree row's grid cell repeats its name ("Fold Message Message …"), which react-aria builds from the row's content.

**Size.** Studio's JavaScript went from 905 kB (about 280 kB gzipped) to 944 kB (291 kB gzipped); CSS from 74 kB to 84 kB (15 kB gzipped). No dependency was added.

**Not done in 8c:** SKU editing; dragging rows; moving into another parent; keeping the history across a reload; carrying a bare payload's revealed spoilers and open select into an export (`render` has no option for them).

### 12f. As built (slice 7): modals

**In the scene.** A modal is one optional field, `Scene.modal: { payload, author?, values?, submitted? }`, not an entry among the messages. Discord shows one modal at a time, over the whole channel, so "the message with the button, then the modal it opens" is the messages plus a modal drawn over them; making `messages` a union of messages and modals would have touched every reader of a message (grouping, the header, Studio's list edits) for a sequence that can only end in one modal. `payload` is the `data` of a `MODAL` interaction response (`ModalCallbackData` in `@discordkit/client`), validated with the client's `modalCallbackDataSchema`. `messages` may be empty when there is a modal. Intake reads a bare modal (an object with `title` and `custom_id` and no `type`) as a scene of that modal over an empty channel, kind `modal`, and refuses a whole `{ "type": 9, "data": … }` response with a finding that says to pass its `data` rather than reading it as a Section. `modal.values` is keyed by `custom_id`, which is data, so its keys keep their spelling (`isDataKeyed`).

**Filled in and submitted.** Without `values` a modal is drawn as it opens, with only what the payload fills in (a text input's `value`, options marked `default`, a select's defaults). `values` replaces that per field: a string for a text input or a radio group, an array for a select's choices, a checkbox group's ticks or an upload's file names (a file listed in `context.attachments` shows its size), a boolean for a checkbox. `submitted` draws the error under each field the client would refuse: required and empty, a text under its `minLength`, fewer choices than `minValues`. `modal.ts` holds the one rule (`fieldValue`, `fieldCount`, `fieldProblem`) that the renderer, lint and the parts report all read.

**Where things are drawn.** `supportedComponents` gained three positions: `modal` (Label, Text Display, Action Row), `label` (a text input, the five selects, a file upload, a radio group, a checkbox group, a checkbox) and `modalActionRow` (a text input). Each list is also what Discord's reference allows there, so the list says both what is drawn and what is allowed. Lint reports a component outside the list with the finding that names where it belongs: `component-modal-only` (a modal's component in a message), `component-message-only` (a message's in a modal), `modal-component-position` (a select outside a Label, a Label in a Label), and `component-unsupported` only for what belongs nowhere. All four are `placementCodes`, which `render` and the command line stop on and Studio's preview refuses to draw; the spec that renders every type in every position now covers all eight positions and also checks lint against the renderer.

**The desktop dialog** is the build's newer design-system modal (the one other modules call the "Mana" modal), not the older `.root_*` modal at 442px: Discord's own screenshots of the dialog in its component reference measure 480px wide with two 211px buttons 8px apart, which only the newer one gives. From the stylesheet: 480px at most, the surface-high fill, a 1px subtle border, 12px corners, the high shadow, 24px either side, the 24px round app icon 12px before the title, the warning callout (8px padding, 4px corners, a 1px border and the fill in the warning colours, a 20px icon 10px before the text), the field's 8px to its control and 4px to its error, the 4px after the title before the red asterisk, the text input's box and its paragraph's padding and counter, the 20px checkbox and radio with their colours, the upload's box and its file cards, the two 40px buttons. From the screenshots, because the stylesheet leaves them to JavaScript: the title at 24px semibold, the callout text at 14px, labels at 16px semibold, descriptions at 14px, 24px between fields and 16px after the callout, 8px between a label and its description (the stylesheet's `gap` gives 4), a select and a single-line input 44px tall, an empty paragraph with a counter 90px tall (two lines), the radio's 8px dot, 16px between options, the upload's extra 12px inside its area, and the buttons' 16px semibold labels. The callout's wording ("This form will be submitted to …. Do not share passwords or other sensitive information.") is the screenshots'. Ours: the error text at 12px medium and its wording, the backdrop's darkness (`--background-scrim`; the modal layer sets its opacity in JavaScript), the counter counting down, a paragraph growing with its text, the upload's limit line without a size, the 16px either side of the dialog in a narrow column, and centring it in the chat column rather than the window. The messages behind keep to the bottom of the column, and the scene is as tall as whichever of the two is taller.

**The iOS layout** draws the same dialog as a sheet rising from the bottom of the screen, as wide as it, its top corners rounded at 16, a hairline across its top and nothing at its sides, with 40 points of the dimmed channel above it, 16 points either side of its content, and a Label's description under its field: Discord's reference says the description "may display above or below the component depending on the platform", and the desktop screenshots show it above. Nothing about modals has been captured in the app, so this is a choice, and `parts.ts` lists every modal part (`modal`, `modalLabel`, `shortTextInput`, `paragraphTextInput`, `modalSelect`, `fileUpload`, `radioGroup`, `checkboxGroup`, `checkbox`, `modalError`) with no capture, so every iPhone render with a modal says so. The capture kit lists a modal among the steps only the owner can do, since posting cannot open one.

**Lint** gained 24 codes, each against the live component reference and the interaction-response page read on 2026-11-27, each limit a named constant in `lint/limits.ts`, each with a spec that fails without it (`lint/__tests__/modal.spec.ts`), and a `modalComponents` count ("2 of 5 top-level modal components"). The reference's own rules: one to five top-level components; a title up to 45; a label up to 45 and a description up to 100; a text input's `min_length` 0 to 4000, `max_length` 1 to 4000, a value up to 4000 and a placeholder up to 100; a radio group of 2 to 10 options and a checkbox group of 1 to 10, each option's label, value and description up to 100; `min_values` and `max_values` 0 to 10 and 1 to 10 for checkbox groups and uploads; up to ten file types, each `image`, `video`, `audio` or a dotted extension; `min_values` left out or at least 1 when the field is required ("`min_values` must be either omitted or at least `1` if `required` is omitted or `true`"); a disabled select in a modal ("will result in an error"); a select's `required` ignored in a message; a text input's own `label` deprecated in a Label; the action row of a text input deprecated; unique custom ids in a modal; and the 4000 characters across a modal's text displays. Inferred rather than stated, and so warnings: a pre-filled value outside its own length limits, more than one radio option marked default, `required` on a checkbox, and a `modal.values` entry naming no field or of the wrong kind.

**Codegen** prints a modal as `export const modal: ModalCallbackData = { … }`, and a scene's modal after its messages in the same file; `--shape modal` prints only it. A Label's `component` is written with enum members like any component. The specs type-check the modal fixtures whose fields the client's types describe and evaluate every one back to its payload.

**Studio.** The modal is a row of the tree after the messages, with its Labels and their fields under it; `Add` offers a modal in a scene file and, inside one, only what `supportedComponents.modal` lists (the deprecated action row shown but disabled). Forms: the modal (title, id, "Show after Submit", remove), a Label (text, description, and the kind of field, which replaces it), a text input, the selects (with `required` in place of `disabled` in a modal), a file upload, radio and checkbox groups and a checkbox. Starting points gained "A button that opens a modal". `modal.values` is not in the forms: its keys are custom ids, which react-hook-form cannot take as field names, as with the context editor; it is edited in the JSON pane.

**Waiting on the client.** A correct modal gets `schema` findings for two shapes the client's schemas get wrong: a Text Input in a Label without its deprecated `label` (the client's `TextInput` requires one), and the older action row holding a Text Input in an array (the client's `ActionRow` takes a bare text input, the same defect #106 fixes for selects). A select's modal-only `required` is missing from the client's types but passes the schema, which drops unknown keys. The fixtures are written as Discord expects, and the specs that read them say which findings to expect and why.

## 13. Slices

Each slice is implemented by a sub-agent from a written brief and reviewed against its criteria before the next starts.

| #        | Slice                                                                             | Done when                                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0        | Client schema fixes (§11). **Implemented**, PR #106.                              | Each defect has a spec that fails before the fix; `vp check` and `vp test` pass; bump file added.                                                                                                                        |
| 1        | Package skeleton and pipeline proof. **Implemented.**                             | A container with one text display builds with `vp pack`, renders to a PNG from Node, and passes a computed-style spec in the browser project. The CSS Modules output shape and the JSR question are answered in writing. |
| 2        | Markdown parser. **Implemented.**                                                 | Every quirk in §6 is a passing test; rule sets per context are data.                                                                                                                                                     |
| 3a       | Text rendering, scene context, message chrome, asset loader. **Implemented.**     | Markdown, mentions, timestamps and emoji render to Discord's styles against a fixed clock; a render reaches nothing on the network.                                                                                      |
| 3b       | Separator, media gallery, action row and buttons, legacy embeds. **Implemented.** | Inbou's and Tome's real cards render completely, in all four themes, each component with computed-style specs.                                                                                                           |
| 4a       | Scene intake, lint, codegen. **Implemented.**                                     | An agent can hand over snake_case JSON and get back a normalised scene, findings with counts, and TypeScript that compiles and round-trips.                                                                              |
| 4b       | CLI, gg sans and CJK font options, HTML output, image diff. **Implemented.**      | An agent can render, lint, generate code and compare two renders with one command each, and read every result as JSON.                                                                                                   |
| 5        | Dogfood                                                                           | Inbou and Tome render their real cards through the tool from their own specs; Tome's `sample:post` is no longer needed for layout review.                                                                                |
| C        | Calibration (parallel, needs the owner)                                           | Reference files exist for the fixture set from the live client; every deviation found is fixed or recorded.                                                                                                              |
| 6        | Remaining message components. **Implemented.**                                    | Section, thumbnail, file, all five selects.                                                                                                                                                                              |
| 7        | Modals. **Implemented** (§12f).                                                   | Label, text input, file upload, radio and checkbox groups.                                                                                                                                                               |
| 8a to 8c | Studio, the editor                                                                | See the slice table in §12.                                                                                                                                                                                              |

## 14. Repo conventions this package must follow

- `exports` with the private `@discordkit/source` condition, `sideEffects` limited to the stylesheet, `.js` import specifiers, and the shared `vp pack` config plus the stylesheet hook described in §4a.
- DOM tests run in the `browser` Vitest project as `*.browser.spec.tsx`. No happy-dom or jsdom.
- A bump file per pull request once the package is public. Until then it is `private` and on the bumpy `ignore` list.
- **npm only, not JSR** (§4a). This is the one package in the repo with that exception, so `scripts/jsr-sync.mjs` and `scripts/jsr-publish.mjs` must skip it when it is made public.
- The first npm publish of a new package is manual.

## 15. Open questions

1. **Names.** `@discordkit/preview` and `discordkit-preview` are placeholders.
2. **Whether a saved page is usable.** The calibration route is settled (§7): screenshots of bot-posted fixtures, with nothing driving the owner's account. Still unknown is whether a page saved from the web client keeps enough of the rendered messages and styles to read measurements from offline. One save would answer it.
3. **What macOS actually draws for Japanese under an English locale.** The CJK pinning in §7 assumes Hiragino for both kana and kanji. One screenshot of an Inbou card from a student's Mac settles it.
4. **Native mobile.** v0 matches the web client at narrow widths. Whether a calibrated "phone" profile is worth building is decided after dogfooding, from the screenshots collected in calibration.
5. **Screenshot baselines in CI.** Local-only at first; revisit once the renderer is stable.
6. **Unverified rendering choices from slice 3a, most doubtful first.** Where "(edited)" sits on a Components V2 message; the rule for grouping consecutive messages; rounding and wording of relative timestamps ("in 59 minutes", "in 1 day" versus "tomorrow"); the header time format per locale; the text shown for unknown users, roles and channels; role-mention tinting; the jumbo-emoji threshold; the ephemeral notice's wording and position.
7. **Unverified rendering choices from slice 3b, most doubtful first.** The gallery layouts for 5 to 10 items and the sizing of a single picture; what a two-picture band does when the shapes differ; the look of a Premium button; link buttons drawn in the secondary style; embed text sizes and line heights, which Discord sets in JavaScript; embed thumbnail and image maximums; inline-field placement and column widths; the width of an emoji-only button (60px here, 32px in Discord's newer button component); an embed colour of 0. (A container's `spoiler`, missing then, is drawn since slice 6.)
8. **Unverified rendering choices from slice 6, most doubtful first.** A closed select's fill and border (taken from Discord's input field), which leave a string select's tags nearly invisible in the dark and light themes; the select's text sizes (16px placeholder and tags, 14px pills) and the 20px chevron; whether pills are used for a single default member, role or channel; the open list showing every option where the client's scrolls, and its descriptions wrapping rather than cut; the 20px selected mark; the default placeholder "Make a selection"; a member's, role's and channel's icons in a select; the file size's wording and units; the file name's 16px and the size's 12px; no download button on a file; a thumbnail's loading box colour; the spoiler cover's 8px corners on a container; and that a section never centres its text against a taller accessory.
9. **To settle in calibration.** Whether a V2 message shrinks to its content (Discord's rule is `width: fit-content`, so a short card is narrower than the column); whether a section's accessory counts toward the 40-component limit (the client schema now counts it); which element paints the chat background in each theme; and whether the reduced 14px text size applies to every text display or only inside a container.
