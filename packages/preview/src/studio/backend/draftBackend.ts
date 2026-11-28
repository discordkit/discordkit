import type { Backend } from "./backend.js";

/** The draft's key in the browser's storage. The page's origin includes its port, which is why the `studio` command prefers a fixed one. */
export const draftKey = `@discordkit/preview:studio:draft`;

/** What a new draft starts as: a small Components V2 card, so the preview shows something worth changing. */
export const starterDraft = `${JSON.stringify(
  {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: 5793266,
        components: [
          {
            type: 10,
            content: `## A draft message\nEdit the JSON to change it.`
          },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 10,
            content: `-# Kept in this browser. Export it to keep it anywhere else.`
          }
        ]
      },
      {
        type: 1,
        components: [
          { type: 2, style: 1, label: `Primary`, custom_id: `draft:primary` },
          {
            type: 2,
            style: 2,
            label: `Secondary`,
            custom_id: `draft:secondary`
          }
        ]
      }
    ]
  },
  null,
  2
)}\n`;

/** A content version for a draft, as the bridge uses a hash of the file: the same text is always the same version. FNV-1a is enough here, since nothing else writes the draft. */
const versionOf = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, `0`);
};

/** Reads the stored draft, or undefined when there is none or storage cannot be used (a private window, blocked site data). */
const readStored = (storage: () => Storage): string | undefined => {
  try {
    return storage().getItem(draftKey) ?? undefined;
  } catch {
    return undefined;
  }
};

/**
 * A draft kept in the browser's storage, for Studio opened without a file: with no arguments, or as a static copy served from anywhere else. Storage can be unavailable or full; then the draft lives only as long as the page, and `save` rejects with a message saying so, which the status line shows.
 */
export const draftBackend = (
  storage: () => Storage = () => window.localStorage
): Backend => {
  let text = readStored(storage) ?? starterDraft;
  let unstored: string | undefined;
  const snapshot = (): {
    exists: true;
    name: string;
    path: string;
    version: string;
    text: string;
  } => ({
    exists: true,
    name: `Draft`,
    path: ``,
    version: versionOf(text),
    text
  });
  return {
    kind: `draft`,
    load: async () => {
      await Promise.resolve();
      return snapshot();
    },
    save: async (next, baseVersion) => {
      // Storage is synchronous; this keeps the contract the bridge has, where a save resolves later.
      await Promise.resolve();
      if (baseVersion !== versionOf(text)) {
        return {
          saved: false,
          current: snapshot(),
          message: `The draft changed since this edit was made.`
        };
      }
      // The page keeps the text either way; storage only decides whether it outlives the page.
      text = next;
      try {
        storage().setItem(draftKey, next);
        unstored = undefined;
      } catch (error) {
        unstored = `This browser would not store the draft (${error instanceof Error ? error.message : String(error)}), so it will be lost when the page closes. Export it to a file to keep it, or allow this site to store data.`;
      }
      return { saved: true, version: versionOf(next) };
    },
    subscribe: () => () => undefined,
    attachmentUrl: () => null,
    storageProblem: () => unstored
  };
};
