# Capturing the real Discord client

<!-- Written by `vp run calibration:instructions` from scripts/calibration/captureSet.ts. Edit that file, not this one. -->

A bot posts test messages to a channel in your test server, you take screenshots of them, and an agent measures them afterwards. Nothing here logs in as you or controls your Discord.

**The essential part is the whole job: 5 numbered tests, then 10 screenshots on your computer and 9 on your phone.** What Inbou and Tome actually send: their question card with every kind of text they use, buttons open and closed, galleries of one to three pictures, the classic embeds, an edited message, and the light theme on the cards. This is the part that matters. Two optional follow-ups come at the end, for another day if ever.

## 1. Once, before you start

1. In your test server, make a text channel for this, such as `#calibration`.
2. Make a bot: at https://discord.com/developers/applications press **New Application**, name it, open **Bot**, press **Reset Token** and copy the token. Keep it to yourself.
3. Invite it: open `https://discord.com/oauth2/authorize?client_id=<application id>&scope=bot&permissions=117760`, with the application id from **General Information**, and pick your test server. That grants it View Channels, Send Messages, Embed Links, Attach Files and Read Message History.
4. Make a webhook for the labels: in the channel's settings, **Integrations**, **Webhooks**, **New Webhook**, then **Copy Webhook URL**. It posts the grey label line above each test message, as a different author, so each keeps its own header.
5. Turn on **Developer Mode** (User Settings, **Advanced**), then right-click the channel and **Copy Channel ID**.

## 2. Post

In PowerShell at the repository root. Each `Read-Host` asks for a value without showing it or keeping it in your history; they last until you close the window and are never written to a file.

```powershell
$env:DISCORD_CALIBRATION_BOT_TOKEN = [Net.NetworkCredential]::new('', (Read-Host -AsSecureString 'Bot token')).Password
$env:DISCORD_CALIBRATION_WEBHOOK_URL = [Net.NetworkCredential]::new('', (Read-Host -AsSecureString 'Webhook URL')).Password
$env:DISCORD_CALIBRATION_CHANNEL_ID = Read-Host 'Channel id'
vp run build
vp run calibration:post --send
```

That posts F01 to F05 in about 1 minute and writes a list of what it posted to `.discord-reference/posted/`, which git ignores. If it stops, it says why. To see what it would send without sending anything, leave out `--send`.

## 3. Settings

Desktop:

- Dark theme (User Settings, **Appearance**). The light theme comes at the end.
- Zoom at 100%: press Ctrl+0 in Discord.
- Take each screenshot with Win+Shift+S, rectangle mode. Windows saves it as a PNG in `Pictures\Screenshots`. Do not resize it, paste it into a chat or save it as JPEG.
- Keep the window at least 1280 wide, with the member list as you like it.

iPhone:

- Dark theme.
- In the iPhone's Settings, **Photos**, **Transfer to Mac or PC**, choose **Keep Originals**, so screenshots reach the PC unchanged.
- Take each screenshot with the side button and volume up together. Leave it as it is: no crop, no markup.

Every screenshot: the grey label line (such as `F01 · The bots' question card…`) at the top, the whole test message under it, nothing cut off. If one does not fit on your screen, take it in two screenshots, the top and then the bottom, overlapping a little. If the next one also fits whole, label and all, one screenshot can hold both: tick both.

## 4. Screenshots

#### On your computer: 10 screenshots

- [ ] **F01** The bots' question card, edited.
- [ ] **F02** The closed card, a row outside it, and the next card in the group.
- [ ] **F03** A large 3:2 picture, described; then a large wide and tall pair.
- [ ] **F04** Three large pictures of mixed shape.
- [ ] **F05** Inbou's classic embed question and reveal.

Then the things only you can do:

- [ ] **The light theme.** Switch Discord to the Light theme, take one screenshot each of F01 and F05, then switch back to Dark.
- [ ] **Yesterday's and older headers.** Tomorrow, scroll back to F01 and screenshot its header again. Two or more days later, once more.
- [ ] **The whole window.** Take one screenshot of the entire Discord window, uncropped, scrolled to F01.

#### On your iPhone: 9 screenshots

