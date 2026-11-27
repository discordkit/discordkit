/**
 * What a scene is made of, and which of those parts each layout draws from observation of the real client.
 *
 * The desktop layout draws every part from Discord's own shipped stylesheet, so none of its parts is reported here; the few things desktop decides in JavaScript and that no capture shows are recorded where they are drawn (`format/galleryLayout.ts`). The iOS app ships no stylesheet, so each part of the iOS layout is either seen in a capture of the app or a choice: usually the desktop design at the app's text sizes. `parts` below is the one list of which is which. The components' iOS rules name the same captures beside each measured value, and `sceneParts` walks a scene with the same switches the components draw it with, so a new component or markdown node fails to compile here until it is listed.
 *
 * Plain data and pure functions: no Node built-ins and no React, so the command line, the Node renderer and Studio read the same answer.
 */
import type { ActionRow } from "@discordkit/client/components/types/ActionRow";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Container } from "@discordkit/client/components/types/Container";
import type { Section } from "@discordkit/client/components/types/Section";
import type { Select } from "@discordkit/client/components/types/Select";
import type { TextInput } from "@discordkit/client/components/types/TextInput";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import { isComponentsV2 } from "./components.js";
import type { Platform } from "./devices.js";
import { groupStarts, sentTimes } from "./format/groups.js";
import { resolveClock } from "./format/timestamp.js";
import type { MarkdownNode } from "./markdown/ast.js";
import { parseMarkdown } from "./markdown/parse.js";
import type { Scene, SceneMessage } from "./scene.js";
import type { ResolvedViewport } from "./viewport.js";

export interface PartInfo {
  /** As a sentence names it: "classic embed". */
  name: string;
  /** The captures of the iOS app that show it, by their catalogue file names, or null when none does and the iOS layout draws it from a choice. */
  ios: string | null;
}

/** Every part a scene can hold that the layouts treat differently, with where the iOS layout's drawing of it comes from (spec §7b). */
export const parts = {
  header: {
    name: `message header`,
    ios: `tome-019, tome-023, tome-054 (an app's avatar, name, tag and time, today and older)`
  },
  groupedMessage: { name: `message continuing a group`, ios: null },
  edited: { name: `"(edited)" mark`, ios: null },
  ephemeral: { name: `ephemeral reply`, ios: null },
  classicText: { name: `classic message text`, ios: null },
  embed: { name: `classic embed`, ios: null },
  topLevel: { name: `component outside a container`, ios: null },
  container: {
    name: `container`,
    ios: `tome-019, tome-023, tome-029, tome-054, tome-056`
  },
  accent: { name: `container accent bar`, ios: `tome-054, tome-055, tome-056` },
  text: { name: `text`, ios: `tome-022, tome-025, tome-055` },
  bold: { name: `bold text`, ios: `tome-019, tome-028` },
  italic: { name: `italic text`, ios: null },
  underline: { name: `underlined text`, ios: null },
  strikethrough: { name: `struck-through text`, ios: null },
  heading1: { name: `first-level heading`, ios: null },
  heading2: {
    name: `second-level heading`,
    ios: `tome-019, tome-021, tome-026`
  },
  heading3: { name: `third-level heading`, ios: null },
  subtext: { name: `subtext`, ios: null },
  blockQuote: { name: `block quote`, ios: null },
  list: { name: `list`, ios: null },
  codeBlock: { name: `code block`, ios: null },
  inlineCode: { name: `inline code`, ios: null },
  link: { name: `link`, ios: null },
  mention: { name: `mention`, ios: null },
  emoji: { name: `emoji`, ios: null },
  relativeTimestamp: {
    name: `relative timestamp`,
    ios: `tome-019, tome-054, tome-055, tome-056`
  },
  timestamp: { name: `date or time timestamp`, ios: null },
  separator: { name: `separator`, ios: `tome-019, tome-054, tome-055` },
  separatorLarge: { name: `separator with large spacing`, ios: null },
  separatorBlank: { name: `separator without a line`, ios: null },
  gallery: {
    name: `media gallery`,
    ios: `tome-019 to tome-025, tome-054 (one to four pictures, with ALT badges)`
  },
  galleryLarge: { name: `media gallery of five or more pictures`, ios: null },
  secondaryButton: {
    name: `secondary button`,
    ios: `tome-019, tome-021, tome-029, tome-056`
  },
  primaryButton: { name: `primary button`, ios: null },
  successButton: { name: `success button`, ios: null },
  dangerButton: { name: `danger button`, ios: null },
  linkButton: { name: `link button`, ios: null },
  premiumButton: { name: `premium button`, ios: null },
  disabledButton: { name: `disabled button`, ios: null },
  buttonEmoji: { name: `emoji in a button`, ios: null },
  sectionThumbnail: {
    name: `section with a thumbnail`,
    ios: `tome-025, tome-028, tome-029`
  },
  sectionButton: { name: `section with a button`, ios: null },
  select: { name: `select menu`, ios: null },
  file: { name: `file`, ios: null },
  spoiler: { name: `spoiler`, ios: null },
  lightTheme: { name: `light theme`, ios: null },
  ashTheme: { name: `ash theme`, ios: null },
  onyxTheme: { name: `onyx theme`, ios: null }
} as const satisfies Record<string, PartInfo>;

