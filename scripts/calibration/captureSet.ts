/**
 * The capture set: what a bot posts to a test channel so the owner can screenshot the real Discord client, and what each screenshot is there to settle (spec §7, "Calibration", and §7b).
 *
 * Every fixture is a scene the preview renderer draws and the poster sends, so a screenshot and a render of the same fixture show the same payload. Fixtures are numbered in posting order and each is preceded, in the channel, by a one-line label posted by a webhook (see `labelMessage`): a different author, so the fixture keeps its own header and the label is never part of what is measured.
 *
 * Plain data and pure functions, read by the poster, the dry run, the scene export and the instructions generator.
 */
import { statSync } from "node:fs";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { ActionRow } from "@discordkit/client/components/types/ActionRow";
import type { Button } from "@discordkit/client/components/types/Button";
import type { Container } from "@discordkit/client/components/types/Container";
import type { Select } from "@discordkit/client/components/types/Select";
import type { TextDisplay } from "@discordkit/client/components/types/TextDisplay";
import type { Embed } from "@discordkit/client/messages/types/Embed";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import type {
  MessagePayload,
  PartId,
  Scene,
  SceneAttachment,
  SceneContext,
  SceneMessage
} from "@discordkit/preview/scene";
import {
  buttonSheet,
  embedSheet,
  fileSheet,
  sectionSheet,
  spoilerSheet,
  thumbnailSheet
} from "../../packages/preview/src/__tests__/fixtures.ts";
import {
  cases,
  type MarkdownCase
} from "../../packages/preview/src/markdown/__tests__/cases.ts";

export type CapturePlatform = `desktop` | `ios`;

export const platformNames: Record<CapturePlatform, string> = {
  desktop: `desktop`,
  ios: `iPhone`
};

/**
 * How much a fixture matters, so the capture can be done in parts. `essential` is what the owner's two bots send and the doubts about it, small enough for one sitting; `extended` is everything else a message can hold; `markdown` is the parser's assumed cases.
 */
export type CaptureTier = `essential` | `extended` | `markdown`;

export const tiers: readonly CaptureTier[] = [
  `essential`,
  `extended`,
  `markdown`
];

export const tierNames: Record<CaptureTier, string> = {
  essential: `Essential`,
  extended: `Extended`,
  markdown: `Markdown cases`
};

/** A message of a fixture. `before`, when set, is posted first and then edited to `payload`, so the client marks it "(edited)". */
export interface CaptureMessage extends SceneMessage {
  before?: MessagePayload;
}

export interface CaptureFixture {
  /** Its place in posting order, from 1. */
  number: number;
  /** `F07`: what the label in the channel says, and how a screenshot names its fixture. */
  code: string;
  /** What it shows, in a few words. */
  title: string;
  tier: CaptureTier;
  /** Where it needs a screenshot. */
  platforms: readonly CapturePlatform[];
  /** What a screenshot of it is there to settle, for whoever measures it, drawn from spec §7b. */
  settles: readonly string[];
  messages: readonly CaptureMessage[];
  /** Something the person does after the first screenshot, for a second one. */
  followUp?: string;
  /**
   * Where it is taller than one screenshot, so the person takes two, top then bottom. Found by rendering every fixture with the preview's command line (a 1920 × 1080 desktop window, taken as 880 CSS pixels of chat, and an iPhone 14 Pro's 647-point first screen) and recorded here, since the kit cannot render; the real client may draw some shorter.
   */
  tall?: readonly CapturePlatform[];
}

/** A fixture as written in the lists below, before it is numbered and given its tier. */
type FixtureDraft = Omit<CaptureFixture, `number` | `code` | `tier`>;

/** Something the capture needs that posting cannot produce: an instruction for the person. */
export interface ManualStep {
  title: string;
  tier: CaptureTier;
  platforms: readonly CapturePlatform[];
  /** What to do, in one or two short sentences. */
  steps: string;
  /** What it settles, for whoever measures it. */
  settles: string;
  /** How many screenshots it adds on each platform it applies to. */
  screenshots: number;
}

/*
 * Ids. A fixture's text names these stand-ins; the poster replaces the first two with the real ids before sending, so a mention of the bot or of the channel resolves in the client as it does in the render. The unknown ones are left as they are and show as Discord shows an id it does not know.
 */

/** Stands for the posting bot's user id. */
export const botId = `1399000000000000001`;
/** Stands for the test channel's id. */
export const channelId = `1399000000000000003`;
/** The webhook that posts the labels, as the render's author. */
export const labellerId = `1399000000000000009`;
/** A user id that is nobody, so the client draws its "unknown user" mention. */
export const unknownUserId = `1399000000000000099`;
/** A role id that is nothing. */
export const unknownRoleId = `1399000000000000098`;
/** A command id that is nothing, for a slash command mention. */
export const unknownCommandId = `1399000000000000097`;

/** The scene clock. An embed timestamp equal to it is replaced by the time of posting, so its footer says "Today at …" as the render does. */
export const captureNow = `2026-11-27T12:00:00.000Z`;
/** The scene clock in Unix seconds. A timestamp within a day of it is moved by the time between the clock and the moment of posting, so "ends in 45 seconds" means that when posted, as it does in the render. */
export const captureNowSeconds = Date.parse(captureNow) / 1000;
/** A fixed instant for the timestamp fixtures, the one Discord's own documentation uses: Tuesday, 20 April 2021, 21:20:30 UTC. */
const fixedTime = 1_618_953_630;

const v2 = MessageFlag.IS_COMPONENTS_V2;

/** A button label at Discord's limit, 80 characters. */
export const longLabel = `An eighty-character label, the longest a button can have, to see how it gets cut`;

/*
 * Builders.
 */

const text = (content: string): TextDisplay => ({
  type: ComponentType.TextDisplay,
  content
});

const container = (
  components: Container[`components`],
  extra: Partial<Container> = {}
): Container => ({ type: ComponentType.Container, components, ...extra });

const v2Message = (...components: unknown[]): CaptureMessage => ({
  payload: { flags: v2, components: components as MessageComponent }
});

const gallery = (
  names: readonly string[],
  extra: { spoiler?: readonly number[] } = {}
): Container[`components`][number] => ({
  type: ComponentType.MediaGallery,
  items: names.map((name, index) => ({
    media: { url: `attachment://${name}` },
    ...(extra.spoiler?.includes(index) ? { spoiler: true } : {})
  }))
});

const button = (
  style: ButtonStyle,
  label: string | undefined,
  extra: Partial<Button> = {}
): Button => ({
  type: ComponentType.Button,
  style,
  ...(label === undefined ? {} : { label }),
  ...(style === ButtonStyle.Link
    ? { url: `https://example.com/` }
    : { customId: `calibration:${label ?? String(style)}` }),
  ...extra
});

const row = (...components: Button[]): ActionRow => ({
  type: ComponentType.ActionRow,
  components
});

/** A select in its action row, in the array Discord expects; cast past the client's type, which holds a bare select (#106). */
const selectRow = (select: Select): ActionRow =>
  ({
    type: ComponentType.ActionRow,
    components: [select]
  }) as unknown as ActionRow;