- [ ] **F01** The bots' question card, edited.
- [ ] **F02** The closed card, a row outside it, and the next card in the group.
- [ ] **F03** A large 3:2 picture, described; then a large wide and tall pair.
- [ ] **F04** Three large pictures of mixed shape.
- [ ] **F05** Inbou's classic embed question and reveal.

Then the things only you can do:

- [ ] **The light theme.** Switch Discord to the Light theme, take one screenshot each of F01 and F05, then switch back to Dark.
- [ ] **Yesterday's and older headers.** Tomorrow, scroll back to F01 and screenshot its header again. Two or more days later, once more.

## 5. Getting the files in

1. Desktop: move this session's screenshots from `Pictures\Screenshots` into a new folder, such as `Pictures\calibration-desktop`.
2. iPhone: connect it to the PC with a cable, unlock it and tap **Trust**. In File Explorer open **Apple iPhone**, **Internal Storage**, **DCIM**, and copy the screenshots (`IMG_….PNG`) into a new folder, such as `Pictures\calibration-iphone`. Not through email, chat apps or iCloud's web page, which shrink or convert them.
3. File both folders:

```powershell
vp run calibration:ingest "$HOME\Pictures\calibration-desktop"
vp run calibration:ingest "$HOME\Pictures\calibration-iphone"
```

They are copied to `.discord-reference/captures/calibration/`, which git ignores, with an index of each file's size. Your originals are not touched. Screenshots never go into the repository or anywhere else.

## 6. Cleaning up

Once the screenshots are in, including the next days' headers, run `vp run calibration:delete` once for each time you posted. Each run deletes exactly the messages one post listed, newest first, and nothing else. Delete the bot and the webhook afterwards if you like.

## Optional follow-ups

Only if the essential part is done and you have another sitting in you. Each is posted on its own and ticked off the same way, with the same settings and the same way of getting the files in.

### Extended: 72 screenshots on your computer, 71 on your phone

Everything else a message can hold: galleries of every count from one to ten in two picture sizes, every button style, long labels, an embed with every part, the rest of the text formatting, sections and thumbnails, selects, files, spoilers, components outside a container, separators, and the ash and onyx themes and a narrow window. Post it with `vp run calibration:post --send --tier extended` (F06 to F54, about 2 minutes).

#### On your computer: 72 screenshots

- [ ] **F06** 1 large square (1024 × 1024).
- [ ] **F07** 2 large squares (1024 × 1024).
- [ ] **F08** 3 large squares (1024 × 1024).
- [ ] **F09** 4 large squares (1024 × 1024).
- [ ] **F10** 5 large squares (1024 × 1024).
- [ ] **F11** 6 large squares (1024 × 1024).
- [ ] **F12** 7 large squares (1024 × 1024).
- [ ] **F13** 8 large squares (1024 × 1024).
- [ ] **F14** 9 large squares (1024 × 1024).
- [ ] **F15** 10 large squares (1024 × 1024). Two screenshots: the top, then the bottom.
- [ ] **F16** 1 small wide picture (256 × 144).
- [ ] **F17** 2 small wide pictures (256 × 144).
- [ ] **F18** 3 small wide pictures (256 × 144).
- [ ] **F19** 4 small wide pictures (256 × 144).
- [ ] **F20** 5 small wide pictures (256 × 144).
- [ ] **F21** 6 small wide pictures (256 × 144).
- [ ] **F22** 7 small wide pictures (256 × 144).
- [ ] **F23** 8 small wide pictures (256 × 144).
- [ ] **F24** 9 small wide pictures (256 × 144).
- [ ] **F25** 10 small wide pictures (256 × 144). Two screenshots: the top, then the bottom.
- [ ] **F26** Large wide (1600 × 900); then tiny square (32 × 32).
- [ ] **F27** Large tall (900 × 1600).
- [ ] **F28** Small tall (144 × 256); then small square (128 × 128).
- [ ] **F29** Large wide (1600 × 900), large tall (900 × 1600).
- [ ] **F30** Small wide (256 × 144), small tall (144 × 256).
- [ ] **F31** Large square (1024 × 1024), small square (128 × 128).
- [ ] **F32** Large tall (900 × 1600), large wide (1600 × 900), large square (1024 × 1024).
- [ ] **F33** Large wide (1600 × 900), large tall (900 × 1600), large square (1024 × 1024), large panorama (2100 × 900).
- [ ] **F34** Buttons: every style, disabled, with emoji, five in a row.
- [ ] **F35** Buttons with long labels.
- [ ] **F36** Classic embed with every part.
- [ ] **F37** Two embeds in one message, with text and buttons.
- [ ] **F38** Text: headings and subtext.
- [ ] **F39** Text: quotes, lists and code.
- [ ] **F40** Text: inline styles, links and spoilers.
- [ ] **F41** Text: mentions and emoji.
- [ ] **F42** Text: every timestamp style.
- [ ] **F43** Sections with thumbnails.
- [ ] **F44** Sections with buttons.
- [ ] **F45** Thumbnails of every shape.
- [ ] **F46** String selects. Then: click (or tap) the first select, "Choose your level", so its list opens, and take a second screenshot with the list open.
- [ ] **F47** User, role, mentionable and channel selects.
- [ ] **F48** Files.
- [ ] **F49** Spoilered container, thumbnail and file. Then: click (or tap) each spoiler in this fixture so it is revealed, and take a second screenshot.
- [ ] **F50** Spoilered gallery picture and text. Then: click (or tap) each spoiler in this fixture so it is revealed, and take a second screenshot.
- [ ] **F51** Components outside a container.
- [ ] **F52** Two containers in one message.
- [ ] **F53** Separators: both spacings, with and without a line.
- [ ] **F54** Edited messages, and messages continuing a group.

