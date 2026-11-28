import { isObject } from "@discordkit/core/utils/isObject";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import {
  componentName,
  findOpenSelect,
  isComponentsV2,
  selectTypes,
  supportedComponents,
  type ComponentParent
} from "../components.js";
import type { Finding, LintCode, Path, Severity } from "../findings.js";
import type { MarkdownContext } from "../markdown/parse.js";
import type { Scene } from "../scene.js";
import {
  characters,
  defaultSelectValues,
  maxActionRowButtons,
  maxAltText,
  maxButtonLabel,
  maxButtonUrl,
  maxClassicActionRows,
  maxComponents,
  maxContentCharacters,
  maxCustomId,
  maxEmbedCharacters,
  maxEmbeds,
  maxSectionComponents,
  maxSelectOptionDescription,
  maxSelectOptionLabel,
  maxSelectOptions,
  maxSelectOptionValue,
  maxSelectPlaceholder,
  maxSelectValues,
  maxTextDisplayCharacters,
  minSectionComponents
} from "./limits.js";
import { findDevice } from "../devices.js";
import { unknownDeviceMessage } from "../viewport.js";
import { markdownFindings } from "./markdown.js";

/** What a count measures. */
export type CountMetric =
  | `components`
  | `textDisplayCharacters`
  | `contentCharacters`
  | `actionRows`
  | `embeds`
  | `embedCharacters`;

/** How much of one of Discord's limits a message uses, reported whether or not it is exceeded, so a caller can see the headroom. */
export interface Count {
  metric: CountMetric;
  /** The message payload the count is for. */
  path: Path;
  used: number;
  limit: number;
  /** The count in words, such as "32 of 40 components". */
  summary: string;
}

export interface LintSceneResult {
  findings: Finding[];
  counts: Count[];
}

type Node = Record<string, unknown>;

const selects = new Set<unknown>(selectTypes);

const countWords: Record<CountMetric, string> = {
  components: `components`,
  textDisplayCharacters: `text display characters`,
  contentCharacters: `content characters`,
  actionRows: `top-level action rows`,
  embeds: `embeds`,
  embedCharacters: `embed characters`
};

const text = (value: unknown): string | undefined =>
  typeof value === `string` ? value : undefined;

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Where a component sits. */
type Position = ComponentParent;

const isSupported = (position: Position, type: unknown): boolean =>
  (supportedComponents[position] as readonly unknown[]).includes(type);

interface Visit {
  node: Node;
  path: Path;
  position: Position;
  /** Inside a component the renderer cannot draw, which is reported once, for the outermost one. */
  insideUnsupported: boolean;
}

/** Every component in a tree, depth first in payload order, with nested components and a section's accessory. */
const visitComponents = (components: unknown, base: Path): Visit[] => {
  const visits: Visit[] = [];
  const walk = (
    items: unknown,
    path: Path,
    position: Position,
    insideUnsupported: boolean
  ): void => {
    // The client's schema has a select menu in an action row as a bare object; Discord expects an array. Accept either.
    const entries = Array.isArray(items)
      ? items.map((item: unknown, index): [unknown, Path] => [
          item,
          [...path, index]
        ])
      : isObject(items)
        ? [[items, path] as [unknown, Path]]
        : [];
    for (const [item, at] of entries) {
      if (!isObject(item)) continue;
      visits.push({ node: item, path: at, position, insideUnsupported });
      const inside = insideUnsupported || !isSupported(position, item.type);
      switch (item.type) {
        case ComponentType.Container:
          walk(item.components, [...at, `components`], `container`, inside);
          break;
        case ComponentType.ActionRow:
          walk(item.components, [...at, `components`], `actionRow`, inside);
          break;
        case ComponentType.Section:
          walk(item.components, [...at, `components`], `section`, inside);
          walk(item.accessory, [...at, `accessory`], `accessory`, inside);
          break;
        default:
          break;
      }
    }
  };
  walk(components, base, `message`, false);
  return visits;
};

/** Every string in a value that names an attachment, with its path. */
const attachmentReferences = (
  value: unknown,
  path: Path
): Array<{ name: string; path: Path }> => {
  if (typeof value === `string`) {
    return value.startsWith(`attachment://`)
      ? [{ name: value.slice(`attachment://`.length), path }]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item: unknown, index) =>
      attachmentReferences(item, [...path, index])
    );
  }
  if (isObject(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      attachmentReferences(item, [...path, key])
    );
  }
  return [];
};