const separator = (
  spacing: 1 | 2,
  divider: boolean
): Container[`components`][number] => ({
  type: ComponentType.Separator,
  spacing,
  divider
});

/*
 * Reusing the preview package's sheets. They were written to be drawn, not posted, so a few things in them would be refused by Discord or would show differently from the render, and are changed here. The changed scene is what both sides use.
 */

/** The emoji standing in for a server emoji the sheets invent: an id Discord does not have, which it refuses in a button or an option. */
const standInEmoji = `💎`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === `object` && value !== null && !Array.isArray(value);

/**
 * Makes a sheet's payload postable, keeping its layout:
 *
 * - an invented server emoji in a button or an option becomes a Unicode one;
 * - a Premium button is removed (it needs a real SKU), as is a row or section left empty by that;
 * - a picture the scene has no file for is removed, since Discord refuses an `attachment://` reference to nothing;
 * - a File component's `name` and `size` are removed, since only Discord's responses carry them;
 * - a select's default users and channels become the bot and this channel, and default roles are removed, since they name nothing in the test server.
 */
const postable = (value: unknown, files: ReadonlySet<string>): unknown => {
  if (Array.isArray(value)) {
    return value
      .map((item) => postable(item, files))
      .filter((item) => item !== undefined);
  }
  if (!isRecord(value)) return value;

  if (
    value.type === ComponentType.Button &&
    value.style === ButtonStyle.Premium
  ) {
    return undefined;
  }
  // A thumbnail or a gallery item whose picture the scene has no file for.
  if (
    isRecord(value.media) &&
    typeof value.media.url === `string` &&
    value.media.url.startsWith(`attachment://`) &&
    !files.has(value.media.url.slice(`attachment://`.length))
  ) {
    return undefined;
  }

  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (
      value.type === ComponentType.File &&
      (key === `name` || key === `size`)
    ) {
      continue;
    }
    if (key === `emoji` && isRecord(item) && typeof item.id === `string`) {
      next.emoji = { id: null, name: standInEmoji };
      continue;
    }
    if (key === `defaultValues` && Array.isArray(item)) {
      next.defaultValues = item
        .filter((entry) => isRecord(entry) && entry.type !== `role`)
        .map((entry) =>
          isRecord(entry) && entry.type === `channel`
            ? { ...entry, id: channelId }
            : { ...(entry as object), id: botId }
        );
      continue;
    }
    next[key] = postable(item, files);
  }

  const emptied =
    (next.type === ComponentType.ActionRow &&
      Array.isArray(next.components) &&
      next.components.length === 0) ||
    (next.type === ComponentType.MediaGallery &&
      Array.isArray(next.items) &&
      next.items.length === 0) ||
    (next.type === ComponentType.Section && next.accessory === undefined);
  return emptied ? undefined : next;
};

/** Gives every repeated `customId` in a payload a suffix (`:2`, `:3`), since Discord refuses a message with two the same; the sheets reuse one for a button and its disabled twin. */
const uniqueCustomIds = (payload: unknown): unknown => {
  const seen = new Map<string, number>();
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk);
    if (!isRecord(value)) return value;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (key === `customId` && typeof item === `string`) {
        const count = (seen.get(item) ?? 0) + 1;
        seen.set(item, count);
        next.customId = count === 1 ? item : `${item}:${String(count)}`;
      } else {
        next[key] = walk(item);
      }
    }
    return next;
  };
  return walk(payload);
};

/** A sheet's messages, made postable and sent by the bot. */
const fromSheet = (
  sheet: Scene,
  pick?: readonly number[]
): CaptureMessage[] => {
  const files = new Set(Object.keys(sheet.context?.attachments ?? {}));
  return sheet.messages
    .filter((_, index) => pick === undefined || pick.includes(index))
    .map((message) => ({
      payload: uniqueCustomIds(
        postable(message.payload, files)
      ) as MessagePayload,
      ...(message.edited === undefined ? {} : { edited: message.edited })
    }));
};

/** The two embeds of the preview's embed sheet: one with every part, and a plain one. */
const embedSheetEmbeds: readonly Embed[] =
  embedSheet.messages[0].payload.embeds ?? [];

/*
 * Galleries. Each in a container of its own, as both bots post them, with nothing else in it: a line of text wider than a small picture would stop the container shrinking to the picture, which is one of the things to measure. The label above names the pictures, and each picture's hue and border show its order and any crop.
 */

const galleryMessage = (names: readonly string[]): CaptureMessage =>
  v2Message(container([gallery(names)]));

const numbered = (stem: string, count: number): string[] =>
  Array.from(
    { length: count },
    (_, index) => `${stem}-${String(index + 1)}.png`
  );

/** The pictures of mixed shape, by what the label calls them. */
const shapes = {
  largeWide: [`large wide (1600 × 900)`, `large-wide.png`],
  largeTall: [`large tall (900 × 1600)`, `large-tall.png`],
  largeSquare: [`large square (1024 × 1024)`, `large-square-1.png`],
  largePanorama: [`large panorama (2100 × 900)`, `large-panorama.png`],
  smallWide: [`small wide (256 × 144)`, `small-wide-1.png`],
  smallTall: [`small tall (144 × 256)`, `small-tall.png`],
  smallSquare: [`small square (128 × 128)`, `small-square.png`],
  tinySquare: [`tiny square (32 × 32)`, `tiny-square.png`]
} as const;

type Shape = keyof typeof shapes;

/** A gallery fixture of pictures of mixed shape: its title lists them in order. */
const mixedFixture = (
  galleries: ReadonlyArray<readonly Shape[]>,
  settles: readonly string[]
): FixtureDraft => ({
  title: galleries
    .map((pictures) => pictures.map((shape) => shapes[shape][0]).join(`, `))
    .join(`; then `)
    .replace(/^./, (first) => first.toUpperCase()),
  platforms: both,
  settles,
  messages: galleries.map((pictures) =>
    galleryMessage(pictures.map((shape) => shapes[shape][1]))
  )
});

/*
 * Markdown. Each assumed case (provenance `assumed` in the parser's case list) is posted on its own, so no case can change how another parses: a message's content for the message cases, an embed for the embed cases. Each carries its number, `M001` and on, on a line of its own above the case, which holds no markdown and so cannot pair with anything in it.
 */

/** The cases calibration has to check, in the parser's own order. */
export const assumedCases: readonly MarkdownCase[] = cases.filter(
  (entry) => entry.provenance === `assumed`
);

export const caseCode = (index: number): string =>
  `M${String(index + 1).padStart(3, `0`)}`;

/** A message case: the label, a line break, the case, as a classic message's text or, for a text display case, in one. */
const caseMessage = (entry: MarkdownCase, index: number): CaptureMessage => {
  const content = `${caseCode(index)}\n${entry.source}`;
  return entry.context === `textDisplay`
    ? v2Message(text(content))
    : { payload: { content } };
};