export type PartId = keyof typeof parts;

/** What a scene holds, as far as the layouts treat it differently. */
export interface SceneParts {
  /** Every part the scene draws, in the order of `parts`. */
  parts: PartId[];
  /** Whether it draws a Unicode emoji, which the iOS app draws as Apple's and this package as Twemoji. */
  unicodeEmoji: boolean;
}

const buttonParts: Record<ButtonStyle, PartId> = {
  [ButtonStyle.Primary]: `primaryButton`,
  [ButtonStyle.Secondary]: `secondaryButton`,
  [ButtonStyle.Success]: `successButton`,
  [ButtonStyle.Danger]: `dangerButton`,
  [ButtonStyle.Link]: `linkButton`,
  [ButtonStyle.Premium]: `premiumButton`
};

/**
 * Lists the parts a scene draws. It walks the scene the way the components draw it: each message's header or not (by the same grouping rule), its body as Components V2 or classic, every component by type, and every text by its parsed markdown. Throws, as the scene would, for a message timestamp that is not a date or a clock it cannot read.
 */
export const sceneParts = (scene: Scene): SceneParts => {
  const found = new Set<PartId>();
  let unicodeEmoji = false;
  const add = (part: PartId): void => {
    found.add(part);
  };

  const markdown = (nodes: readonly MarkdownNode[]): void => {
    for (const node of nodes) {
      switch (node.type) {
        case `text`:
        case `lineBreak`:
          break;
        case `heading`:
          add(
            node.level === 1
              ? `heading1`
              : node.level === 2
                ? `heading2`
                : `heading3`
          );
          markdown(node.content);
          break;
        case `subtext`:
          add(`subtext`);
          markdown(node.content);
          break;
        case `blockQuote`:
          add(`blockQuote`);
          markdown(node.content);
          break;
        case `list`:
          add(`list`);
          for (const item of node.items) markdown(item);
          break;
        case `codeBlock`:
          add(`codeBlock`);
          break;
        case `inlineCode`:
          add(`inlineCode`);
          break;
        case `bold`:
          add(`bold`);
          markdown(node.content);
          break;
        case `italic`:
          add(`italic`);
          markdown(node.content);
          break;
        case `underline`:
          add(`underline`);
          markdown(node.content);
          break;
        case `strikethrough`:
          add(`strikethrough`);
          markdown(node.content);
          break;
        case `spoiler`:
          add(`spoiler`);
          markdown(node.content);
          break;
        case `link`:
          add(`link`);
          markdown(node.content);
          break;
        case `userMention`:
        case `roleMention`:
        case `channelMention`:
        case `globalMention`:
        case `commandMention`:
        case `guildNavigation`:
          add(`mention`);
          break;
        case `timestamp`:
          add(node.style === `R` ? `relativeTimestamp` : `timestamp`);
          break;
        case `customEmoji`:
          add(`emoji`);
          break;
        case `emoji`:
          add(`emoji`);
          unicodeEmoji = true;
          break;
        default:
          throw new Error(
            `@discordkit/preview has no part for a markdown node of type ${JSON.stringify((node satisfies never as { type: unknown }).type)}. Every node the parser produces must be listed in parts.ts, which is a bug in the package. Please report it.`
          );
      }
    }
  };

  const text = (content: string): void => {
    add(`text`);
    markdown(parseMarkdown(content, `textDisplay`));
  };

  const button = (target: Button): void => {
    add(buttonParts[target.style]);
    if (target.disabled === true) add(`disabledButton`);
    if (target.emoji) {
      add(`buttonEmoji`);
      // As `PartialEmoji` draws it: a server emoji by its id, else a Unicode emoji by its name.
      const { id } = target.emoji;
      if (!id) unicodeEmoji = true;
    }
  };

  const row = (target: ActionRow): void => {
    // As `ActionRow` reads it: an array, or a bare select (the client's schema, until #106).
    const children: ReadonlyArray<Button | Select | TextInput> = Array.isArray(
      target.components
    )
      ? target.components
      : [target.components];
    for (const child of children) {
      if (child.type === ComponentType.Button) button(child);
      else add(`select`);
    }
  };

  const section = (target: Section): void => {
    for (const child of target.components) text(child.content);
    const { accessory } = target;
    if (accessory.type === ComponentType.Thumbnail) {
      add(`sectionThumbnail`);
      if (accessory.spoiler === true) add(`spoiler`);
    } else {
      add(`sectionButton`);
      button(accessory);
    }
  };

  type Child = Container[`components`][number];
  const component = (target: MessageComponent[number] | Child): void => {
    switch (target.type) {
      case ComponentType.Container:
        add(`container`);
        if (target.accentColor !== undefined && target.accentColor !== null) {
          add(`accent`);
        }
        if (target.spoiler === true) add(`spoiler`);
        for (const child of target.components) component(child);
        break;
      case ComponentType.TextDisplay:
        text(target.content);
        break;
      case ComponentType.Separator:
        add(`separator`);
        if (target.spacing === 2) add(`separatorLarge`);
        if (target.divider === false) add(`separatorBlank`);
        break;
      case ComponentType.MediaGallery:
        add(target.items.length > 4 ? `galleryLarge` : `gallery`);
        if (target.items.some((item) => item.spoiler === true)) add(`spoiler`);
        break;
      case ComponentType.ActionRow:
        row(target);
        break;
      case ComponentType.Section:
        section(target);
        break;
      case ComponentType.File:
        add(`file`);
        if (target.spoiler === true) add(`spoiler`);
        break;
      default:
        // Whatever the renderer refuses is reported by lint; it draws nothing here.
        break;
    }
  };

  const body = (message: SceneMessage): void => {
    const { content = ``, embeds = [], components = [] } = message.payload;
    if (isComponentsV2(message.payload)) {
      for (const top of components) {
        if (top.type !== ComponentType.Container) add(`topLevel`);
        component(top);
      }
      return;
    }
    if (content !== ``) {
      add(`classicText`);
      markdown(parseMarkdown(content, `message`));
    }
    if (embeds.length > 0) add(`embed`);
    if (components.length > 0) add(`topLevel`);
    for (const top of components) component(top);
  };

  const clock = resolveClock(scene);
  const starts = groupStarts(
    scene.messages,
    sentTimes(scene.messages, clock.now)
  );
  scene.messages.forEach((message, index) => {
    add(starts[index] ? `header` : `groupedMessage`);
    if (message.edited === true) add(`edited`);
    if (message.ephemeral === true) add(`ephemeral`);
    if (message.openSelect !== undefined) add(`select`);
    body(message);
  });
  if (scene.theme === `light`) add(`lightTheme`);
  if (scene.theme === `ash`) add(`ashTheme`);
  if (scene.theme === `onyx`) add(`onyxTheme`);

  const order = Object.keys(parts);
  return {
    parts: [...found].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
    unicodeEmoji
  };
};