Then the things only you can do:

- [ ] **Other themes.** Switch Discord to each of its other themes (Light, Ash, Onyx; on iPhone, each the app offers) and take one screenshot of each of F34, F37, F41, F46 in each theme. Switch back to Dark when done.
- [ ] **A narrow window.** Drag the Discord window as narrow as it goes and take one screenshot each of F34, F43, F06. Then widen it again.
- [ ] **An ephemeral reply.** Posting cannot make one: it is a reply to an interaction. If a bot of yours answers a command with a message only you can see, run it in the test channel and screenshot the reply. Otherwise skip this.
- [ ] **A modal.** Posting cannot open one: a modal is a bot's answer to a button or a command. If a bot of yours opens a modal with a text input, a select or a checkbox in it, open it in the test channel and screenshot it as it opens; then type in one field, leave a required one empty, press Submit and screenshot it again. Otherwise skip this.

#### On your iPhone: 71 screenshots

- [ ] **F06** 1 large square (1024 × 1024).
- [ ] **F07** 2 large squares (1024 × 1024).
- [ ] **F08** 3 large squares (1024 × 1024).
- [ ] **F09** 4 large squares (1024 × 1024).
- [ ] **F10** 5 large squares (1024 × 1024).
- [ ] **F11** 6 large squares (1024 × 1024).
- [ ] **F12** 7 large squares (1024 × 1024).
- [ ] **F13** 8 large squares (1024 × 1024).
- [ ] **F14** 9 large squares (1024 × 1024).
- [ ] **F15** 10 large squares (1024 × 1024). Two screenshots: the top, then the bottom.
- [ ] **F16** 1 small wide picture (256 × 144).
- [ ] **F17** 2 small wide pictures (256 × 144).
- [ ] **F18** 3 small wide pictures (256 × 144).
- [ ] **F19** 4 small wide pictures (256 × 144).
- [ ] **F20** 5 small wide pictures (256 × 144).
- [ ] **F21** 6 small wide pictures (256 × 144).
- [ ] **F22** 7 small wide pictures (256 × 144).
- [ ] **F23** 8 small wide pictures (256 × 144).
- [ ] **F24** 9 small wide pictures (256 × 144).
- [ ] **F25** 10 small wide pictures (256 × 144).
- [ ] **F26** Large wide (1600 × 900); then tiny square (32 × 32).
- [ ] **F27** Large tall (900 × 1600).
- [ ] **F28** Small tall (144 × 256); then small square (128 × 128).
- [ ] **F29** Large wide (1600 × 900), large tall (900 × 1600).
- [ ] **F30** Small wide (256 × 144), small tall (144 × 256).
- [ ] **F31** Large square (1024 × 1024), small square (128 × 128).
- [ ] **F32** Large tall (900 × 1600), large wide (1600 × 900), large square (1024 × 1024).
- [ ] **F33** Large wide (1600 × 900), large tall (900 × 1600), large square (1024 × 1024), large panorama (2100 × 900).
- [ ] **F34** Buttons: every style, disabled, with emoji, five in a row.
- [ ] **F35** Buttons with long labels.
- [ ] **F36** Classic embed with every part. Two screenshots: the top, then the bottom.
- [ ] **F37** Two embeds in one message, with text and buttons.
- [ ] **F38** Text: headings and subtext.
- [ ] **F39** Text: quotes, lists and code.
- [ ] **F40** Text: inline styles, links and spoilers.
- [ ] **F41** Text: mentions and emoji.
- [ ] **F42** Text: every timestamp style.
- [ ] **F43** Sections with thumbnails. Two screenshots: the top, then the bottom.
- [ ] **F44** Sections with buttons.
- [ ] **F45** Thumbnails of every shape.
- [ ] **F46** String selects. Then: click (or tap) the first select, "Choose your level", so its list opens, and take a second screenshot with the list open.
- [ ] **F47** User, role, mentionable and channel selects.
- [ ] **F48** Files. Two screenshots: the top, then the bottom.
- [ ] **F49** Spoilered container, thumbnail and file. Then: click (or tap) each spoiler in this fixture so it is revealed, and take a second screenshot.
- [ ] **F50** Spoilered gallery picture and text. Then: click (or tap) each spoiler in this fixture so it is revealed, and take a second screenshot.
- [ ] **F51** Components outside a container.
- [ ] **F52** Two containers in one message.
- [ ] **F53** Separators: both spacings, with and without a line.
- [ ] **F54** Edited messages, and messages continuing a group.