/** An embed case, as one embed: the case in the place its context names, the label beside it. */
const caseEmbed = (entry: MarkdownCase, index: number): Embed => {
  const label = caseCode(index);
  switch (entry.context) {
    case `embedTitle`:
      return { title: entry.source, description: label };
    case `embedDescription`:
      return { title: label, description: entry.source };
    case `embedFieldValue`:
      return { fields: [{ name: label, value: entry.source }] };
    case `embedFieldName`:
      return { fields: [{ name: entry.source, value: label }] };
    case `embedAuthor`:
      return { author: { name: entry.source }, description: label };
    case `embedFooter`:
      return { description: label, footer: { text: entry.source } };
    case `message`:
    case `textDisplay`:
      throw new Error(
        `Markdown case ${label} ("${entry.name}") has the context \`${entry.context}\`, which is not an embed's, so it cannot be posted as an embed. This is a bug in scripts/calibration/captureSet.ts: message cases go through caseMessage.`
      );
  }
};

const isMessageCase = (entry: MarkdownCase): boolean =>
  entry.context === `message` || entry.context === `textDisplay`;

/** Splits a list into runs of at most `size`. */
const batches = <T>(items: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  );

/**
 * About how tall a message case is on an iPhone 14 Pro, in points, continuing a group: 17 between messages and 20 a line, counting its label, each of its lines at about 36 characters to a wrapped line, and a code block's box as two more. Fitted to renders of every case; a guess at the app, which is what the batches need, not a measurement.
 */
export const caseHeight = (entry: MarkdownCase): number => {
  const lines = entry.source
    .replace(/\r\n/g, `\n`)
    .split(`\n`)
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 36)), 1);
  const codeBlock = /```[^`]*\n/.test(entry.source) ? 2 : 0;
  return 17 + 20 * (lines + codeBlock);
};

/** Room for message cases under one label on an iPhone 14 Pro's first screen of chat (647 points), less the label (about 95 with the chat's padding) and the first case's header (about 27), with some to spare. */
export const caseBudget = 470;

/** Packs message cases into runs that each fit `caseBudget`, keeping the parser's order. */
const packCases = <T extends { entry: MarkdownCase }>(
  items: readonly T[]
): T[][] => {
  const runs: T[][] = [];
  let run: T[] = [];
  let used = 0;
  for (const item of items) {
    const height = caseHeight(item.entry);
    if (run.length > 0 && used + height > caseBudget) {
      runs.push(run);
      run = [];
      used = 0;
    }
    run.push(item);
    used += height;
  }
  if (run.length > 0) runs.push(run);
  return runs;
};

const indexedCases = assumedCases.map((entry, index) => ({ entry, index }));

/** How many embed cases share a message: four fit one iPhone screenshot (checked by rendering every fixture). */
const embedCasesPerMessage = 4;

/**
 * The markdown cases are screenshotted on desktop only. Whether a string parses as bold is a property of the parser, and nothing yet suggests the iOS app parses differently from desktop; the cases' look on a phone is covered by the text fixtures. Posting is the same for both, so checking that assumption needs only the same screenshots taken on a phone (the instructions say so).
 */
export const markdownPlatforms: readonly CapturePlatform[] = [`desktop`];

const markdownFixtures = (): FixtureDraft[] => {
  const messageCases = indexedCases.filter(({ entry }) => isMessageCase(entry));
  const embedCases = indexedCases.filter(({ entry }) => !isMessageCase(entry));
  const range = (group: ReadonlyArray<{ index: number }>): string =>
    `${caseCode(group[0].index)}–${caseCode(group[group.length - 1].index)}`;
  return [
    ...packCases(messageCases).map((group) => ({
      title: `Markdown in messages, ${range(group)}`,
      platforms: markdownPlatforms,
      settles: [
        `How the client parses each case, against what the parser assumes: each case's \`name\` in \`packages/preview/src/markdown/__tests__/cases.ts\` says what was assumed. Numbers missing from the range are cases in an embed, posted in the embed fixtures.`
      ],
      messages: group.map(({ entry, index }) => caseMessage(entry, index))
    })),
    ...batches(embedCases, embedCasesPerMessage).map((group) => ({
      title: `Markdown in embeds, ${group.map(({ index }) => caseCode(index)).join(`, `)}`,
      platforms: markdownPlatforms,
      settles: [
        `How an embed's title, description, field or footer parses each case, against what the parser assumes for that part of an embed.`
      ],
      messages: [
        {
          payload: {
            embeds: group.map(({ entry, index }) => caseEmbed(entry, index))
          }
        }
      ]
    }))
  ];
};

/*
 * The fixtures, in posting order. Galleries come first, since they are what both clients decide in code rather than a stylesheet and so what the renderer most often has to guess.
 */

const both = [`desktop`, `ios`] as const;

/** What a gallery of `count` large squares settles. */
const largeSettles = (count: number): string[] => {
  switch (count) {
    case 1:
      return [
        `Desktop: a lone large picture scaled down to 350px tall, the stylesheet's cap, observed only for a tall page; the container shrinking to it.`,
        `iPhone: a lone large picture filling the content width.`,
        `Both: the message header (name, APP tag, the time alone for a message sent today), as every fixture shows it; and the label above, from another author, not joining its group.`
      ];
    case 2:
      return [
        `Desktop: a pair of large pictures, never captured: the renderer draws each at most 280px tall (the stylesheet's cap for a pair), side by side, shrinking the pair to the column.`,
        `iPhone: a pair in the fixed 273 × 181 box, 135 × 181 each, cover-cropped (observed for other files).`
      ];
    case 3:
      return [
        `Desktop: the three-picture mosaic, never captured on desktop: the renderer draws one picture two thirds wide beside two stacked.`,
        `iPhone: a 181 square beside two 88 squares in the fixed box (observed for small squares).`
      ];
    case 4:
      return [
        `Desktop: a 2 × 2 grid at most 350px tall, squares cropped to wide tiles (observed for 16:9 pictures and 32px icons, not large squares).`,
        `iPhone: four 135 × 88 tiles in the fixed box.`
      ];
    default:
      return [
        `Both: how ${String(count)} pictures are arranged, which no capture shows on either client. The renderer draws rows of three squares with the remainder (${count % 3 === 0 ? `none here` : `${String(count % 3)} here`}) in a band on top, from the stylesheet's grid classes: check the band's place and height, the row height and the gaps.`
      ];
  }
};

/** What a gallery of `count` small wide pictures settles. */
const smallSettles = (count: number): string[] => {
  switch (count) {
    case 1:
      return [
        `Desktop and iPhone: a small picture at its own size (observed on both for 256 × 144): a check on the method, and on the container shrinking to it.`
      ];
    case 2:
      return [
        `Desktop: a pair at their own size, 4px apart (observed for these files): a check on the method.`,
        `iPhone: a pair in the fixed box, scaled up.`
      ];
    case 3:
      return [
        `Desktop: whether three small pictures are scaled up to fill the mosaic, or kept at their own size, which no capture shows.`,
        `iPhone: three in the fixed box.`
      ];
    case 4:
      return [
        `Desktop: small pictures scaled up to fill the 2 × 2 grid (observed for 32px icons).`,
        `iPhone: four in the fixed box.`
      ];
    default:
      return [
        `Both: the layout of ${String(count)} small pictures, never captured, against the same count of large squares: they should match if the client sizes tiles by the column and not by the files.`
      ];
  }
};

