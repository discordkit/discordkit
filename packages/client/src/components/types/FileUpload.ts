import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";

/**
 * ### [File Upload](https://discord.com/developers/docs/components/reference#file-upload)
 *
 * File Upload is an interactive component that allows users to upload files in modals. File Uploads can be configured to have a minimum and maximum number of files between 0 and 10, along with `required` for if the upload is required to submit the modal. The max file size a user can upload is based on the user's upload limit in that channel.
 *
 * File Uploads are available on modals. They must be placed inside a {@link Label}.
 *
 * > [!NOTE]
 * >
 * > `minValues` must be either omitted or at least `1` if `required` is
 * > omitted or `true`.
 */
export const fileUploadSchema = v.object({
  /** `19` for file upload */
  type: v.literal(ComponentType.FileUpload),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** ID for the file upload; 1-100 characters */
  customId: boundedString({ min: 1, max: 100 }),
  /** Minimum number of items that must be uploaded (defaults to 1); min 0, max 10 */
  minValues: v.exactOptional(boundedInteger({ min: 0, max: 10 })),
  /** Maximum number of items that can be uploaded (defaults to 1); max 10 */
  maxValues: v.exactOptional(boundedInteger({ min: 1, max: 10 })),
  /** Whether the file upload requires files to be uploaded before submitting the modal (defaults to `true`) */
  required: v.exactOptional(v.boolean())
});

export interface FileUpload extends v.InferOutput<typeof fileUploadSchema> {}