Then the things only you can do:

- [ ] **Other themes.** Switch Discord to each of its other themes (Light, Ash, Onyx; on iPhone, each the app offers) and take one screenshot of each of F34, F37, F41, F46 in each theme. Switch back to Dark when done.
- [ ] **An ephemeral reply.** Posting cannot make one: it is a reply to an interaction. If a bot of yours answers a command with a message only you can see, run it in the test channel and screenshot the reply. Otherwise skip this.
- [ ] **A modal.** Posting cannot open one: a modal is a bot's answer to a button or a command. If a bot of yours opens a modal with a text input, a select or a checkbox in it, open it in the test channel and screenshot it as it opens; then type in one field, leave a required one empty, press Submit and screenshot it again. Otherwise skip this.

### Markdown cases: 21 screenshots, on your computer only

The 122 markdown cases the parser only assumes, each posted on its own and numbered, to see how the client really parses them. Post them with `vp run calibration:post --send --tier markdown` (F55 to F75, about 3 minutes). Each case starts with its number, such as `M012`, on a line of its own.

They are asked for on desktop only. Whether a string parses as bold is a property of the parser, and nothing yet suggests the iOS app parses differently from desktop; how text looks on a phone is covered by the essential and extended tiers. To check that assumption, take the same 21 screenshots on your iPhone too: nothing else changes.

#### On your computer: 21 screenshots

- [ ] **F55** Markdown in messages, M001–M006.
- [ ] **F56** Markdown in messages, M007–M012.
- [ ] **F57** Markdown in messages, M013–M020.
- [ ] **F58** Markdown in messages, M021–M028.
- [ ] **F59** Markdown in messages, M029–M035.
- [ ] **F60** Markdown in messages, M036–M043.
- [ ] **F61** Markdown in messages, M044–M054.
- [ ] **F62** Markdown in messages, M055–M061.
- [ ] **F63** Markdown in messages, M062–M069.
- [ ] **F64** Markdown in messages, M070–M080.
- [ ] **F65** Markdown in messages, M081–M086.
- [ ] **F66** Markdown in messages, M087–M092.
- [ ] **F67** Markdown in messages, M093–M106.
- [ ] **F68** Markdown in messages, M107–M117.
- [ ] **F69** Markdown in messages, M118–M122.
- [ ] **F70** Markdown in embeds, M045, M046, M050, M060.
- [ ] **F71** Markdown in embeds, M064, M073, M074, M075.
- [ ] **F72** Markdown in embeds, M076, M077, M083, M088.
- [ ] **F73** Markdown in embeds, M097, M099, M100, M101.
- [ ] **F74** Markdown in embeds, M102, M103, M105, M108.
- [ ] **F75** Markdown in embeds, M109, M113.