/** A fixture of one gallery of `count` numbered pictures. */
const galleryFixture = (
  stem: string,
  noun: readonly [string, string],
  count: number,
  settles: (count: number) => string[]
): FixtureDraft => ({
  title: `${String(count)} ${count === 1 ? noun[0] : noun[1]}`,
  platforms: both,
  settles: settles(count),
  messages: [galleryMessage(numbered(stem, count))]
});

const largeFixture = (count: number): FixtureDraft =>
  galleryFixture(
    `large-square`,
    [`large square (1024 × 1024)`, `large squares (1024 × 1024)`],
    count,
    largeSettles
  );

const smallFixture = (count: number): FixtureDraft =>
  galleryFixture(
    `small-wide`,
    [`small wide picture (256 × 144)`, `small wide pictures (256 × 144)`],
    count,
    smallSettles
  );

/*
 * The essential tier: what Inbou and Tome send, packed so the whole tier is about a dozen screenshots a platform. Several things share a message only where that does not change what is measured: a gallery still gets a container of its own (a text line beside it would stop the container shrinking to it), and containers share a message, 8px apart at the top level as the stylesheet sets it, where the gap is not itself in question.
 */

const indigo = 0x2f_4b_6e;
const slate = 0x3a_3f_44;
const moss = 0x4a_6b_45;

/** Inbou's and Tome's question card, as it is while open: every kind of text the bots use, a separator and a row of buttons. */
const openCard = (status: string): Container =>
  container(
    [
      text(`**Question 4 of 10** · ${status} · 2 answered`),
      text(
        `## A second-level heading\nBody text with *italic*, __underlined__, \`inline code\` and an emoji ✅.`
      ),
      text(
        `### A third-level heading\n-# Subtext under it, with a [masked link](<https://example.com/>).`
      ),
      text(
        `> _A quoted line, in italics, as Tome quotes its lore._\n<@${botId}> and <@${unknownUserId}> answered by <t:${String(captureNowSeconds - 3600)}:t>.`
      ),
      separator(1, true),
      row(
        button(ButtonStyle.Secondary, `A. Secondary`),
        button(ButtonStyle.Primary, `B. Primary`),
        button(ButtonStyle.Danger, `C. Danger`)
      )
    ],
    { accentColor: indigo }
  );

const essentialList: FixtureDraft[] = [
  {
    title: `The bots' question card, edited`,
    platforms: both,
    settles: [
      `iPhone, never captured: a third-level heading, subtext, a block quote, italic and underlined text, inline code, an emoji in text, a masked link, user mentions (known and unknown), a short-time timestamp, primary and danger buttons, and "(edited)".`,
      `Desktop: primary and danger colours from a PNG (earlier captures shifted them); the header with the time alone, and "(edited)" under the card (observed: a check).`,
      `Both: the relative timestamp chip (observed), the accent bar and separator (observed): checks on the method beside the unknowns.`
    ],
    messages: [
      {
        payload: {
          flags: v2,
          components: [
            openCard(`ends <t:${String(captureNowSeconds + 45)}:R>`)
          ] as MessageComponent
        },
        before: {
          flags: v2,
          components: [openCard(`open`)] as MessageComponent
        },
        edited: true
      }
    ]
  },
  {
    title: `The closed card, a row outside it, and the next card in the group`,
    platforms: both,
    settles: [
      `iPhone, never captured: disabled buttons, emoji in buttons (with a label and alone), a row of buttons outside a container, and a message continuing a group.`,
      `Desktop: disabled primary and danger colours, emoji in buttons, and the space between grouped Components V2 messages (8px, observed: a check).`
    ],
    messages: [
      v2Message(
        container(
          [
            text(`**Question 4 of 10** · closed · 3 answered`),
            row(
              button(ButtonStyle.Secondary, `A. Secondary`, { disabled: true }),
              button(ButtonStyle.Primary, `B. Primary`, {
                disabled: true,
                emoji: { id: null, name: `✅` }
              }),
              button(ButtonStyle.Danger, `C. Danger`, { disabled: true })
            )
          ],
          { accentColor: slate }
        ),
        row(
          button(ButtonStyle.Secondary, `Play again`, {
            emoji: { id: null, name: `🔁` }
          }),
          button(ButtonStyle.Secondary, undefined, {
            customId: `calibration:emoji-only`,
            emoji: { id: null, name: `💡` }
          }),
          button(ButtonStyle.Danger, `End test`, {
            emoji: { id: null, name: `⏹️` }
          })
        )
      ),
      v2Message(
        container(
          [
            text(
              `✅ **B. Primary** · 2 of 3 correct\n-# The reveal, continuing the group.`
            )
          ],
          { accentColor: moss }
        )
      )
    ]
  },
  {
    title: `A large 3:2 picture, described; then a large wide and tall pair`,
    platforms: both,
    settles: [
      `Desktop: a lone 1500 × 1000 picture, which both caps meet (566px of width would make it 377 tall, so the 350px cap should hold it to 525 × 350; observed only for a 16:9 picture held by width and a tall page held by height), and a pair of large pictures of different shapes, never captured: each at most 280px tall, top-aligned, or cropped to one height.`,
      `iPhone: a lone large picture filling the content width, with its ALT badge (observed for other files: a check); a mixed pair in the fixed 273 × 181 box, cover-cropped.`,
      `Both: each container shrinking to its gallery or not, and the gap between two containers in one message.`
    ],
    messages: [
      v2Message(
        container([
          {
            type: ComponentType.MediaGallery,
            items: [
              {
                media: { url: `attachment://large-3x2.png` },
                description: `A large 3:2 picture`
              }
            ]
          }
        ]),
        container([gallery([`large-wide.png`, `large-tall.png`])])
      )
    ]
  },
  {
    title: `Three large pictures of mixed shape`,
    platforms: both,
    settles: [
      `Desktop: the three-picture mosaic, never captured on desktop: the renderer draws the first picture two thirds wide beside two stacked. With a tall picture first, it also shows which tile the first picture takes and how each shape is cropped.`,
      `iPhone: three in the fixed box (observed for small squares), cropped from mixed shapes.`
    ],
    messages: [
      v2Message(
        container([
          gallery([`large-tall.png`, `large-wide.png`, `large-square-1.png`])
        ])
      )
    ]
  },
  {
    title: `Inbou's classic embed question and reveal`,
    platforms: both,
    settles: [
      `iPhone: any classic embed, never captured: the bar, padding, title, a heading in the description, inline fields in a row, a footer with today's time, and a row of buttons under a classic message.`,
      `Desktop: an embed footer's time for a message sent today ("Today at …" in the renderer, never captured), and full-width fields under inline ones.`
    ],
    messages: [
      {
        payload: {
          embeds: [
            {
              title: `Question 3 of 10`,
              description: `## 食べます`,
              color: indigo,
              fields: [
                { name: `From`, value: `Non-past (polite)`, inline: true },
                { name: `Target`, value: `Past negative`, inline: true },
                { name: `Class`, value: `Ichidan`, inline: true }
              ],
              footer: { text: `Type your answer in the channel` },
              timestamp: captureNow
            }
          ],
          components: [
            row(
              button(ButtonStyle.Secondary, `Hint`),
              button(ButtonStyle.Danger, `End session`)
            )
          ]
        }
      },
      {
        payload: {
          embeds: [
            {
              title: `Correct`,
              description: `<@${botId}> got it: **+3** (12 total)`,
              color: moss,
              fields: [
                { name: `Answer`, value: `食べなかった` },
                { name: `Dictionary`, value: `食べる`, inline: true },
                { name: `Meaning`, value: `to eat`, inline: true },
                {
                  name: `Example`,
                  value: `きのうは 何も 食べなかった。\nI didn't eat anything yesterday.`
                }
              ]
            }
          ]
        }
      }
    ]
  }
];

