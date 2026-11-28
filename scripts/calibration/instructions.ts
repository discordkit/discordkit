/**
 * The instructions for the person taking the screenshots, written from the capture set so they cannot drift from it. `vp run calibration:instructions` writes them to CAPTURE.md beside this file, and a spec fails when the file is not what this writes.
 *
 * The essential tier comes first, as the whole job; the other two tiers follow as optional follow-ups with their own counts.
 */
import { fileURLToPath } from "node:url";
import {
  captureSet,
  fixtureScreenshots,
  manualSteps,
  markdownPlatforms,
  notCovered,
  platformNames,
  tierNames,
  totalScreenshots,
  type CaptureFixture,
  type CapturePlatform,
  type CaptureTier
} from "./captureSet.ts";
import { planRequests } from "./wire.ts";

export const instructionsPath = fileURLToPath(
  new URL(`./CAPTURE.md`, import.meta.url)
);

/** The bot's permissions, as the invite link's `permissions` number: View Channels, Send Messages, Embed Links, Attach Files and Read Message History. */
export const botPermissions = [
  1 << 10,
  1 << 11,
  1 << 14,
  1 << 15,
  1 << 16
].reduce((sum, bit) => sum + bit, 0);

/** What each tier is for, in a sentence for the person. */
export const tierAbout: Record<CaptureTier, string> = {
  essential: `What Inbou and Tome actually send: their question card with every kind of text they use, buttons open and closed, galleries of one to three pictures, the classic embeds, an edited message, and the light theme on the cards. This is the part that matters.`,
  extended: `Everything else a message can hold: galleries of every count from one to ten in two picture sizes, every button style, long labels, an embed with every part, the rest of the text formatting, sections and thumbnails, selects, files, spoilers, components outside a container, separators, and the ash and onyx themes and a narrow window.`,
  markdown: `The 122 markdown cases the parser only assumes, each posted on its own and numbered, to see how the client really parses them.`
};

const tierFixtures = (tier: CaptureTier): CaptureFixture[] =>
  captureSet.filter((fixture) => fixture.tier === tier);

/** Roughly how long posting a tier takes: Discord lets a bot post about five messages every five seconds in one channel. */
const postingMinutes = (tier: CaptureTier): number => {
  const { requests } = planRequests(tierFixtures(tier), {
    bot: true,
    webhook: true
  });
  return Math.max(1, Math.ceil(requests.length / 60));
};

const codeRange = (fixtures: readonly CaptureFixture[]): string =>
  `${fixtures[0].code} to ${fixtures[fixtures.length - 1].code}`;

const checklistItem = (
  fixture: CaptureFixture,
  platform: CapturePlatform
): string => {
  const tall = fixture.tall?.includes(platform)
    ? ` Two screenshots: the top, then the bottom.`
    : ``;
  const then = fixture.followUp ? ` Then: ${fixture.followUp}` : ``;
  return `- [ ] **${fixture.code}** ${fixture.title}.${tall}${then}`;
};

const checklist = (platform: CapturePlatform, tier: CaptureTier): string[] => {
  const steps = manualSteps.filter(
    (step) => step.tier === tier && step.platforms.includes(platform)
  );
  return [
    ...tierFixtures(tier)
      .filter((fixture) => fixtureScreenshots(fixture, platform) > 0)
      .map((fixture) => checklistItem(fixture, platform)),
    ...(steps.length > 0
      ? [
          ``,
          `Then the things only you can do:`,
          ``,
          ...steps.map((step) => `- [ ] **${step.title}.** ${step.steps}`)
        ]
      : [])
  ];
};

const heading = (platform: CapturePlatform, tier: CaptureTier): string =>
  `${platform === `desktop` ? `On your computer` : `On your iPhone`}: ${String(totalScreenshots(platform, tier))} screenshots`;

/** A tier's checklists, one per platform it asks screenshots on, under level-four headings. */
export const renderTierChecklists = (tier: CaptureTier): string[] =>
  ([`desktop`, `ios`] as const)
    .filter((platform) => totalScreenshots(platform, tier) > 0)
    .flatMap((platform) => [
      `#### ${heading(platform, tier)}`,
      ``,
      ...checklist(platform, tier),
      ``
    ]);

