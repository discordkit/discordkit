import * as v from "valibot";

/**
 * ### [Forum Layout Type](https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types)
 */
export enum ForumLayoutType {
  /** No default has been set for forum channel */
  NOT_SET = 0,
  /** Display posts as a list */
  LIST_VIEW = 1,
  /** Display posts as a collection of tiles */
  GALLERY_VIEW = 2
}

export const forumLayoutTypeSchema = v.enum_(ForumLayoutType);