/** Everything else a message can hold, and the rest of what §7b lists. */
const extendedList: FixtureDraft[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => largeFixture(count)),
  { ...largeFixture(10), tall: both },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => smallFixture(count)),
  { ...smallFixture(10), tall: [`desktop`] },
  mixedFixture(
    [[`largeWide`], [`tinySquare`]],
    [
      `Desktop: a large wide picture scaled to the content width (566px in a 600px container, observed); a tiny one at its own size, and the container shrinking to 32px or stopping at a minimum.`,
      `iPhone: a large picture filling the content width (observed); a tiny one at its own size.`
    ]
  ),
  mixedFixture(
    [[`largeTall`]],
    [
      `Desktop: a large tall picture scaled to 350px tall (observed for one page).`,
      `iPhone: a tall picture, never captured: whether it is capped in height, and where.`
    ]
  ),
  mixedFixture(
    [[`smallTall`], [`smallSquare`]],
    [
      `Both: small pictures of other shapes at their own size, and the container shrinking to each.`
    ]
  ),
  mixedFixture(
    [[`largeWide`, `largeTall`]],
    [
      `Desktop: a pair of large pictures of different shapes, never captured. The renderer keeps each picture's shape, top-aligned, each at most 280px tall, the pair shrunk to the column: check alignment, heights, and whether one is cropped to the other.`,
      `iPhone: a mixed pair in the fixed box, cover-cropped.`
    ]
  ),
  mixedFixture(
    [[`smallWide`, `smallTall`]],
    [
      `Desktop: a pair of small pictures of different shapes, never captured: own sizes, top-aligned, or matched heights.`
    ]
  ),
  mixedFixture(
    [[`largeSquare`, `smallSquare`]],
    [
      `Desktop: a large and a small picture as a pair, never captured: whether the small one is scaled up to match.`
    ]
  ),
  mixedFixture(
    [[`largeTall`, `largeWide`, `largeSquare`]],
    [
      `Both: three pictures of mixed shape, tall first: whether the first always takes the large tile of the mosaic, and how each is cropped.`
    ]
  ),
  mixedFixture(
    [[`largeWide`, `largeTall`, `largeSquare`, `largePanorama`]],
    [
      `Both: four pictures of mixed shape in the grid: whether the rows keep one height and how each is cropped.`
    ]
  ),
  {
    title: `Buttons: every style, disabled, with emoji, five in a row`,
    platforms: both,
    settles: [
      `Desktop: primary, success, danger and link colours from a PNG, which no earlier capture gives truly (their saturated colours were shifted); emoji in buttons, with and without a label; five in a row in a container.`,
      `iPhone: every style but secondary, disabled buttons and emoji in buttons, none captured; whether a row of five wraps.`
    ],
    messages: fromSheet(buttonSheet)
  },
  {
    title: `Buttons with long labels`,
    platforms: both,
    settles: [
      `Both: how a long label is cut or wraps (80 characters, Discord's limit), at the top level and in a container, and how a row of wide buttons wraps.`
    ],
    messages: [
      v2Message(
        row(button(ButtonStyle.Secondary, longLabel)),
        container([
          text(`**Wide buttons in a container**`),
          row(
            button(ButtonStyle.Primary, `Register for Saturday's session`),
            button(ButtonStyle.Secondary, `Remind me an hour before`),
            button(ButtonStyle.Link, `Read the study guide first`)
          )
        ])
      )
    ]
  },
  {
    title: `Classic embed with every part`,
    platforms: both,
    settles: [
      `Desktop: an embed with every part, never captured whole: author with icon, linked title, description with a heading, thumbnail, inline and full-width fields, image, and a footer with icon and a dated timestamp.`,
      `iPhone: any classic embed at all, never captured: its bar, padding, text sizes, thumbnail, fields and image.`
    ],
    messages: [{ payload: { embeds: [embedSheetEmbeds[0]] } }],
    tall: [`ios`]
  },
  {
    title: `Two embeds in one message, with text and buttons`,
    platforms: both,
    settles: [
      `Both: the gap between two embeds in one message, a classic message's text above them and a row of buttons below.`,
      `Both: an embed footer's time for a message sent today ("Today at …" in the renderer, never captured), with footer text and without.`
    ],
    messages: [
      {
        payload: {
          content: embedSheet.messages[0].payload.content,
          embeds: [
            embedSheetEmbeds[1],
            {
              title: `Footer text and today's time`,
              color: 0x2f_4b_6e,
              footer: { text: `Calibration` },
              timestamp: captureNow
            },
            {
              description: `A timestamp and no footer text.`,
              timestamp: captureNow
            }
          ],
          components: embedSheet.messages[0].payload.components
        }
      }
    ]
  },
  {
    title: `Text: headings and subtext`,
    platforms: both,
    settles: [
      `iPhone: first- and third-level headings and subtext, none captured (drawn from desktop's design at the app's sizes), and the space a heading leaves above and below.`,
      `Desktop: the same in a container, where only the second-level heading and body text were confirmed.`
    ],
    messages: [
      v2Message(
        container([
          text(`# First-level heading\nBody text under it.`),
          text(`## Second-level heading\nBody text under it.`),
          text(`### Third-level heading\nBody text under it.`),
          text(`Body text, then subtext:\n-# Subtext is small, muted print.`)
        ])
      )
    ]
  },
  {
    title: `Text: quotes, lists and code`,
    platforms: both,
    settles: [
      `iPhone: block quotes, lists and code blocks, none captured.`,
      `Desktop: the same in a container: the quote bar, list indents and markers, and the code block's box, which the renderer draws in a stand-in font.`
    ],
    messages: [
      v2Message(
        container([
          text(`> A one-line block quote.\nAnd a line after it.`),
          text(`>>> A quote to the end of the text,\nover two lines.`),
          text(
            `- A bulleted list\n- of two items\n  - and one nested\n1. A numbered list\n2. of two items`
          ),
          text(`\`\`\`js\nconst answer = 42;\nconsole.log(answer);\n\`\`\``)
        ])
      )
    ]
  },
  {
    title: `Text: inline styles, links and spoilers`,
    platforms: both,
    settles: [
      `iPhone: italic, underlined and struck-through text, inline code, links and text spoilers, none captured.`,
      `Desktop: the same in a container; inline code's box, which the renderer draws in a stand-in font.`
    ],
    messages: [
      v2Message(
        container([
          text(
            `**Bold**, *italic*, __underlined__, ~~struck through~~, ***bold italic*** and __*underlined italic*__.`
          ),
          text(
            `Inline \`code\` in a sentence, and a ||hidden spoiler|| in another.`
          ),
          text(
            `A [masked link](https://example.com/) and a bare one, https://example.com/, in one line.`
          ),
          text(
            `A long paragraph wraps at the column's edge, so its line height and the space between lines show over several lines of text, which is what matters most for a card's height on a phone.`
          )
        ])
      )
    ]
  },
  {
    title: `Text: mentions and emoji`,
    platforms: both,
    settles: [
      `iPhone: mentions and emoji in text, none captured: a known user (the bot), an unknown user and role, this channel, @everyone and @here, a slash command, guild navigation, and Unicode emoji inline and alone.`,
      `Desktop: the pill for each kind; whether emoji on a line of their own are drawn larger in a text display.`
    ],
    messages: [
      v2Message(
        container([
          text(`Users: <@${botId}> and <@${unknownUserId}>`),
          text(`A role: <@&${unknownRoleId}> · a channel: <#${channelId}>`),
          text(`Everyone: @everyone and @here`),
          text(
            `A command: </calibrate:${unknownCommandId}> · navigation: <id:customize> <id:browse> <id:guide>`
          ),
          text(`Emoji inline 😀 👍🏽 🇯🇵 in a sentence.`),
          text(`🎉🎉🎉`)
        ])
      )
    ]
  },
  {
    title: `Text: every timestamp style`,
    platforms: both,
    settles: [
      `iPhone: every timestamp style but relative, none captured, and how a chip wraps in a sentence.`,
      `Desktop: each style's wording and the chip, in the viewer's own time zone (the poster records it in the manifest).`
    ],
    messages: [
      v2Message(
        container([
          text(
            [`t`, `T`, `d`, `D`, `f`, `F`, `s`, `S`, `R`]
              .map((style) => `\`${style}\` <t:${String(fixedTime)}:${style}>`)
              .join(`\n`)
          ),
          text(
            `In a sentence: the session started <t:${String(fixedTime)}:F> and ended <t:${String(fixedTime)}:R>, so the chip has to wrap on a phone.`
          )
        ])
      )
    ]
  },
  {
    title: `Sections with thumbnails`,
    platforms: both,
    settles: [
      `Desktop: thumbnails and sections, never captured: the 85px square, the 12px gap, text rows 4px apart, a long paragraph beside a thumbnail, and whether the text is centred against it.`,
      `iPhone: one to three text displays beside a 60-point thumbnail, and a long paragraph.`
    ],
    messages: fromSheet(sectionSheet, [0]),
    tall: [`ios`]
  },
  {
    title: `Sections with buttons`,
    platforms: both,
    settles: [
      `Both: a section with a button, never captured on either: the button's place, and a long label cut at half the width less 12px.`
    ],
    messages: fromSheet(sectionSheet, [1])
  },
  {
    title: `Thumbnails of every shape`,
    platforms: both,
    settles: [
      `Both: how a wide, tall and tiny picture fills the square thumbnail, and a spoilered thumbnail.`
    ],
    messages: fromSheet(thumbnailSheet)
  },
  {
    title: `String selects`,
    platforms: both,
    settles: [
      `Desktop: the closed select's fill, border and text sizes, which are inferred; a placeholder, one chosen with its emoji, several as tags, disabled.`,
      `iPhone: any select, never captured.`,
      `After opening: the open list (option rows, emoji, descriptions), which the renderer draws from the stylesheet and nobody has compared.`
    ],
    messages: [
      v2Message(
        container([
          text(
            `**String selects**: a placeholder, one chosen, several chosen, disabled`
          ),
          selectRow({
            type: ComponentType.StringSelect,
            customId: `calibration:levels`,
            placeholder: `Choose your level`,
            options: [
              {
                label: `N5`,
                value: `n5`,
                description: `Basic phrases, about 100 kanji`,
                emoji: { id: null, name: `🌱` }
              },
              {
                label: `N4`,
                value: `n4`,
                description: `Everyday conversation, about 300 kanji`,
                emoji: { id: null, name: `🎋` }
              },
              {
                label: `N3`,
                value: `n3`,
                description: `Everyday topics, about 650 kanji`,
                emoji: { id: null, name: `🌸` }
              },
              {
                label: `N2`,
                value: `n2`,
                description: `Newspapers and the news`
              },
              { label: `N1`, value: `n1` }
            ]
          }),
          selectRow({
            type: ComponentType.StringSelect,
            customId: `calibration:one`,
            options: [
              {
                label: `N4`,
                value: `n4`,
                emoji: { id: null, name: `🎋` },
                default: true
              },
              { label: `N3`, value: `n3` }
            ]
          }),
          selectRow({
            type: ComponentType.StringSelect,
            customId: `calibration:several`,
            maxValues: 3,
            options: [
              { label: `Vocabulary`, value: `vocab`, default: true },
              { label: `Kanji`, value: `kanji`, default: true },
              { label: `Grammar`, value: `grammar`, default: true },
              { label: `Listening`, value: `listening` }
            ]
          }),
          selectRow({
            type: ComponentType.StringSelect,
            customId: `calibration:disabled`,
            disabled: true,
            placeholder: `Disabled`,
            options: [{ label: `Only option`, value: `only` }]
          })
        ])
      )
    ],
    followUp: `click (or tap) the first select, "Choose your level", so its list opens, and take a second screenshot with the list open.`
  },
  {
    title: `User, role, mentionable and channel selects`,
    platforms: both,
    settles: [
      `Both: the other four selects, closed, with a placeholder and with a chosen user (the bot) and channel (this one) drawn as pills; never captured on either.`
    ],
    messages: [
      v2Message(
        container([
          text(`**User, role, mentionable and channel selects**`),
          selectRow({
            type: ComponentType.UserSelect,
            customId: `calibration:user`,
            placeholder: `Pick a study buddy`
          }),
          selectRow({
            type: ComponentType.UserSelect,
            customId: `calibration:user-chosen`,
            defaultValues: [{ id: botId, type: `user` }]
          }),
          selectRow({
            type: ComponentType.RoleSelect,
            customId: `calibration:role`,
            placeholder: `Roles to ping`
          }),
          selectRow({
            type: ComponentType.MentionableSelect,
            customId: `calibration:mentionable`,
            maxValues: 2,
            defaultValues: [{ id: botId, type: `user` }]
          }),
          selectRow({
            type: ComponentType.ChannelSelect,
            customId: `calibration:channel`,
            defaultValues: [{ id: channelId, type: `channel` }]
          })
        ])
      )
    ]
  },
  {
    title: `Files`,
    platforms: both,
    settles: [
      `Both: the file row (icon, name, size wording), at the top level and in a container, a long name, and a spoilered file. Never captured on either; the size wording is the renderer's guess.`
    ],
    messages: fromSheet(fileSheet),
    tall: [`ios`]
  },
  {
    title: `Spoilered container, thumbnail and file`,
    platforms: both,
    settles: [
      `Both: a spoilered container, thumbnail and file, hidden; never captured on either.`,
      `After revealing: each as it looks once clicked.`
    ],
    messages: fromSheet(spoilerSheet),
    followUp: `click (or tap) each spoiler in this fixture so it is revealed, and take a second screenshot.`
  },
  {
    title: `Spoilered gallery picture and text`,
    platforms: both,
    settles: [
      `Both: a spoilered picture in a gallery (the "Spoiler" pill), and a text spoiler; never captured on either.`,
      `After revealing: each as it looks once clicked.`
    ],
    messages: [
      v2Message(
        container([
          text(
            `A gallery with its second picture spoilered, and ||a hidden phrase|| in the text.`
          ),
          gallery([`small-wide-1.png`, `small-wide-2.png`], { spoiler: [1] })
        ])
      )
    ],
    followUp: `click (or tap) each spoiler in this fixture so it is revealed, and take a second screenshot.`
  },
  {
    title: `Components outside a container`,
    platforms: both,
    settles: [
      `Both: text, a separator, a gallery, a section, a file and a row of buttons at the top level of a message, never captured on iPhone and not on desktop either: the 8px gaps between them and their width.`,
      `Both: a classic message's text with a row of buttons under it.`
    ],
    messages: [
      v2Message(
        text(`Text at the top level, then a separator:`),
        separator(1, true),
        gallery([`small-wide-3.png`]),
        {
          type: ComponentType.Section,
          components: [text(`A section at the top level, beside a thumbnail.`)],
          accessory: {
            type: ComponentType.Thumbnail,
            media: { url: `attachment://small-square.png` }
          }
        },
        {
          type: ComponentType.File,
          file: { url: `attachment://answer-key.txt` }
        },
        row(
          button(ButtonStyle.Primary, `A button`),
          button(ButtonStyle.Secondary, `Another`)
        )
      ),
      {
        payload: {
          content: `A classic message's text, with a row of buttons under it.`,
          components: [row(button(ButtonStyle.Secondary, `Classic button`))]
        }
      }
    ]
  },
  {
    title: `Two containers in one message`,
    platforms: both,
    settles: [
      `Both: the gap between two containers in one message, one with an accent bar and one without, and a container holding only one line.`
    ],
    messages: [
      v2Message(
        container([text(`## First container\nWith an accent bar.`)], {
          accentColor: 0x4a_6b_45
        }),
        container([text(`Second container, one line, no accent.`)])
      )
    ]
  },
  {
    title: `Separators: both spacings, with and without a line`,
    platforms: both,
    settles: [
      `iPhone: a separator with large spacing, and one without a line, never captured.`,
      `Desktop: large spacing's 8px above and below, and the space a separator without a line leaves.`
    ],
    messages: [
      v2Message(
        container([
          text(`Small spacing, with a line:`),
          separator(1, true),
          text(`Small spacing, no line:`),
          separator(1, false),
          text(`Large spacing, with a line:`),
          separator(2, true),
          text(`Large spacing, no line:`),
          separator(2, false),
          text(`The end.`)
        ])
      )
    ]
  },
  {
    title: `Edited messages, and messages continuing a group`,
    platforms: both,
    settles: [
      `iPhone: "(edited)" on a Components V2 message and on a classic one, and messages continuing a group, none captured.`,
      `Desktop: "(edited)" on a classic message (observed only on Components V2), and the space under the mark to the next message in the group (32px on Components V2, observed).`
    ],
    messages: [
      {
        ...v2Message(container([text(`A card, edited after it was posted.`)])),
        before: {
          flags: v2,
          components: [
            container([text(`A card, before its edit.`)])
          ] as MessageComponent
        },
        edited: true
      },
      v2Message(container([text(`The next card in the group, not edited.`)])),
      {
        payload: { content: `A classic message, edited after it was posted.` },
        before: { content: `A classic message, before its edit.` },
        edited: true
      },
      { payload: { content: `The next classic message in the group.` } }
    ]
  }
];