const positionNames: Record<Position, string> = {
  message: `a message`,
  container: `a Container`,
  actionRow: `an Action Row`,
  section: `a Section`,
  accessory: `a Section's accessory`
};

/**
 * Lints one scene: Discord's rules that @discordkit/client's schemas do not enforce, markdown that will not render as written, and components the renderer cannot draw yet. Paths point into the scene as given. Never throws, including on a scene that intake reported errors for.
 */
export const lintScene = (scene: Scene): LintSceneResult => {
  const findings: Finding[] = [];
  const counts: Count[] = [];
  const add = (
    code: LintCode,
    severity: Severity,
    path: Path,
    message: string
  ): void => {
    findings.push({ code, severity, path, message });
  };
  const count = (
    metric: CountMetric,
    path: Path,
    used: number,
    limit: number
  ): void => {
    counts.push({
      metric,
      path,
      used,
      limit,
      summary: `${used.toLocaleString(`en-US`)} of ${limit.toLocaleString(`en-US`)} ${countWords[metric]}`
    });
  };
  const markdown = (
    source: unknown,
    context: MarkdownContext,
    path: Path
  ): void => {
    if (typeof source === `string`) {
      findings.push(...markdownFindings(source, context, path));
    }
  };

  const attachments = isObject(scene.context?.attachments)
    ? scene.context.attachments
    : {};
  const checkAttachments = (value: unknown, path: Path): void => {
    for (const reference of attachmentReferences(value, path)) {
      if (Object.hasOwn(attachments, reference.name)) continue;
      // `asset` lets the Node renderer recognise its own report of the same missing file and keep only this one.
      findings.push({
        code: `attachment-missing`,
        severity: `warning`,
        path: reference.path,
        message: `\`attachment://${reference.name}\` names a file the scene does not have: \`context.attachments\` has no entry called ${JSON.stringify(reference.name)}. The preview draws a placeholder in its place, and Discord shows the picture only if a file of exactly that name is uploaded with the message. Add \`${JSON.stringify(reference.name)}: { "path": "<file on disk>" }\` to the scene's \`context.attachments\`, or correct the name to match a file that is there.`,
        asset: `attachment://${reference.name}`
      });
    }
  };

  checkAttachments(scene.context?.users, [`context`, `users`]);
  checkAttachments(scene.context?.emoji, [`context`, `emoji`]);

  list(scene.messages).forEach((message: unknown, index) => {
    if (!isObject(message) || !isObject(message.payload)) return;
    const payload: Node = message.payload;
    const base: Path = [`messages`, index, `payload`];
    const content = text(payload.content) ?? ``;
    const embeds = list(payload.embeds);
    const components = list(payload.components);
    const flags = typeof payload.flags === `number` ? payload.flags : 0;
    const flagged = isComponentsV2({ flags });
    const layout = components
      .filter(isObject)
      .filter((component) => component.type !== ComponentType.ActionRow);
    const v2 = isComponentsV2({ flags, components: layout });

    if (
      content === `` &&
      embeds.length === 0 &&
      components.length === 0 &&
      list(payload.attachments).length === 0 &&
      list(payload.stickerIds).length === 0 &&
      payload.poll === undefined
    ) {
      add(
        `message-empty`,
        `error`,
        base,
        `This message has no content, embeds or components, so there is nothing to draw, and Discord refuses to create a message without at least one of them. Add \`components\` (with the Components V2 flag) or \`content\`.`
      );
    }

    if (!flagged && layout.length > 0) {
      add(
        `components-v2-flag-missing`,
        `warning`,
        [...base, `flags`],
        `This message holds layout components (${[...new Set(layout.map((component) => componentName(component.type)))].join(`, `)}) but its \`flags\` do not include IS_COMPONENTS_V2 (32768). Discord refuses layout components in a message created without that flag. An edit to a message that already has the flag may leave \`flags\` out, so this is only a warning; when creating the message, set \`flags\` to include \`MessageFlag.IS_COMPONENTS_V2\`.`
      );
    }
    if (v2 && content !== ``) {
      add(
        `components-v2-content`,
        `error`,
        [...base, `content`],
        `This is a Components V2 message (${flagged ? `it has the IS_COMPONENTS_V2 flag` : `it holds layout components`}) but also has \`content\`. Discord refuses \`content\` on a V2 message, and the preview cannot draw it. Move the text into a Text Display component; when editing a message into V2, send \`content: null\`.`
      );
    }
    if (v2 && embeds.length > 0) {
      add(
        `components-v2-content`,
        `error`,
        [...base, `embeds`],
        `This is a Components V2 message (${flagged ? `it has the IS_COMPONENTS_V2 flag` : `it holds layout components`}) but also has \`embeds\`. Discord refuses embeds on a V2 message, and the preview cannot draw them. Rebuild the embed as a Container with Text Displays; when editing a message into V2, send \`embeds: []\`.`
      );
    }

    const contentUsed = characters(content);
    if (content !== ``) {
      count(`contentCharacters`, base, contentUsed, maxContentCharacters);
    }
    if (contentUsed > maxContentCharacters) {
      add(
        `content-length`,
        `error`,
        [...base, `content`],
        `\`content\` is ${contentUsed.toLocaleString(`en-US`)} characters, over Discord's limit of ${maxContentCharacters.toLocaleString(`en-US`)}, so Discord would refuse the message. Shorten it, split it across messages, or send it as Components V2, whose Text Displays allow ${maxTextDisplayCharacters.toLocaleString(`en-US`)} characters in total.`
      );
    }
    markdown(payload.content, `message`, [...base, `content`]);

    const visits = visitComponents(payload.components, [...base, `components`]);
    if (v2) {
      count(`components`, base, visits.length, maxComponents);
      if (visits.length > maxComponents) {
        add(
          `components-total`,
          `error`,
          [...base, `components`],
          `This message has ${String(visits.length)} components counting every nested one and each section's accessory, over Discord's limit of ${String(maxComponents)} for the whole tree, so Discord would refuse it. Merge adjacent Text Displays into one (a single Text Display can hold several lines), drop separators that only add space, or split the message in two.`
        );
      }
      const textDisplays = visits.filter(
        (visit) => visit.node.type === ComponentType.TextDisplay
      );
      const used = textDisplays.reduce(
        (sum, visit) => sum + characters(text(visit.node.content) ?? ``),
        0
      );
      count(`textDisplayCharacters`, base, used, maxTextDisplayCharacters);
      if (used > maxTextDisplayCharacters) {
        add(
          `text-display-length`,
          `error`,
          [...base, `components`],
          `This message's Text Displays hold ${used.toLocaleString(`en-US`)} characters together, over Discord's limit of ${maxTextDisplayCharacters.toLocaleString(`en-US`)} across all of them, so Discord would refuse it. Shorten the text, or split it across two messages.`
        );
      }
    } else if (components.length > 0) {
      const rows = components.length;
      count(`actionRows`, base, rows, maxClassicActionRows);
      if (rows > maxClassicActionRows) {
        add(
          `classic-action-rows`,
          `error`,
          [...base, `components`],
          `This message has ${String(rows)} action rows without the Components V2 flag, over Discord's limit of ${String(maxClassicActionRows)} for a classic message, so Discord would refuse it. Remove a row, or set the IS_COMPONENTS_V2 flag, which allows up to ${String(maxComponents)} components (and then rules out \`content\` and \`embeds\`).`
        );
      }
    }

    const customIds = new Map<string, Path>();
    for (const { node, path, position, insideUnsupported } of visits) {
      const type = node.type;
      if (!insideUnsupported) {
        if (!isSupported(position, type)) {
          add(
            `component-unsupported`,
            `warning`,
            path,
            `The preview cannot draw a ${componentName(type)} component inside ${positionNames[position]} yet, so rendering this scene fails rather than leave it out. Discord may accept it; this is a gap in @discordkit/preview, not a problem with the payload. Remove it to preview the rest of the message.`
          );
        }
      }

      const customId = text(node.customId);
      if (customId !== undefined) {
        const used = characters(customId);
        if (used > maxCustomId) {
          add(
            `custom-id-length`,
            `error`,
            [...path, `customId`],
            `This \`customId\` is ${String(used)} characters, over Discord's limit of ${String(maxCustomId)}, so Discord would refuse the message. Keep the id short, and look up any longer state from it when the interaction arrives.`
          );
        }
        const first = customIds.get(customId);
        if (first === undefined) {
          customIds.set(customId, path);
        } else {
          add(
            `custom-id-duplicate`,
            `error`,
            [...path, `customId`],
            `The \`customId\` ${JSON.stringify(customId)} is already used by another component in this message, and Discord requires every \`customId\` in a message to be unique, so it would refuse the message (and could not tell the two apart when one is clicked). Give each component its own id, for example by adding the option to it.`
          );
        }
      }

      if (type === ComponentType.ActionRow) {
        const children = list(node.components).filter(isObject);
        const buttons = children.filter(
          (child) => child.type === ComponentType.Button
        );
        const rowSelects = children.filter((child) => selects.has(child.type));
        if (buttons.length > maxActionRowButtons) {
          add(
            `action-row-size`,
            `error`,
            [...path, `components`],
            `This action row holds ${String(buttons.length)} buttons, over Discord's limit of ${String(maxActionRowButtons)} per row, so Discord would refuse the message. Move the extra buttons into another action row.`
          );
        }
        if (
          rowSelects.length > 0 &&
          (buttons.length > 0 || rowSelects.length > 1)
        ) {
          add(
            `action-row-mixed`,
            `error`,
            [...path, `components`],
            `This action row holds ${buttons.length > 0 ? `buttons and a select menu` : `${String(rowSelects.length)} select menus`}, but Discord allows a row to hold either up to ${String(maxActionRowButtons)} buttons or exactly one select menu, so it would refuse the message. Put the select menu in an action row of its own.`
          );
        }
      }

      if (type === ComponentType.Button) {
        const style = node.style;
        const has = (field: string): boolean => node[field] !== undefined;
        const problems: string[] = [];
        if (style === ButtonStyle.Link) {
          if (!has(`url`)) problems.push(`needs a \`url\``);
          if (has(`customId`)) problems.push(`cannot have a \`customId\``);
          if (has(`skuId`)) problems.push(`cannot have a \`skuId\``);
        } else if (style === ButtonStyle.Premium) {
          if (!has(`skuId`)) problems.push(`needs a \`skuId\``);
          for (const field of [`customId`, `label`, `url`, `emoji`]) {
            if (has(field)) problems.push(`cannot have a \`${field}\``);
          }
        } else if (typeof style === `number`) {
          if (!has(`customId`)) problems.push(`needs a \`customId\``);
          if (has(`url`)) problems.push(`cannot have a \`url\``);
          if (has(`skuId`)) problems.push(`cannot have a \`skuId\``);
        }
        if (problems.length > 0) {
          const styleName =
            typeof style === `number` ? ButtonStyle[style] : undefined;
          add(
            `button-style-fields`,
            `error`,
            path,
            `This ${styleName ?? `unstyled`} button ${problems.join(` and `)}: Discord ties a button's fields to its style (Primary, Secondary, Success and Danger send a \`customId\`, Link opens a \`url\`, Premium sells a \`skuId\`), and refuses a button whose fields do not match. Either change \`style\` to the kind of button you meant, or change the fields to match the style.`
          );
        }
        const label = text(node.label);
        if (label !== undefined && characters(label) > maxButtonLabel) {
          add(
            `button-label-length`,
            `error`,
            [...path, `label`],
            `This button's label is ${String(characters(label))} characters, over Discord's limit of ${String(maxButtonLabel)}, so Discord would refuse the message. A button that long is also hard to read; shorten the label and put the detail in a Text Display beside it.`
          );
        }
        const url = text(node.url);
        if (url !== undefined && characters(url) > maxButtonUrl) {
          add(
            `button-url-length`,
            `error`,
            [...path, `url`],
            `This link button's URL is ${String(characters(url))} characters, over Discord's limit of ${String(maxButtonUrl)}, so Discord would refuse the message. Shorten the URL, for example with a redirect on your own domain.`
          );
        }
      }

      const altTexts: Array<[unknown, Path]> =
        type === ComponentType.MediaGallery
          ? list(node.items).map(
              (item: unknown, itemIndex): [unknown, Path] => [
                isObject(item) ? item.description : undefined,
                [...path, `items`, itemIndex, `description`]
              ]
            )
          : type === ComponentType.Thumbnail
            ? [[node.description, [...path, `description`]]]
            : [];
      for (const [description, at] of altTexts) {
        const alt = text(description);
        if (alt !== undefined && characters(alt) > maxAltText) {
          add(
            `alt-text-length`,
            `error`,
            at,
            `This alt text is ${characters(alt).toLocaleString(`en-US`)} characters, over Discord's limit of ${maxAltText.toLocaleString(`en-US`)}, so Discord would refuse the message. Describe the picture more briefly; alt text is read aloud by screen readers, so shorter is kinder too.`
          );
        }
      }

      if (type === ComponentType.TextDisplay) {
        markdown(node.content, `textDisplay`, [...path, `content`]);
      }

      if (type === ComponentType.Section) {
        const used = list(node.components).length;
        if (used < minSectionComponents || used > maxSectionComponents) {
          add(
            `section-component-count`,
            `error`,
            [...path, `components`],
            `This section holds ${String(used)} text displays, but Discord requires ${String(minSectionComponents)} to ${String(maxSectionComponents)} beside its accessory, so it would refuse the message. ${used === 0 ? `Add a Text Display for the accessory to sit beside, or use the accessory on its own (a button in an Action Row, a picture in a Media Gallery).` : `Merge the text into ${String(maxSectionComponents)} Text Displays or fewer (one can hold several lines), or move the rest out of the section.`}`
          );
        }
      }

      if (type === ComponentType.File) {
        const url = isObject(node.file) ? text(node.file.url) : undefined;
        if (url !== undefined && !url.startsWith(`attachment://`)) {
          add(
            `file-not-attachment`,
            `error`,
            [...path, `file`, `url`],
            `This File component points at ${JSON.stringify(url)}, but a File can only show a file uploaded with the message, named as \`attachment://<filename>\`, so Discord would refuse it. Upload the file with the message and set \`url\` to \`attachment://\` and its file name, or show a picture from the web in a Media Gallery or a link in a Text Display instead.`
          );
        }
      }

      if (selects.has(type)) {
        const placeholder = text(node.placeholder);
        if (
          placeholder !== undefined &&
          characters(placeholder) > maxSelectPlaceholder
        ) {
          add(
            `select-placeholder-length`,
            `error`,
            [...path, `placeholder`],
            `This select menu's placeholder is ${String(characters(placeholder))} characters, over Discord's limit of ${String(maxSelectPlaceholder)}, so Discord would refuse the message. The box shows one line of it anyway; shorten it to a prompt and put any explanation in a Text Display above the menu.`
          );
        }
        for (const field of [`minValues`, `maxValues`] as const) {
          const value = node[field];
          if (
            typeof value === `number` &&
            (value < 0 || value > maxSelectValues)
          ) {
            add(
              `select-values-range`,
              `error`,
              [...path, field],
              `\`${field}\` is ${String(value)}, outside the 0 to ${String(maxSelectValues)} Discord allows for how many values a select menu takes, so Discord would refuse the message. Set it between 0 and ${String(maxSelectValues)}, or leave it out for Discord's default of ${String(defaultSelectValues)}.`
            );
          }
        }
        const defaults = list(node.defaultValues);
        const min =
          typeof node.minValues === `number`
            ? node.minValues
            : defaultSelectValues;
        const max =
          typeof node.maxValues === `number`
            ? node.maxValues
            : defaultSelectValues;
        if (
          type !== ComponentType.StringSelect &&
          defaults.length > 0 &&
          (defaults.length < min || defaults.length > max)
        ) {
          add(
            `select-default-count`,
            `error`,
            [...path, `defaultValues`],
            `This select menu has ${String(defaults.length)} default values, but Discord requires the number of defaults to be within its \`minValues\` and \`maxValues\` (${min === max ? `exactly ${String(min)}` : `${String(min)} to ${String(max)}`}${node.minValues === undefined && node.maxValues === undefined ? `, Discord's default when neither is set` : ``}), so it would refuse the message. ${defaults.length > max ? `Raise \`maxValues\` to at least ${String(defaults.length)} to let people keep them all, or remove defaults.` : `Lower \`minValues\`, or add defaults.`}`
          );
        }
      }

      if (type === ComponentType.StringSelect) {
        const options = list(node.options);
        if (options.length > maxSelectOptions) {
          add(
            `select-option-count`,
            `error`,
            [...path, `options`],
            `This string select has ${String(options.length)} options, over Discord's limit of ${String(maxSelectOptions)}, so Discord would refuse the message. Split the choices across two selects, or, for a list of members, roles or channels, use the select for that kind, which the client fills for you.`
          );
        }
        const optionLimits = [
          [`label`, maxSelectOptionLabel, `select-option-label-length`],
          [`value`, maxSelectOptionValue, `select-option-value-length`],
          [
            `description`,
            maxSelectOptionDescription,
            `select-option-description-length`
          ]
        ] as const;
        options.forEach((option: unknown, optionIndex) => {
          if (!isObject(option)) return;
          for (const [field, limit, code] of optionLimits) {
            const value = text(option[field]);
            if (value === undefined || characters(value) <= limit) continue;
            add(
              code,
              `error`,
              [...path, `options`, optionIndex, field],
              `This option's \`${field}\` is ${String(characters(value))} characters, over Discord's limit of ${String(limit)} for an option's ${field}, so Discord would refuse the message. ${field === `value` ? `The value only identifies the choice to your app; use a short key and look the rest up when the interaction arrives.` : `The open list cuts long text short anyway; shorten it, and put anything longer in a Text Display beside the menu.`}`
            );
          }
        });
      }
    }

    const openSelect = isObject(message) ? text(message.openSelect) : undefined;
    if (openSelect !== undefined) {
      const found = findOpenSelect(payload.components, openSelect);
      if (!(`select` in found)) {
        add(
          `open-select-missing`,
          `error`,
          [`messages`, index, `openSelect`],
          found.problem === `missing`
            ? `\`openSelect\` is ${JSON.stringify(openSelect)}, but no component in this message has that \`customId\`, so the preview cannot draw a select open. \`openSelect\` names the String Select to draw with its options listed; it is scene data, not part of the payload. Set it to the \`customId\` of a String Select in this message, or remove it.`
            : `\`openSelect\` names ${JSON.stringify(openSelect)}, which is not a String Select, so the preview cannot draw it open: only a String Select's options are in the payload, while the other selects list members, roles or channels the client fetches. Point \`openSelect\` at a String Select, or remove it.`
        );
      }
    }

    if (embeds.length > 0) {
      count(`embeds`, base, embeds.length, maxEmbeds);
      if (embeds.length > maxEmbeds) {
        add(
          `embed-count`,
          `error`,
          [...base, `embeds`],
          `This message has ${String(embeds.length)} embeds, over Discord's limit of ${String(maxEmbeds)}, so Discord would refuse it. Combine embeds, or send the rest in another message.`
        );
      }
      let used = 0;
      const measure = (value: unknown): void => {
        used += characters(text(value)?.trim() ?? ``);
      };
      embeds.forEach((embed: unknown, embedIndex) => {
        if (!isObject(embed)) return;
        const at: Path = [...base, `embeds`, embedIndex];
        const author = isObject(embed.author) ? embed.author : {};
        const footer = isObject(embed.footer) ? embed.footer : {};
        measure(embed.title);
        measure(embed.description);
        measure(author.name);
        measure(footer.text);
        markdown(embed.title, `embedTitle`, [...at, `title`]);
        markdown(embed.description, `embedDescription`, [...at, `description`]);
        markdown(author.name, `embedAuthor`, [...at, `author`, `name`]);
        markdown(footer.text, `embedFooter`, [...at, `footer`, `text`]);
        list(embed.fields).forEach((field: unknown, fieldIndex) => {
          if (!isObject(field)) return;
          const fieldAt: Path = [...at, `fields`, fieldIndex];
          measure(field.name);
          measure(field.value);
          markdown(field.name, `embedFieldName`, [...fieldAt, `name`]);
          markdown(field.value, `embedFieldValue`, [...fieldAt, `value`]);
        });
      });
      count(`embedCharacters`, base, used, maxEmbedCharacters);
      if (used > maxEmbedCharacters) {
        add(
          `embed-total-length`,
          `error`,
          [...base, `embeds`],
          `This message's embeds hold ${used.toLocaleString(`en-US`)} characters across their titles, descriptions, field names and values, footers and author names, over Discord's limit of ${maxEmbedCharacters.toLocaleString(`en-US`)} for all embeds together, so Discord would refuse it. Shorten the text, or move some embeds to another message.`
        );
      }
    }

    checkAttachments(payload, base);
  });

  // The views the scene asks for. They decide how it is drawn, never what is wrong with the message, so nothing above depends on them.
  const viewports = list(scene.viewports);
  viewports.forEach((viewport: unknown, index) => {
    const device = isObject(viewport) ? text(viewport.device) : undefined;
    if (device !== undefined && findDevice(device) === undefined) {
      add(
        `viewport-device-unknown`,
        `error`,
        [`viewports`, index, `device`],
        `${unknownDeviceMessage(device)} The preview cannot draw a device it does not know.`
      );
    }
  });
  if (viewports.length > 0 && scene.width !== undefined) {
    add(
      `viewport-width-ignored`,
      `warning`,
      [`width`],
      `The scene sets both \`width\` and \`viewports\`. \`viewports\` says which views to draw, so \`width\` (${String(scene.width)}) is not used. Remove \`width\`, or add it to \`viewports\` as \`{ "width": ${String(scene.width)} }\` to keep that view.`
    );
  }

  return { findings, counts };
};
