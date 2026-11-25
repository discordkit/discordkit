<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg">
  <img alt="Discordkit" src="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg">
</picture>

[![CI status][ci_badge]][ci]

Draw a Discord message the way the Discord web client does, without posting it.

</div>

---

`@discordkit/preview` turns a message payload into a PNG, so a coding agent (or you) can see what a bot's message will look like without a bot token, a test channel or a person sending screenshots back. It also lints the payload against Discord's limits, prints it as TypeScript, and compares two images. Every command can answer in JSON, so an agent can change a message, run one command, read the result, look at the image, and decide what to change next.

Previews follow the values in Discord's published stylesheet, but they **have not yet been calibrated against the live client**, so treat a render as a close preview, not a pixel-exact one. This package is **not affiliated with or endorsed by Discord**.

## 📦 Installation

```bash
npm install @discordkit/preview playwright
npx playwright install chromium
```

`playwright` is an optional peer dependency: only `render` (and `renderScene` / `render` in the Node API) needs it, to drive headless Chromium. `lint`, `codegen` and `diff` work without it. To use a Chrome or Edge that is already installed instead of downloading Playwright's Chromium, pass `--channel chrome` (or `--channel msedge`).

The package ships to npm only. It is not on JSR, which accepts only JavaScript and TypeScript modules, and this package ships a stylesheet.

## 🔧 The command line

```
discordkit-preview render  [input...]   Draw each input to a PNG (or HTML with --html)
discordkit-preview lint    [input...]   Check each input against Discord's schemas and limits
discordkit-preview codegen [input]      Print TypeScript source for an input
discordkit-preview diff    <a> <b>      Compare two PNGs and write a diff image
```