/** The capture set, numbered in posting order across the tiers, essential first, so a fixture keeps its number whichever tiers are posted. */
export const captureSet: readonly CaptureFixture[] = [
  ...essentialList.map((fixture) => ({
    ...fixture,
    tier: `essential` as const
  })),
  ...extendedList.map((fixture) => ({ ...fixture, tier: `extended` as const })),
  ...markdownFixtures().map((fixture) => ({
    ...fixture,
    tier: `markdown` as const
  }))
].map((fixture, index) => ({
  ...fixture,
  number: index + 1,
  code: `F${String(index + 1).padStart(2, `0`)}`
}));

/** The fixtures the "other themes" and "narrow window" steps ask for again, by title, so the steps can name them by number. */
const fixtureCode = (title: string): string => {
  const found = captureSet.find((fixture) => fixture.title === title);
  if (!found) {
    throw new Error(
      `A manual step in scripts/calibration/captureSet.ts names the fixture "${title}", which the capture set does not have. Correct the title in the step.`
    );
  }
  return found.code;
};

/** The essential fixtures asked for again in the light theme: the bots' colours, on a card and in embeds. */
const lightFixtures = [
  `The bots' question card, edited`,
  `Inbou's classic embed question and reveal`
];

const themeFixtures = [
  `Buttons: every style, disabled, with emoji, five in a row`,
  `Two embeds in one message, with text and buttons`,
  `Text: mentions and emoji`,
  `String selects`
];

