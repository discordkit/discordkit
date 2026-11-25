/**
 * The JSON pane and the file it edits, as a pure reducer, so the rules for who wins when a person and an agent change the same file at once can be tested without a browser.
 *
 * Text here always has line feeds only: a browser's text area turns every line break into a line feed, so comparing against a Windows file's `\r\n` would see a change on every line. The file's own line ending is kept in `disk.eol` and put back on save.
 */

/** What the person sees and how it relates to the file. */
export interface DocumentState {
  /** The file as last read or written, or null before the first read. */
  disk: { text: string; version: string; eol: `\n` | `\r\n` } | null;
  /** The file is not on disk (deleted, or between an editor's delete and write). */
  missing: boolean;
  /** The text in the JSON pane. Equal to `disk.text` when nothing is unsaved. */
  pane: string;
  /** A write in flight: the text sent, and the version it was based on. */
  saving: { text: string; baseVersion: string } | null;
  /**
   * The file changed on disk while the pane held text that was not saved. The pane keeps the person's text, saving stops, and the preview shows the file, until the person chooses to load the file or to overwrite it with their text.
   */
  conflict: boolean;
  /** The last thing that happened to the file, for the status line. */
  last:
    | { event: `loaded` | `saved` | `external`; at: number }
    | { event: `refused`; at: number; message: string }
    | { event: `failed`; at: number; message: string }
    | null;
}

export type DocumentAction =
  /** A snapshot of the file: the first read, a change event, or what a refused write found. */
  | {
      type: `received`;
      exists: boolean;
      text?: string;
      version?: string;
      at: number;
    }
  | { type: `edited`; text: string }
  | { type: `saveStarted`; text: string; baseVersion: string }
  | { type: `saveAccepted`; version: string; at: number }
  | {
      type: `saveRefused`;
      exists: boolean;
      text?: string;
      version?: string;
      message: string;
      at: number;
    }
  | { type: `saveFailed`; message: string; at: number }
  /** In a conflict: drop the pane's text and take the file's. */
  | { type: `loadFile` }
  /** In a conflict: write the pane's text over the file's new version. */
  | { type: `keepMine` };

export const initialDocument: DocumentState = {
  disk: null,
  missing: false,
  pane: ``,
  saving: null,
  conflict: false,
  last: null
};

const lineFeeds = (text: string): string => text.replace(/\r\n?/g, `\n`);

const eolOf = (text: string): `\n` | `\r\n` =>
  text.includes(`\r\n`) ? `\r\n` : `\n`;

/** The text to write to disk: the pane's, with the file's line endings. */
export const diskText = (eol: `\n` | `\r\n`, text: string): string =>
  eol === `\r\n` ? text.replace(/\n/g, `\r\n`) : text;

/** Whether the pane holds text that is not in the file. */
export const isUnsaved = (state: DocumentState): boolean =>
  state.disk !== null && state.pane !== state.disk.text;

/** The text the preview, findings and code should show: the file's during a conflict, otherwise the pane's. */
export const shownText = (state: DocumentState): string =>
  state.conflict && state.disk !== null ? state.disk.text : state.pane;

const receive = (
  state: DocumentState,
  raw: string,
  version: string,
  at: number
): DocumentState => {
  const text = lineFeeds(raw);
  const disk = { text, version, eol: eolOf(raw) };
  if (state.disk === null) {
    return {
      ...state,
      disk,
      missing: false,
      pane: text,
      last: { event: `loaded`, at }
    };
  }
  if (version === state.disk.version) return { ...state, missing: false };
  // The person already has this text: the echo of their own write, or the same edit made twice.
  if (text === state.pane || text === state.saving?.text) {
    return { ...state, disk, missing: false };
  }
  // Nothing unsaved in the pane: take the file's new content.
  if (state.pane === state.disk.text && !state.conflict) {
    return {
      ...state,
      disk,
      missing: false,
      pane: text,
      last: { event: `external`, at }
    };
  }
  return {
    ...state,
    disk,
    missing: false,
    conflict: true,
    last: { event: `external`, at }
  };
};

export const documentReducer = (
  state: DocumentState,
  action: DocumentAction
): DocumentState => {
  switch (action.type) {
    case `received`:
      if (
        !action.exists ||
        action.text === undefined ||
        action.version === undefined
      ) {
        return { ...state, missing: true };
      }
      return receive(state, action.text, action.version, action.at);
    case `edited`:
      return { ...state, pane: lineFeeds(action.text) };
    case `saveStarted`:
      return {
        ...state,
        saving: { text: action.text, baseVersion: action.baseVersion }
      };
    case `saveAccepted`: {
      const { saving, disk } = state;
      if (saving === null || disk === null) return { ...state, saving: null };
      // A newer version has arrived since this write was sent (its own echo, or another change): that one is already the file's state.
      const current = disk.version === saving.baseVersion;
      return {
        ...state,
        saving: null,
        disk: current
          ? { ...disk, text: saving.text, version: action.version }
          : disk,
        last: { event: `saved`, at: action.at }
      };
    }
    case `saveRefused`: {
      const cleared: DocumentState = { ...state, saving: null };
      if (
        !action.exists ||
        action.text === undefined ||
        action.version === undefined
      ) {
        return {
          ...cleared,
          missing: true,
          last: { event: `refused`, at: action.at, message: action.message }
        };
      }
      const received = receive(cleared, action.text, action.version, action.at);
      return {
        ...received,
        conflict: received.pane !== received.disk?.text,
        last: { event: `refused`, at: action.at, message: action.message }
      };
    }
    case `saveFailed`:
      return {
        ...state,
        saving: null,
        last: { event: `failed`, at: action.at, message: action.message }
      };
    case `loadFile`:
      return state.disk === null
        ? state
        : { ...state, pane: state.disk.text, conflict: false };
    case `keepMine`:
      return { ...state, conflict: false };
  }
};
