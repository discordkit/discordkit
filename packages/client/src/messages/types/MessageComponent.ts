import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { actionRowSchema } from "../../components/types/ActionRow.js";
import { containerSchema } from "../../components/types/Container.js";
import { fileSchema } from "../../components/types/File.js";
import { mediaGallerySchema } from "../../components/types/MediaGallery.js";
import { sectionSchema } from "../../components/types/Section.js";
import { separatorSchema } from "../../components/types/Separator.js";
import { textDisplaySchema } from "../../components/types/TextDisplay.js";

/** The top level of a message without the `IS_COMPONENTS_V2` flag: up to five action rows. */
const v1ComponentsSchema = boundedArray(actionRowSchema, { max: 5 });

/**
 * The top level of a message with the `IS_COMPONENTS_V2` flag set.
 *
 * V2 admits the layout components as well as action rows, and raises the
 * limit to 40 components counted across the whole tree.
 */
const v2ComponentsSchema = boundedArray(
  v.union([
    actionRowSchema,
    textDisplaySchema,
    sectionSchema,
    mediaGallerySchema,
    separatorSchema,
    fileSchema,
    containerSchema
  ]),
  { max: 40 }
);

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