const narrowFixtures = [
  `Buttons: every style, disabled, with emoji, five in a row`,
  `Sections with thumbnails`,
  `1 large square (1024 × 1024)`
];

/** What posting cannot produce: steps for the person. */
export const manualSteps: readonly ManualStep[] = [
  {
    title: `The light theme`,
    tier: `essential`,
    platforms: both,
    steps: `Switch Discord to the Light theme, take one screenshot each of ${lightFixtures.map(fixtureCode).join(` and `)}, then switch back to Dark.`,
    settles: `The light theme, never captured on either platform, on the bots' own card and embeds.`,
    screenshots: lightFixtures.length
  },
  {
    title: `Yesterday's and older headers`,
    tier: `essential`,
    platforms: both,
    steps: `Tomorrow, scroll back to ${captureSet[0].code} and screenshot its header again. Two or more days later, once more.`,
    settles: `The header's time for a message from yesterday ("Yesterday at …" in the renderer) and for an older one (a short date and the time), neither captured on desktop.`,
    screenshots: 2
  },
  {
    title: `The whole window`,
    tier: `essential`,
    platforms: [`desktop`],
    steps: `Take one screenshot of the entire Discord window, uncropped, scrolled to ${captureSet[0].code}.`,
    settles: `Where the chat column sits in the window, and the chrome around it, at your window's size.`,
    screenshots: 1
  },
  {
    title: `Other themes`,
    tier: `extended`,
    platforms: both,
    steps: `Switch Discord to each of its other themes (Light, Ash, Onyx; on iPhone, each the app offers) and take one screenshot of each of ${themeFixtures.map(fixtureCode).join(`, `)} in each theme. Switch back to Dark when done.`,
    settles: `The light, ash and onyx themes on every kind of component, never captured on either platform.`,
    screenshots: themeFixtures.length * 3
  },
  {
    title: `A narrow window`,
    tier: `extended`,
    platforms: [`desktop`],
    steps: `Drag the Discord window as narrow as it goes and take one screenshot each of ${narrowFixtures.map(fixtureCode).join(`, `)}. Then widen it again.`,
    settles: `How cards, button rows and galleries behave in a narrow chat column, which no capture shows.`,
    screenshots: narrowFixtures.length
  },
  {
    title: `An ephemeral reply`,
    tier: `extended`,
    platforms: both,
    steps: `Posting cannot make one: it is a reply to an interaction. If a bot of yours answers a command with a message only you can see, run it in the test channel and screenshot the reply. Otherwise skip this.`,
    settles: `The ephemeral reply's tint and its "Only you can see this" line, never captured on iPhone and measured on desktop only against the wrong background.`,
    screenshots: 1
  }
];

