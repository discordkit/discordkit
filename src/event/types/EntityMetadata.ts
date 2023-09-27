import { z } from "zod";

export const entityMetadataSchema = z.object({
  /** location of the event (1-100 characters) */
  location: z.string().min(1).max(100).nullable()
});

export type EntityMetadata = z.infer<typeof entityMetadataSchema>;
