import type {
  FileSnapshot,
  RenderRequest,
  RenderStatus,
  SaveResult
} from "../../bridge/protocol.js";

/** Whether an attachment can be served: its type and size, or the bridge's reason it cannot. */
export type AttachmentStatus =
  | { served: true; type: string; bytes: number }
  | { served: false; reason: string };

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
  /** A Twemoji file name (`1f525.svg`) as a URL served from the renderer's asset cache, when this backend has one. Without it, emoji load from the CDN as written. */
  emojiUrl?: (fileName: string) => string;
  /** Asks whether the attachment the file on disk lists under `name` can be served, and why not when it cannot. Absent where nothing can read files (a draft in the browser). */
  checkAttachment?: (name: string) => Promise<AttachmentStatus>;
  /** Whether this machine can draw a PNG with the Node renderer. Absent where there is no renderer to ask (a draft in the browser). */
  renderStatus?: () => Promise<RenderStatus>;
  /** The file drawn to a PNG by the Node renderer, as `render` draws it. Rejects with the reason when it is not drawn. */
  renderPng?: (request: RenderRequest) => Promise<Blob>;
  /** Why the last save will not outlive the page, when it will not: a draft the browser refused to store. */
  storageProblem?: () => string | undefined;
}