/** What the kit does not post at all, and why, so a gap is known rather than taken as covered. `part` names it in the preview's list of parts, where it has one. */
export const notCovered: ReadonlyArray<{
  what: string;
  why: string;
  part?: PartId;
}> = [
  {
    what: `A Premium button`,
    part: `premiumButton`,
    why: `it names a SKU the posting app sells, and Discord refuses one the app does not have; the test bot sells nothing.`
  },
  {
    what: `Server emoji, in buttons, select options or text`,
    why: `the preview's sheets invent their ids, which Discord refuses in components, so Unicode emoji stand in. Uploading application emoji to the bot first, and naming those, would cover them.`
  },
  {
    what: `A role mention that resolves, and roles chosen in a select`,
    why: `the kit does not know the test server's roles, so it mentions a role id that is nothing, which shows as Discord shows a deleted role.`
  }
];

/*
 * Scenes. The render of a fixture is the label, then the fixture's messages, in the clock and context below, so it can be laid beside a screenshot of the same thing.
 */

/** The label the webhook posts before each fixture: one plain line naming it. */
export const labelText = (fixture: CaptureFixture): string =>
  `${fixture.code} · ${fixture.title}`;

/**
 * The preview package's test files, by the names the fixtures give them, each with its size in bytes, since Discord always shows an uploaded file's size and the render should too. Drawn pictures are added by whoever writes a scene to disk (`scenes.ts`).
 */
const previewFiles = (): Record<string, SceneAttachment> => {
  const sheets = [
    buttonSheet,
    embedSheet,
    fileSheet,
    sectionSheet,
    spoilerSheet,
    thumbnailSheet
  ];
  const entries: Record<string, SceneAttachment> = {};
  for (const sheet of sheets) {
    for (const [name, { path }] of Object.entries(
      sheet.context?.attachments ?? {}
    )) {
      entries[name] = { path, size: statSync(path).size };
    }
  }
  return entries;
};

/** What every fixture's render resolves: the bot and the labeller as authors, this channel, and the files. */
export const captureContext = (): SceneContext => ({
  users: {
    [botId]: { name: `Calibration Bot`, bot: true },
    [labellerId]: { name: `Calibration`, bot: true }
  },
  channels: { [channelId]: { name: `calibration`, type: 0 } },
  attachments: previewFiles()
});

/** A fixture as one scene: its label from the webhook, then its messages from the bot, with "(edited)" where it is edited. */
export const fixtureScene = (fixture: CaptureFixture): Scene => ({
  now: captureNow,
  context: captureContext(),
  messages: [
    { author: labellerId, payload: { content: labelText(fixture) } },
    ...fixture.messages.map((message): SceneMessage => ({
      payload: message.payload,
      author: botId,
      ...(message.edited === undefined ? {} : { edited: message.edited })
    }))
  ]
});

/** How many screenshots a fixture needs on a platform: one, or two where it is tall, and as many again after its follow-up. */
export const fixtureScreenshots = (
  fixture: CaptureFixture,
  platform: CapturePlatform
): number => {
  if (!fixture.platforms.includes(platform)) return 0;
  const each = fixture.tall?.includes(platform) ? 2 : 1;
  return fixture.followUp ? each * 2 : each;
};

/** How many screenshots a tier needs on a platform, fixtures and manual steps together, or the whole capture with no tier. */
export const totalScreenshots = (
  platform: CapturePlatform,
  tier?: CaptureTier
): number =>
  captureSet
    .filter((fixture) => tier === undefined || fixture.tier === tier)
    .reduce((sum, fixture) => sum + fixtureScreenshots(fixture, platform), 0) +
  manualSteps
    .filter(
      (step) =>
        (tier === undefined || step.tier === tier) &&
        step.platforms.includes(platform)
    )
    .reduce((sum, step) => sum + step.screenshots, 0);

/** Reads a `--tier` value: a tier's name, or `all`. Throws, listing them, for anything else. */
export const parseTier = (value: string | undefined): CaptureTier | `all` => {
  if (value === undefined) return `essential`;
  if (value === `all` || (tiers as readonly string[]).includes(value)) {
    return value as CaptureTier | `all`;
  }
  throw new Error(
    `\`--tier ${value}\` is not a tier of the capture set. The tiers are ${tiers.join(`, `)} (the default), or \`all\`. Run the dry run to see what each holds.`
  );
};

/**
 * Picks fixtures: by number when `selection` is given (`"3"`, `"3,5"`, `"3-7"`, or a mix, whatever their tier), and otherwise every fixture of `tier`. Throws, naming the problem, for a selection it cannot read or a number the set does not have.
 */
export const selectFixtures = (
  selection: string | undefined,
  tier: CaptureTier | `all` = `essential`
): CaptureFixture[] => {
  if (selection === undefined || selection.trim() === ``) {
    return captureSet.filter(
      (fixture) => tier === `all` || fixture.tier === tier
    );
  }
  const wanted = new Set<number>();
  for (const part of selection.split(`,`)) {
    const match = /^\s*F?(\d+)\s*(?:-\s*F?(\d+)\s*)?$/i.exec(part);
    if (!match) {
      throw new Error(
        `\`--only ${selection}\` could not be read: "${part}" is not a fixture number or a range of them. Write numbers and ranges separated by commas, such as \`--only 1,3,10-12\`.`
      );
    }
    const first = Number(match[1]);
    const last = match[2] === undefined ? first : Number(match[2]);
    for (
      let number = Math.min(first, last);
      number <= Math.max(first, last);
      number += 1
    ) {
      if (number < 1 || number > captureSet.length) {
        throw new Error(
          `\`--only ${selection}\` names fixture ${String(number)}, but the capture set has fixtures 1 to ${String(captureSet.length)}. Run the dry run without \`--only\` to see them all.`
        );
      }
      wanted.add(number);
    }
  }
  return captureSet.filter((fixture) => wanted.has(fixture.number));
};