An input is a JSON file holding any of: a whole scene (see [The scene](#-the-scene)), a message body as you would send it, an array of components, or one component. Keys can be Discord's `snake_case`, discordkit's `camelCase`, or a mix. With no input file, or `-`, a command reads standard input. `discordkit-preview <command> --help` lists every option.

### Exit status

| Status | Meaning                                                                                    |
| ------ | ------------------------------------------------------------------------------------------ |
| `0`    | It ran, and found nothing wrong (warnings allowed). For `diff`: the images match.          |
| `1`    | It ran, and an input has errors or could not be drawn. For `diff`: the images differ.      |
| `2`    | It could not run: bad arguments, an unreadable file, no browser, or the package not built. |

With `--json`, every command prints exactly one JSON document on standard output and nothing else there, including when it could not run (`{ "error": { "message": "…" } }`). Progress and diagnostics go to standard error. Every message says what happened, why, and what to do next.

### `render`

```bash
discordkit-preview render question.json --scale 2
```

```
question.json: wrote /path/to/question.png (1200x952, 0 errors, 0 warnings)
  fonts: Noto Sans JP (128, installed on this machine), Noto Sans (120), Microsoft YaHei (15, installed on this machine)
  note: Chinese, Japanese or Korean text in this scene was drawn with fonts installed on this machine (Noto Sans JP (128 glyphs), Microsoft YaHei (15 glyphs)), as the Discord client does, so the image shows what this machine draws, not what every viewer sees: under an English locale, Windows draws kanji in a Chinese-design font, while macOS is believed to draw them in Hiragino. To draw the same image on every machine, pin CJK text to the bundled Japanese-design Noto Sans JP: `--cjk noto-sans-jp` on the command line, or `cjk: "noto-sans-jp"` in the Node API.
```

The image is written beside its input unless you pass `--out <file>` (one input) or `--out-dir <dir>` (any number). Several inputs in one call share one browser, which is most of a single render's cost (about 3 seconds to launch, then a few hundred milliseconds a render):

```bash
discordkit-preview render open.json closed.json --out-dir renders --json
cat payload.json | discordkit-preview render --out preview.png
```

The image is written even when the message has errors, as long as it can be drawn, because seeing a broken message is often the point. A message holding a component the renderer does not support yet is not drawn: the result has a `component-unsupported` error finding that says so and what to remove, and no image.

With `--json`, the same render prints:

```json
{
  "results": [
    {
      "input": "question.json",
      "kind": "message",
      "valid": true,
      "output": "/path/to/question-pinned.png",
      "format": "png",
      "width": 1200,
      "height": 952,
      "findings": [],
      "counts": [
        {
          "metric": "components",
          "path": [],
          "used": 13,
          "limit": 40,
          "summary": "13 of 40 components"
        },
        {
          "metric": "textDisplayCharacters",
          "path": [],
          "used": 272,
          "limit": 4000,
          "summary": "272 of 4,000 text display characters"
        }
      ],
      "fonts": {
        "used": [
          { "family": "Noto Sans JP Thin", "system": false, "glyphs": 143 },
          { "family": "Noto Sans", "system": false, "glyphs": 120 }
        ],
        "machineDependent": false
      }
    }
  ]
}
```

(That one was rendered with `--cjk noto-sans-jp --out question-pinned.png`.) `output`, `width`, `height` and `fonts` are `null` when nothing could be drawn. `width` and `height` are in device pixels, so `--scale 2` doubles them.

| Option                                                | Does                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `-o, --out <file>` / `--out-dir <dir>`                | Where to write. Default: beside each input file, or `preview.png` in the working directory for stdin. |
| `--html`                                              | Write one self-contained HTML file instead of a PNG (see [HTML output](#-html-output)).               |
| `--theme <light\|ash\|dark\|onyx>`                    | Discord's appearance setting. Replaces the scene's. Default `dark`.                                   |
| `--width <px>`                                        | Width of the chat column in CSS pixels. Default 600.                                                  |
| `--scale <n>`                                         | Device pixels per CSS pixel, up to 4. Default 1.                                                      |
| `--now <iso>`, `--time-zone <iana>`, `--locale <tag>` | The viewer's clock, zone and Discord language. Defaults: a fixed instant, `UTC`, `en-US`.             |
| `--gg-sans <path>`, `--cjk <font>`                    | Font options (see [Fonts](#-fonts)).                                                                  |
| `--offline`, `--cache-dir <dir>`                      | Draw only images already in the asset cache; where that cache is.                                     |
| `--channel <name>`                                    | Drive an installed browser (`chrome`, `msedge`, …) instead of Playwright's Chromium.                  |

### `lint`

```bash
discordkit-preview lint question.json card.json
```

```
question.json: valid (0 errors, 0 warnings)
  13 of 40 components
  272 of 4,000 text display characters
card.json: valid (0 errors, 2 warnings)
  warning subtext-missing-space  components[0].components[0].content
          The line "-#Small print" in a Text Display starts with `-#` but no space after it, so Discord shows the `-#` literally instead of drawing the line as small, muted subtext. Put a space after `-#`.
  warning attachment-missing  components[0].components[1].items[0].media.url
          `attachment://card.png` names a file the scene does not have: `context.attachments` has no entry called "card.png". […]
  3 of 40 components
  13 of 4,000 text display characters
```

Every finding is `{ code, severity, path, message }`, plus `asset` for one about an image. `path` points into the input as you wrote it, so a snake_case input gets snake_case paths. `severity` is `error` when Discord would refuse the message or the preview cannot draw it, and `warning` when it would send but probably not look or behave as intended. The counts show how much of each limit is used, whether or not it is broken. With `--json`: `{ "results": [{ "input", "kind", "valid", "findings", "counts" }] }`.

### `codegen`

```bash
discordkit-preview codegen question.json
```

```ts
import {
  ButtonStyle,
  ComponentType,
  MessageFlag,
  type MessagesCallbackData
} from "@discordkit/client";

export const message: MessagesCallbackData = {
  flags: MessageFlag.IS_COMPONENTS_V2,
  components: [
    {
      type: ComponentType.Container,
      accentColor: 0x2f4b6e,
      components: [
        {
          type: ComponentType.TextDisplay,
          content: `**もんだい4** · 18 / 24 · ends <t:1795604745:R> · 3 answered`
        },
        // …
```

`--shape components|embeds|message` picks what to declare and `--name` names the constant. Findings go to standard error, so the source can be redirected to a file. With `--json`: `{ "input", "kind", "valid", "source", "findings" }`.

### `diff`

```bash
discordkit-preview diff question.png question-pinned.png
```

```
different: 5076 of 1142400 pixels (0.44%) in a 879x579 box at 178,131
  diff image: /path/to/question.diff.png
```

With `--json`:

```json
{
  "a": { "path": "/path/to/question.png", "width": 1200, "height": 952 },
  "b": { "path": "/path/to/question-pinned.png", "width": 1200, "height": 952 },
  "identical": false,
  "sameSize": true,
  "differentPixels": 5076,
  "totalPixels": 1142400,
  "ratio": 0.004443277310924369,
  "box": { "x": 178, "y": 131, "width": 879, "height": 579 },
  "tolerance": 0,
  "output": "/path/to/question.diff.png"
}
```

The images are compared pixel by pixel, aligned at their top-left corners, after multiplying each colour by its alpha (so fully transparent pixels always match). Images of different sizes are compared over the larger size, and every pixel only one image has counts as different. The diff image is the first image faded to light grey with every differing pixel in red. `--out <file>` names it; by default it is written beside the first image as `<name>.diff.png`.

`--tolerance <0-255>` is how far apart two pixels' colour channels may be and still match. It defaults to `0`, because this package draws the same input to the same bytes, so any difference between two of its renders is a real change. Raise it (8 is a reasonable start) when one image comes from another tool that may round colours differently.

Any PNG works, not only this package's renders: a screenshot of the Discord client taken by another tool is read the same way. The reader handles every PNG colour type and bit depth, palettes, transparency and interlacing, with Node's own zlib and no browser. It compares the stored colour values and ignores embedded colour profiles.

## 🧩 The Node API

The command line is a thin layer over these, so anything it does a test or script can do directly:

```ts
import { writeFile } from "node:fs/promises";
import { diffImages, render } from "@discordkit/preview/node";

const { valid, findings, counts, image } = await render(payload, {
  scale: 2,
  cjk: `noto-sans-jp`
});
if (image) await writeFile(`preview.png`, image.png);
```

| Import                         | What                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@discordkit/preview/node`     | `render(input, options)`: what the `render` command runs per input; reads any input, lints it and draws it, with one findings list. `renderScene(scene, options)`: draws an already normalised scene. `diffImages(a, b, { tolerance })`: the `diff` command. |
| `@discordkit/preview/lint`     | `lint(input)`: findings, counts and `valid`, with no browser.                                                                                                                                                                                                |
| `@discordkit/preview/codegen`  | `codegen(input, { shape, name })`: TypeScript source.                                                                                                                                                                                                        |
| `@discordkit/preview/scene`    | `readScene(input)`: any input as a normalised camelCase scene, with intake findings.                                                                                                                                                                         |
| `@discordkit/preview/markdown` | `parseMarkdown(source, context)`: Discord-flavoured markdown to a typed AST.                                                                                                                                                                                 |
| `@discordkit/preview/react`    | `<Scene>` and the components it draws with, for showing a preview in your own React app (import `@discordkit/preview/react/styles.css` too).                                                                                                                 |

`scene`, `lint`, `codegen` and `markdown` use no Node built-ins, React or Playwright, so they run anywhere. Pass a `browser` you launched yourself to `render` or `renderScene` to reuse it across renders; it must be Chromium.

## 🎬 The scene

A bare payload is enough to draw one message from an app called "App". A scene adds what a payload does not carry: who sent each message, what mentions and custom emoji resolve to, local files for `attachment://` images, and the viewer's clock, zone, language, theme and window width.

```json
{
  "messages": [
    {
      "author": "1311000000000000001",
      "payload": {
        "flags": 32768,
        "components": [
          {
            "type": 10,
            "content": "<@&1311000000000000201> Question 4 is open."
          }
        ]
      }
    },
    {
      "author": "1311000000000000001",
      "edited": true,
      "payload": {
        "flags": 32768,
        "components": [{ "type": 10, "content": "-# Question 4 has closed." }]
      }
    }
  ],
  "context": {
    "users": {
      "1311000000000000001": {
        "name": "Inbou",
        "bot": true,
        "avatar": "attachment://inbou.png"
      }
    },
    "roles": {
      "1311000000000000201": { "name": "Students", "color": 3447003 }
    },
    "attachments": { "inbou.png": { "path": "./assets/inbou.png" } }
  },
  "now": "2026-11-25T11:05:00Z",
  "timeZone": "Asia/Tokyo",
  "locale": "en-US",
  "theme": "dark",
  "width": 600
}
```

Messages stack top to bottom as they would in a channel, so a card before and after an edit can be shown in one image. Every field but `messages` is optional, and the clock defaults to a fixed instant, so a scene renders the same on any day. Images named by URL (avatars, custom emoji, Unicode emoji as Twemoji) are fetched once and kept in a disk cache, and the browser itself never touches the network, so the same scene gives byte-identical PNG and HTML. An image that cannot be had is drawn as a placeholder and reported as a finding.

## 🔤 Fonts

Discord's own font, gg sans, cannot be redistributed, so text is drawn with the bundled Noto Sans, which is Discord's own first fallback. Line breaks can then fall differently from the real client.

**Bring your own gg sans.** If you have gg sans, point `--gg-sans` (Node: `ggSans`) at a font file or a directory of them (`.ttf`, `.otf`, `.woff` or `.woff2`). Each file's weight and style are read from the file itself, so hashed file names are fine. The renderer then declares gg sans from those files and draws with it; without the option it never uses a gg sans installed on the machine, so an image does not depend on whether one is. Nothing about gg sans is shipped or downloaded.

**CJK pinning.** By default, Japanese, Chinese and Korean text falls back to the fonts installed on the machine, through the font stack Discord uses for the scene's locale, as it does in the real client. That makes the image depend on the machine. It matters most for a bot whose audience is not on the developer's platform: under an English locale, Windows draws kana in a Japanese font and kanji in a Chinese-design one (Microsoft YaHei), while macOS is believed to draw both in Hiragino. A render on Windows then shows kanji its users will never see.

`--cjk noto-sans-jp` (Node: `cjk: "noto-sans-jp"`) pins CJK text to the bundled Noto Sans JP, a Japanese-design font, so the image is the same on every machine and in CI, and its glyph shapes are closer to what macOS draws. Only the slices of the font the text uses are loaded. Korean Hangul is not in it, so Korean still falls back to the machine. To see what one particular machine does, leave it unpinned.

Every render reports which fonts drew the text (`fonts.used`: the family name inside each font file, whether it is installed on this machine, and how many glyphs it drew). When CJK text is left unpinned, or any text was drawn with an installed font, `fonts.machineDependent` is true and `fonts.note` says which fonts and what to do. This is information about the image, not a problem with the message, so it is reported beside the findings rather than as one. The bundled Noto Sans JP names itself "Noto Sans JP Thin", after its default instance; it is a variable font and draws every weight.

## 📄 HTML output

`render --html` (Node: `html: true`) writes one file that opens anywhere: the markup, the stylesheet, and the fonts and images it uses inlined as `data:` URLs, with no scripts and no network requests. Spoilers reveal on click without JavaScript. Only the font files the text actually uses are inlined, so the Inbou question card above is about 280 KB with CJK pinned. Without `--cjk noto-sans-jp`, CJK text in the file uses the viewer's own fonts.

## 🚧 Not supported yet

- **Components**: Section, Thumbnail, File and the select menus are not drawn yet; a message holding one gets a `component-unsupported` finding and no image. Modals, polls, reactions, replies, threads and forwarded messages are not drawn.
- **Calibration**: values come from Discord's stylesheet. Layout Discord decides in JavaScript (media gallery layouts for five or more items, embed text sizes, relative-timestamp wording) is inferred and has not been checked against the live client.
- **Mobile**: previews match the web client at the width you give, not the native mobile apps.
- **Markdown**: no syntax highlighting in code blocks.
- **Lint**: misspelled keys pass silently, because the client schemas drop unknown keys; character counts use Unicode code points, and whether Discord counts UTF-16 units instead is unverified.

## 🥂 License

[MIT][license] © [Drake Costa][personal-website]. Third-party material (Twemoji graphics, adapted code) is listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). Noto Sans and Noto Sans JP are installed from their fontsource packages under the SIL Open Font License.

[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[license]: https://github.com/discordkit/discordkit/blob/main/LICENSE.md
[personal-website]: https://saeris.gg