/** A part of the scene drawn, in one viewport, from a rule nobody has checked against that platform's client. */
export interface UnobservedPart {
  part: PartId;
  /** "classic embed". */
  name: string;
}

/** How far one viewport's drawing of one scene can be trusted. Plain data, so it prints as JSON as it is. */
export interface ViewportFidelity {
  /** The scene's parts drawn here from rules not checked against this platform's client, in a fixed order. Empty when every part drawn was seen in a capture, or when the layout draws from Discord's own stylesheet (desktop). */
  unobserved: UnobservedPart[];
  /** Known limits of the drawing that are not about a rule, such as emoji drawn as Twemoji where the app draws Apple's. */
  limits: string[];
}

/** A viewport as a render reports it: what it is, and how far its drawing of this scene can be trusted. */
export type ReportedViewport = ResolvedViewport & ViewportFidelity;

/** The platforms whose layout is drawn from observation rather than a stylesheet, so whose parts are checked one by one. */
const observedPlatforms: readonly Platform[] = [`ios`];

/**
 * Which parts of `scene`, drawn in `viewport`, come from rules nobody has observed on the viewport's platform, and what else limits the drawing there.
 *
 * Only the iOS layout reports parts: desktop draws from Discord's stylesheet, and a device drawn with a layout that is not its own already says so in the viewport's `note`. On an iPhone, a part is unobserved when no capture of the app shows it (`parts`). On an iPad, which asks for the same layout but has never been captured, every part is.
 */
export const viewportFidelity = (
  scene: Scene,
  viewport: ResolvedViewport
): ViewportFidelity => {
  if (
    viewport.layout !== `ios` ||
    viewport.platform === null ||
    !observedPlatforms.includes(viewport.platform)
  ) {
    return { unobserved: [], limits: [] };
  }
  const found = sceneParts(scene);
  const unobserved = found.parts
    .filter((part) => !viewport.calibrated || parts[part].ios === null)
    .map((part) => ({ part, name: parts[part].name }));
  const limits = found.unicodeEmoji
    ? [
        `Emoji are drawn as Twemoji, where the iOS app draws Apple's, which cannot be shipped: their shapes and colours differ, though their size and place do not.`
      ]
    : [];
  return { unobserved, limits };
};

/** One line for a caption or a terminal: what to check on a real device, or that nothing needs checking. Null when the viewport reports nothing either way (desktop). */
export const fidelitySummary = (
  fidelity: ViewportFidelity,
  viewport: ResolvedViewport
): string | null => {
  if (viewport.layout !== `ios`) return null;
  if (fidelity.unobserved.length === 0) {
    return `Every part of this message was drawn as measured from the iOS app.`;
  }
  const names = fidelity.unobserved.map(({ name }) => name).join(`, `);
  return viewport.calibrated
    ? `Not yet seen in the iOS app, so drawn from desktop's design at the app's sizes: ${names}. Check ${fidelity.unobserved.length === 1 ? `it` : `these`} on a real phone.`
    : `Nothing has been captured on this device, so every part is drawn from the iPhone's measurements: ${names}.`;
};
