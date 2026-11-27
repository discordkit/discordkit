/**
 * What Studio's web app and the `studio` command's file bridge say to each other. Shared by both sides, so it holds types and constants only: no Node built-ins, no DOM.
 *
 * Every route lives under `/<secret>/`, the per-run secret printed in the address, and the app reaches them with relative URLs, so it never needs to know the secret itself.
 */

/** The routes under the secret prefix, relative to the page. */
export const bridgeRoutes = {
  /** `GET`: the file as {@link FileSnapshot}. `PUT`: a {@link SaveRequest}, answered with {@link SaveResult}. */
  file: `api/file`,
  /** `GET`: a stream of server-sent events, one {@link FileSnapshot} per change, starting with the current state. */
  events: `api/events`,
  /** `GET api/attachments/<name>`: the image the scene's `context.attachments[name].path` names, read-only. */
  attachments: `api/attachments/`,
  /** `GET api/emoji/<code points>.svg`: a Twemoji image, from the renderer's asset cache, fetched into it once on a miss. */
  emoji: `api/emoji/`,
  /** `GET`: whether a PNG can be rendered here, as {@link RenderStatus}. `POST` a {@link RenderRequest}: the file drawn as `render` draws it, as `image/png`. */
  render: `api/render`
} as const;

/** What `GET api/render` answers: whether this machine can draw a PNG, and why not when it cannot. */
export type RenderStatus =
  | { available: true }
  | { available: false; reason: string };

/**
 * What the app sends to draw the file as a PNG. The bridge draws the file as it is on disk, so `baseVersion` must be the version the person is looking at: a file that has changed since is refused with `409`, rather than drawing something they have not seen.
 *
 * The other fields are the `render` command's options, for a file that has no place for them (a bare payload, whose preview settings live only in Studio). A scene file's own settings are drawn as they are, and these are not sent.
 */
export interface RenderRequest {
  baseVersion: FileVersion;
  viewports?: Array<
    { device: string; memberList?: boolean } | { width: number }
  >;
  theme?: `light` | `ash` | `dark` | `onyx`;
  now?: string;
  timeZone?: string;
  locale?: string;
}

/** The `<meta name>` the bridge adds to the page it serves, so the app knows it has a file to work on. Without it (a static copy opened from anywhere else) the app works on a draft in the browser's storage. */
export const bridgeMetaName = `discordkit-preview-bridge`;

/** The name of the server-sent event carrying a {@link FileSnapshot}. */
export const fileEvent = `file`;

/** A version of the file's content: the SHA-256 of its bytes, in hex. Content-addressed, so the same bytes always have the same version, however many times the file is touched. */
export type FileVersion = string;

/** The file as the bridge last read it. */
export type FileSnapshot =
  | {
      exists: true;
      /** The file's name, for showing. */
      name: string;
      /** The file's absolute path, for showing. */
      path: string;
      version: FileVersion;
      text: string;
    }
  | {
      /** The file is not there: deleted, or moved away by an editor that is about to write it again. */
      exists: false;
      name: string;
      path: string;
    };

/** What the app sends to write the file. */
export interface SaveRequest {
  /** The new content, which must be JSON. */
  text: string;
  /** The version this text was based on. The write is refused when the file is no longer at this version. */
  baseVersion: FileVersion;
}

/** `200`: written. */
export interface SaveAccepted {
  saved: true;
  version: FileVersion;
}

/** `409`: the file changed since `baseVersion`, so nothing was written. `current` is what is there now. */
export interface SaveRefused {
  saved: false;
  current: FileSnapshot;
  message: string;
}

export type SaveResult = SaveAccepted | SaveRefused;

/** The body of any other refusal (400, 403, 404, 405, 413, 415, 500). */
export interface BridgeError {
  error: { message: string };
}