## Optional and untested: saving the page

On desktop only, in your ordinary browser (not one an agent controls): open the test channel at https://discord.com/app, scroll to a markdown case, press Ctrl+S and save as **Webpage, Complete** into `.discord-reference/saved-page/`. The browser writes out the page it already has, stylesheets included, and that copy can be opened offline with scripts off to read exact sizes and structure. It would settle the markdown cases far faster than screenshots. Nothing in the kit reads it yet, and it has never been tried. A saved page holds everything on your screen, so a script must keep only the message list and discard the rest before anything else reads it.

## For whoever measures

What each fixture is there to settle, from §7b of docs/message-preview-spec.md. `vp run calibration:scenes --tier <tier>` writes each fixture as a scene file the preview command line draws, to lay over its screenshot.

### Essential

- **F01** The bots' question card, edited (desktop, iPhone)
  - iPhone, never captured: a third-level heading, subtext, a block quote, italic and underlined text, inline code, an emoji in text, a masked link, user mentions (known and unknown), a short-time timestamp, primary and danger buttons, and "(edited)".
  - Desktop: primary and danger colours from a PNG (earlier captures shifted them); the header with the time alone, and "(edited)" under the card (observed: a check).
  - Both: the relative timestamp chip (observed), the accent bar and separator (observed): checks on the method beside the unknowns.
- **F02** The closed card, a row outside it, and the next card in the group (desktop, iPhone)
  - iPhone, never captured: disabled buttons, emoji in buttons (with a label and alone), a row of buttons outside a container, and a message continuing a group.
  - Desktop: disabled primary and danger colours, emoji in buttons, and the space between grouped Components V2 messages (8px, observed: a check).
- **F03** A large 3:2 picture, described; then a large wide and tall pair (desktop, iPhone)
  - Desktop: a lone 1500 × 1000 picture, which both caps meet (566px of width would make it 377 tall, so the 350px cap should hold it to 525 × 350; observed only for a 16:9 picture held by width and a tall page held by height), and a pair of large pictures of different shapes, never captured: each at most 280px tall, top-aligned, or cropped to one height.
  - iPhone: a lone large picture filling the content width, with its ALT badge (observed for other files: a check); a mixed pair in the fixed 273 × 181 box, cover-cropped.
  - Both: each container shrinking to its gallery or not, and the gap between two containers in one message.
- **F04** Three large pictures of mixed shape (desktop, iPhone)
  - Desktop: the three-picture mosaic, never captured on desktop: the renderer draws the first picture two thirds wide beside two stacked. With a tall picture first, it also shows which tile the first picture takes and how each shape is cropped.
  - iPhone: three in the fixed box (observed for small squares), cropped from mixed shapes.
- **F05** Inbou's classic embed question and reveal (desktop, iPhone)
  - iPhone: any classic embed, never captured: the bar, padding, title, a heading in the description, inline fields in a row, a footer with today's time, and a row of buttons under a classic message.
  - Desktop: an embed footer's time for a message sent today ("Today at …" in the renderer, never captured), and full-width fields under inline ones.

### Extended

- **F06** 1 large square (1024 × 1024) (desktop, iPhone)
  - Desktop: a lone large picture scaled down to 350px tall, the stylesheet's cap, observed only for a tall page; the container shrinking to it.
  - iPhone: a lone large picture filling the content width.
  - Both: the message header (name, APP tag, the time alone for a message sent today), as every fixture shows it; and the label above, from another author, not joining its group.