const settlesList = (tier: CaptureTier): string[] =>
  tierFixtures(tier).flatMap((fixture) => [
    `- **${fixture.code}** ${fixture.title} (${fixture.platforms.map((platform) => platformNames[platform]).join(`, `)})`,
    ...fixture.settles.map((line) => `  - ${line}`)
  ]);

/** The whole document. */
export const renderInstructions = (): string => {
  const essential = tierFixtures(`essential`);
  const extended = tierFixtures(`extended`);
  const markdown = tierFixtures(`markdown`);
  const count = (platform: CapturePlatform, tier: CaptureTier): string =>
    String(totalScreenshots(platform, tier));
  const lines = [
    `# Capturing the real Discord client`,
    ``,
    `<!-- Written by \`vp run calibration:instructions\` from scripts/calibration/captureSet.ts. Edit that file, not this one. -->`,
    ``,
    `A bot posts test messages to a channel in your test server, you take screenshots of them, and an agent measures them afterwards. Nothing here logs in as you or controls your Discord.`,
    ``,
    `**The essential part is the whole job: ${String(essential.length)} numbered tests, then ${count(`desktop`, `essential`)} screenshots on your computer and ${count(`ios`, `essential`)} on your phone.** ${tierAbout.essential} Two optional follow-ups come at the end, for another day if ever.`,
    ``,
    `## 1. Once, before you start`,
    ``,
    `1. In your test server, make a text channel for this, such as \`#calibration\`.`,
    `2. Make a bot: at https://discord.com/developers/applications press **New Application**, name it, open **Bot**, press **Reset Token** and copy the token. Keep it to yourself.`,
    `3. Invite it: open \`https://discord.com/oauth2/authorize?client_id=<application id>&scope=bot&permissions=${String(botPermissions)}\`, with the application id from **General Information**, and pick your test server. That grants it View Channels, Send Messages, Embed Links, Attach Files and Read Message History.`,
    `4. Make a webhook for the labels: in the channel's settings, **Integrations**, **Webhooks**, **New Webhook**, then **Copy Webhook URL**. It posts the grey label line above each test message, as a different author, so each keeps its own header.`,
    `5. Turn on **Developer Mode** (User Settings, **Advanced**), then right-click the channel and **Copy Channel ID**.`,
    ``,
    `## 2. Post`,
    ``,
    `In PowerShell at the repository root. Each \`Read-Host\` asks for a value without showing it or keeping it in your history; they last until you close the window and are never written to a file.`,
    ``,
    `\`\`\`powershell`,
    `$env:DISCORD_CALIBRATION_BOT_TOKEN = [Net.NetworkCredential]::new('', (Read-Host -AsSecureString 'Bot token')).Password`,
    `$env:DISCORD_CALIBRATION_WEBHOOK_URL = [Net.NetworkCredential]::new('', (Read-Host -AsSecureString 'Webhook URL')).Password`,
    `$env:DISCORD_CALIBRATION_CHANNEL_ID = Read-Host 'Channel id'`,
    `vp run build`,
    `vp run calibration:post --send`,
    `\`\`\``,
    ``,
    `That posts ${codeRange(essential)} in about ${String(postingMinutes(`essential`))} minute${postingMinutes(`essential`) === 1 ? `` : `s`} and writes a list of what it posted to \`.discord-reference/posted/\`, which git ignores. If it stops, it says why. To see what it would send without sending anything, leave out \`--send\`.`,
    ``,
    `## 3. Settings`,
    ``,
    `Desktop:`,
    ``,
    `- Dark theme (User Settings, **Appearance**). The light theme comes at the end.`,
    `- Zoom at 100%: press Ctrl+0 in Discord.`,
    `- Take each screenshot with Win+Shift+S, rectangle mode. Windows saves it as a PNG in \`Pictures\\Screenshots\`. Do not resize it, paste it into a chat or save it as JPEG.`,
    `- Keep the window at least 1280 wide, with the member list as you like it.`,
    ``,
    `iPhone:`,
    ``,
    `- Dark theme.`,
    `- In the iPhone's Settings, **Photos**, **Transfer to Mac or PC**, choose **Keep Originals**, so screenshots reach the PC unchanged.`,
    `- Take each screenshot with the side button and volume up together. Leave it as it is: no crop, no markup.`,
    ``,
    `Every screenshot: the grey label line (such as \`F01 · The bots' question card…\`) at the top, the whole test message under it, nothing cut off. If one does not fit on your screen, take it in two screenshots, the top and then the bottom, overlapping a little. If the next one also fits whole, label and all, one screenshot can hold both: tick both.`,
    ``,
    `## 4. Screenshots`,
    ``,
    ...renderTierChecklists(`essential`),
    `## 5. Getting the files in`,
    ``,
    `1. Desktop: move this session's screenshots from \`Pictures\\Screenshots\` into a new folder, such as \`Pictures\\calibration-desktop\`.`,
    `2. iPhone: connect it to the PC with a cable, unlock it and tap **Trust**. In File Explorer open **Apple iPhone**, **Internal Storage**, **DCIM**, and copy the screenshots (\`IMG_….PNG\`) into a new folder, such as \`Pictures\\calibration-iphone\`. Not through email, chat apps or iCloud's web page, which shrink or convert them.`,
    `3. File both folders:`,
    ``,
    `\`\`\`powershell`,
    `vp run calibration:ingest "$HOME\\Pictures\\calibration-desktop"`,
    `vp run calibration:ingest "$HOME\\Pictures\\calibration-iphone"`,
    `\`\`\``,
    ``,
    `They are copied to \`.discord-reference/captures/calibration/\`, which git ignores, with an index of each file's size. Your originals are not touched. Screenshots never go into the repository or anywhere else.`,
    ``,
    `## 6. Cleaning up`,
    ``,
    `Once the screenshots are in, including the next days' headers, run \`vp run calibration:delete\` once for each time you posted. Each run deletes exactly the messages one post listed, newest first, and nothing else. Delete the bot and the webhook afterwards if you like.`,
    ``,
    `## Optional follow-ups`,
    ``,
    `Only if the essential part is done and you have another sitting in you. Each is posted on its own and ticked off the same way, with the same settings and the same way of getting the files in.`,
    ``,
    `### ${tierNames.extended}: ${count(`desktop`, `extended`)} screenshots on your computer, ${count(`ios`, `extended`)} on your phone`,
    ``,
    `${tierAbout.extended} Post it with \`vp run calibration:post --send --tier extended\` (${codeRange(extended)}, about ${String(postingMinutes(`extended`))} minutes).`,
    ``,
    ...renderTierChecklists(`extended`),
    `### ${tierNames.markdown}: ${count(`desktop`, `markdown`)} screenshots, on your computer only`,
    ``,
    `${tierAbout.markdown} Post them with \`vp run calibration:post --send --tier markdown\` (${codeRange(markdown)}, about ${String(postingMinutes(`markdown`))} minutes). Each case starts with its number, such as \`M012\`, on a line of its own.`,
    ``,
    `They are asked for on ${markdownPlatforms.map((platform) => platformNames[platform]).join(` and `)} only. Whether a string parses as bold is a property of the parser, and nothing yet suggests the iOS app parses differently from desktop; how text looks on a phone is covered by the essential and extended tiers. To check that assumption, take the same ${String(markdown.length)} screenshots on your iPhone too: nothing else changes.`,
    ``,
    ...renderTierChecklists(`markdown`),
    `## Optional and untested: saving the page`,
    ``,
    `On desktop only, in your ordinary browser (not one an agent controls): open the test channel at https://discord.com/app, scroll to a markdown case, press Ctrl+S and save as **Webpage, Complete** into \`.discord-reference/saved-page/\`. The browser writes out the page it already has, stylesheets included, and that copy can be opened offline with scripts off to read exact sizes and structure. It would settle the markdown cases far faster than screenshots. Nothing in the kit reads it yet, and it has never been tried. A saved page holds everything on your screen, so a script must keep only the message list and discard the rest before anything else reads it.`,
    ``,
    `## For whoever measures`,
    ``,
    `What each fixture is there to settle, from §7b of docs/message-preview-spec.md. \`vp run calibration:scenes --tier <tier>\` writes each fixture as a scene file the preview command line draws, to lay over its screenshot.`,
    ``,
    ...([`essential`, `extended`, `markdown`] as const).flatMap((tier) => [
      `### ${tierNames[tier]}`,
      ``,
      ...settlesList(tier),
      ``
    ]),
    `### Not posted at all`,
    ``,
    ...notCovered.map(({ what, why }) => `- ${what}: ${why}`),
    ``
  ];
  return lines.join(`\n`);
};
