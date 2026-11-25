import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { actionRowSchema } from "../../components/types/ActionRow.js";
import { ComponentType } from "../../components/types/ComponentType.js";
import { containerSchema } from "../../components/types/Container.js";
import { fileSchema } from "../../components/types/File.js";
import { mediaGallerySchema } from "../../components/types/MediaGallery.js";
import { sectionSchema } from "../../components/types/Section.js";
import { separatorSchema } from "../../components/types/Separator.js";
import { textDisplaySchema } from "../../components/types/TextDisplay.js";

/** The most components a Components V2 message may hold, counted across the whole tree. */
const MAX_COMPONENTS = 40;

/** The most characters a message's text display components may hold between them. */
const MAX_TEXT_DISPLAY_LENGTH = 4000;

/** Just enough of a component to walk the tree: its own type, plus whatever it nests. */
interface ComponentNode {
  type: ComponentType;
  content?: unknown;
  components?: readonly ComponentNode[];
  accessory?: ComponentNode;
}

/** Every component in the tree, parents before their children. A section's accessory is a component in its own right. */
const flatten = (nodes: readonly ComponentNode[]): ComponentNode[] =>
  nodes.flatMap((node) => [
    node,
    ...flatten(node.components ?? []),
    ...(node.accessory ? flatten([node.accessory]) : [])
  ]);

const countComponents = (nodes: readonly ComponentNode[]): number =>
  flatten(nodes).length;

const textDisplayLength = (nodes: readonly ComponentNode[]): number =>
  flatten(nodes).reduce(
    (total, node) =>
      node.type === ComponentType.TextDisplay &&
      typeof node.content === `string`
        ? total + node.content.length
        : total,
    0
  );

/** The top level of a message without the `IS_COMPONENTS_V2` flag: up to five action rows. */
const v1ComponentsSchema = boundedArray(actionRowSchema, { max: 5 });

/** The components a V2 message admits at its top level, before the limits counted across the tree. */
const v2TopLevelSchema = boundedArray(
  v.union([
    actionRowSchema,
    textDisplaySchema,
    sectionSchema,
    mediaGallerySchema,
    separatorSchema,
    fileSchema,
    containerSchema
  ]),
  { max: MAX_COMPONENTS }
);

/**
 * The top level of a message with the `IS_COMPONENTS_V2` flag set.
 *
 * V2 admits the layout components as well as action rows, and raises the limit to 40 components counted across the whole tree: every component inside an action row, section or container counts, and so does a section's accessory. The text display components in the message may also hold at most 4000 characters between them.
 *
 * The cast keeps the emitted `.d.ts` to one copy of the element union; without it each `v.check` repeats the whole union in its signature.
 */
const v2ComponentsSchema = v.pipe(
  v2TopLevelSchema,
  v.check(
    (components) => countComponents(components) <= MAX_COMPONENTS,
    (issue) => {
      const count = countComponents(issue.input);
      return `Expected at most ${MAX_COMPONENTS} components in the message, received: ${count} components. Discord counts every component in the tree, including those nested in action rows, sections and containers and each section's accessory. Remove at least ${count - MAX_COMPONENTS} of them, or split the content across more than one message.`;
    }
  ),
  v.check(
    (components) => textDisplayLength(components) <= MAX_TEXT_DISPLAY_LENGTH,
    (issue) => {
      const length = textDisplayLength(issue.input);
      return `Expected at most ${MAX_TEXT_DISPLAY_LENGTH} characters across the message's text display components, received: ${length} characters. Discord limits the combined length of every text display in a message, wherever it is nested. Shorten the text by ${length - MAX_TEXT_DISPLAY_LENGTH} characters, or split it across more than one message.`;
    }
  )
) as v.GenericSchema<v.InferOutput<typeof v2TopLevelSchema>>;

/**
 * ### [Message Components](https://discord.com/developers/docs/components/reference)
 *
 * The components of a message. Action rows on their own are accepted with or
 * without the `IS_COMPONENTS_V2` message flag; the layout components require
 * it.
 */
export const messageComponentSchema = v.union([
  v1ComponentsSchema,
  v2ComponentsSchema
]);

export type MessageComponent = v.InferOutput<typeof messageComponentSchema>;