- **F07** 2 large squares (1024 × 1024) (desktop, iPhone)
  - Desktop: a pair of large pictures, never captured: the renderer draws each at most 280px tall (the stylesheet's cap for a pair), side by side, shrinking the pair to the column.
  - iPhone: a pair in the fixed 273 × 181 box, 135 × 181 each, cover-cropped (observed for other files).
- **F08** 3 large squares (1024 × 1024) (desktop, iPhone)
  - Desktop: the three-picture mosaic, never captured on desktop: the renderer draws one picture two thirds wide beside two stacked.
  - iPhone: a 181 square beside two 88 squares in the fixed box (observed for small squares).
- **F09** 4 large squares (1024 × 1024) (desktop, iPhone)
  - Desktop: a 2 × 2 grid at most 350px tall, squares cropped to wide tiles (observed for 16:9 pictures and 32px icons, not large squares).
  - iPhone: four 135 × 88 tiles in the fixed box.
- **F10** 5 large squares (1024 × 1024) (desktop, iPhone)
  - Both: how 5 pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (2 here) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.
- **F11** 6 large squares (1024 × 1024) (desktop, iPhone)
  - Both: how 6 pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (none here) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.
- **F12** 7 large squares (1024 × 1024) (desktop, iPhone)
  - Both: how 7 pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (1 here) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.
- **F13** 8 large squares (1024 × 1024) (desktop, iPhone)
  - Both: how 8 pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (2 here) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.
- **F14** 9 large squares (1024 × 1024) (desktop, iPhone)
  - Both: how 9 pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (none here) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.
- **F15** 10 large squares (1024 × 1024) (desktop, iPhone)
  - Both: how 10 pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (1 here) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.
- **F16** 1 small wide picture (256 × 144) (desktop, iPhone)
  - Desktop and iPhone: a small picture at its own size (observed on both for 256 × 144): a check on the method, and on the container shrinking to it.
- **F17** 2 small wide pictures (256 × 144) (desktop, iPhone)
  - Desktop: a pair at their own size, 4px apart (observed for these files): a check on the method.
  - iPhone: a pair in the fixed box, scaled up.
- **F18** 3 small wide pictures (256 × 144) (desktop, iPhone)
  - Desktop: whether three small pictures are scaled up to fill the mosaic, or kept at their own size, which no capture shows.
  - iPhone: three in the fixed box.
- **F19** 4 small wide pictures (256 × 144) (desktop, iPhone)
  - Desktop: small pictures scaled up to fill the 2 × 2 grid (observed for 32px icons).
  - iPhone: four in the fixed box.
- **F20** 5 small wide pictures (256 × 144) (desktop, iPhone)
  - Both: the layout of 5 small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.
- **F21** 6 small wide pictures (256 × 144) (desktop, iPhone)
  - Both: the layout of 6 small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.
- **F22** 7 small wide pictures (256 × 144) (desktop, iPhone)
  - Both: the layout of 7 small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.
- **F23** 8 small wide pictures (256 × 144) (desktop, iPhone)
  - Both: the layout of 8 small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.
- **F24** 9 small wide pictures (256 × 144) (desktop, iPhone)
  - Both: the layout of 9 small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.
- **F25** 10 small wide pictures (256 × 144) (desktop, iPhone)
  - Both: the layout of 10 small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.
- **F26** Large wide (1600 × 900); then tiny square (32 × 32) (desktop, iPhone)
  - Desktop: a large wide picture scaled to the content width (566px in a 600px container, observed); a tiny one at its own size, and the container shrinking to 32px or stopping at a minimum.
  - iPhone: a large picture filling the content width (observed); a tiny one at its own size.
- **F27** Large tall (900 × 1600) (desktop, iPhone)
  - Desktop: a large tall picture scaled to 350px tall (observed for one page).
  - iPhone: a tall picture, never captured: whether it is capped in height, and where.
- **F28** Small tall (144 × 256); then small square (128 × 128) (desktop, iPhone)
  - Both: small pictures of other shapes at their own size, and the container shrinking to each.
- **F29** Large wide (1600 × 900), large tall (900 × 1600) (desktop, iPhone)
  - Desktop: a pair of large pictures of different shapes, never captured. The renderer keeps each picture's shape, top-aligned, each at most 280px tall, the pair shrunk to the column: check alignment, heights, and whether one is cropped to the other.
  - iPhone: a mixed pair in the fixed box, cover-cropped.
- **F30** Small wide (256 × 144), small tall (144 × 256) (desktop, iPhone)
  - Desktop: a pair of small pictures of different shapes, never captured: own sizes, top-aligned, or matched heights.
- **F31** Large square (1024 × 1024), small square (128 × 128) (desktop, iPhone)
  - Desktop: a large and a small picture as a pair, never captured: whether the small one is scaled up to match.
- **F32** Large tall (900 × 1600), large wide (1600 × 900), large square (1024 × 1024) (desktop, iPhone)
  - Both: three pictures of mixed shape, tall first: whether the first always takes the large tile of the mosaic, and how each is cropped.
- **F33** Large wide (1600 × 900), large tall (900 × 1600), large square (1024 × 1024), large panorama (2100 × 900) (desktop, iPhone)
  - Both: four pictures of mixed shape in the grid: whether the rows keep one height and how each is cropped.
- **F34** Buttons: every style, disabled, with emoji, five in a row (desktop, iPhone)
  - Desktop: primary, success, danger and link colours from a PNG, which no earlier capture gives truly (their saturated colours were shifted); emoji in buttons, with and without a label; five in a row in a container.
  - iPhone: every style but secondary, disabled buttons and emoji in buttons, none captured; whether a row of five wraps.
- **F35** Buttons with long labels (desktop, iPhone)
  - Both: how a long label is cut or wraps (80 characters, Discord's limit), at the top level and in a container, and how a row of wide buttons wraps.
- **F36** Classic embed with every part (desktop, iPhone)
  - Desktop: an embed with every part, never captured whole: author with icon, linked title, description with a heading, thumbnail, inline and full-width fields, image, and a footer with icon and a dated timestamp.
  - iPhone: any classic embed at all, never captured: its bar, padding, text sizes, thumbnail, fields and image.
- **F37** Two embeds in one message, with text and buttons (desktop, iPhone)
  - Both: the gap between two embeds in one message, a classic message's text above them and a row of buttons below.
  - Both: an embed footer's time for a message sent today ("Today at …" in the renderer, never captured), with footer text and without.
- **F38** Text: headings and subtext (desktop, iPhone)
  - iPhone: first- and third-level headings and subtext, none captured (drawn from desktop's design at the app's sizes), and the space a heading leaves above and below.
  - Desktop: the same in a container, where only the second-level heading and body text were confirmed.
- **F39** Text: quotes, lists and code (desktop, iPhone)
  - iPhone: block quotes, lists and code blocks, none captured.
  - Desktop: the same in a container: the quote bar, list indents and markers, and the code block's box, which the renderer draws in a stand-in font.
- **F40** Text: inline styles, links and spoilers (desktop, iPhone)
  - iPhone: italic, underlined and struck-through text, inline code, links and text spoilers, none captured.
  - Desktop: the same in a container; inline code's box, which the renderer draws in a stand-in font.
- **F41** Text: mentions and emoji (desktop, iPhone)
  - iPhone: mentions and emoji in text, none captured: a known user (the bot), an unknown user and role, this channel, @everyone and @here, a slash command, guild navigation, and Unicode emoji inline and alone.
  - Desktop: the pill for each kind; whether emoji on a line of their own are drawn larger in a text display.
- **F42** Text: every timestamp style (desktop, iPhone)
  - iPhone: every timestamp style but relative, none captured, and how a chip wraps in a sentence.
  - Desktop: each style's wording and the chip, in the viewer's own time zone (the poster records it in the manifest).
- **F43** Sections with thumbnails (desktop, iPhone)
  - Desktop: thumbnails and sections, never captured: the 85px square, the 12px gap, text rows 4px apart, a long paragraph beside a thumbnail, and whether the text is centred against it.
  - iPhone: one to three text displays beside a 60-point thumbnail, and a long paragraph.
- **F44** Sections with buttons (desktop, iPhone)
  - Both: a section with a button, never captured on either: the button's place, and a long label cut at half the width less 12px.
- **F45** Thumbnails of every shape (desktop, iPhone)
  - Both: how a wide, tall and tiny picture fills the square thumbnail, and a spoilered thumbnail.
- **F46** String selects (desktop, iPhone)
  - Desktop: the closed select's fill, border and text sizes, which are inferred; a placeholder, one chosen with its emoji, several as tags, disabled.
  - iPhone: any select, never captured.
  - After opening: the open list (option rows, emoji, descriptions), which the renderer draws from the stylesheet and nobody has compared.
- **F47** User, role, mentionable and channel selects (desktop, iPhone)
  - Both: the other four selects, closed, with a placeholder and with a chosen user (the bot) and channel (this one) drawn as pills; never captured on either.
- **F48** Files (desktop, iPhone)
  - Both: the file row (icon, name, size wording), at the top level and in a container, a long name, and a spoilered file. Never captured on either; the size wording is the renderer's guess.
- **F49** Spoilered container, thumbnail and file (desktop, iPhone)
  - Both: a spoilered container, thumbnail and file, hidden; never captured on either.
  - After revealing: each as it looks once clicked.
- **F50** Spoilered gallery picture and text (desktop, iPhone)
  - Both: a spoilered picture in a gallery (the "Spoiler" pill), and a text spoiler; never captured on either.
  - After revealing: each as it looks once clicked.
- **F51** Components outside a container (desktop, iPhone)
  - Both: text, a separator, a gallery, a section, a file and a row of buttons at the top level of a message, never captured on iPhone and not on desktop either: the 8px gaps between them and their width.
  - Both: a classic message's text with a row of buttons under it.
- **F52** Two containers in one message (desktop, iPhone)
  - Both: the gap between two containers in one message, one with an accent bar and one without, and a container holding only one line.
- **F53** Separators: both spacings, with and without a line (desktop, iPhone)
  - iPhone: a separator with large spacing, and one without a line, never captured.
  - Desktop: large spacing's 8px above and below, and the space a separator without a line leaves.
- **F54** Edited messages, and messages continuing a group (desktop, iPhone)
  - iPhone: "(edited)" on a Components V2 message and on a classic one, and messages continuing a group, none captured.
  - Desktop: "(edited)" on a classic message (observed only on Components V2), and the space under the mark to the next message in the group (32px on Components V2, observed).

### Markdown cases

- **F55** Markdown in messages, M001–M006 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F56** Markdown in messages, M007–M012 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F57** Markdown in messages, M013–M020 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F58** Markdown in messages, M021–M028 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F59** Markdown in messages, M029–M035 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F60** Markdown in messages, M036–M043 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F61** Markdown in messages, M044–M054 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F62** Markdown in messages, M055–M061 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F63** Markdown in messages, M062–M069 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F64** Markdown in messages, M070–M080 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F65** Markdown in messages, M081–M086 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F66** Markdown in messages, M087–M092 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F67** Markdown in messages, M093–M106 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F68** Markdown in messages, M107–M117 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F69** Markdown in messages, M118–M122 (desktop)
  - How the client parses each case, against what the parser assumes: each case's `name` in `packages/preview/src/markdown/__tests__/cases.ts` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.
- **F70** Markdown in embeds, M045, M046, M050, M060 (desktop)
  - How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.
- **F71** Markdown in embeds, M064, M073, M074, M075 (desktop)
  - How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.
- **F72** Markdown in embeds, M076, M077, M083, M088 (desktop)
  - How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.
- **F73** Markdown in embeds, M097, M099, M100, M101 (desktop)
  - How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.
- **F74** Markdown in embeds, M102, M103, M105, M108 (desktop)
  - How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.
- **F75** Markdown in embeds, M109, M113 (desktop)
  - How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.

### Not posted at all

- A Premium button: it names a SKU the posting app sells, and Discord refuses one the app does not have; the test bot sells nothing.
- Server emoji, in buttons, select options or text: the preview's sheets invent their ids, which Discord refuses in components, so Unicode emoji stand in. Uploading application emoji to the bot first, and naming those, would cover them.
- A role mention that resolves, and roles chosen in a select: the kit does not know the test server's roles, so it mentions a role id that is nothing, which shows as Discord shows a deleted role.
