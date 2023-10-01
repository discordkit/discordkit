import { z } from "zod";

export enum ForumLayoutType {
  /** No default has been set for forum channel */
  NOT_SET = 0,
  /** Display posts as a list */
  LIST_VIEW = 1,
  /** Display posts as a collection of tiles */
  GALLERY_VIEW = 2
}

export const forumLayoutTypeSchema = z.nativeEnum(ForumLayoutType);
