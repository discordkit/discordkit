import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";

/**
 * Where Studio's document lives: a file on disk through the `studio` command's bridge, or a draft in the browser's storage. The app talks to either through this, so the editor does not care which.
 */
export interface Backend {
  /** `file` when edits reach a file on disk; `draft` when they stay in this browser. */
  kind: `file` | `draft`;
  /** The current content. */
  load: () => Promise<FileSnapshot>;
  /** Writes `text` if the document is still at `baseVersion`. Rejects only when the write could not be attempted (the server is gone, storage is blocked). */
  save: (text: string, baseVersion: string) => Promise<SaveResult>;
  /** Calls `onChange` with each change from elsewhere, and `onConnection` when the link to the file is lost or back. Returns a function that stops listening. */
  subscribe: (
    onChange: (snapshot: FileSnapshot) => void,
    onConnection: (connected: boolean) => void
  ) => () => void;
  /** Turns an `attachment://` name into a URL the page can load, or null when this backend cannot serve attachments. */
  attachmentUrl: (name: string) => string | null;
  /** Why the last save will not outlive the page, when it will not: a draft the browser refused to store. */
  storageProblem?: () => string | undefined;
}
