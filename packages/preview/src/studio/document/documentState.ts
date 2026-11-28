/**
 * The JSON pane and the file it edits, as a pure reducer, so the rules for who wins when a person and an agent change the same file at once can be tested without a browser.
 *
 * Text here always has line feeds only: a browser's text area turns every line break into a line feed, so comparing against a Windows file's `\r\n` would see a change on every line. The file's own line ending is kept in `disk.eol` and put back on save.
 */

/** What the person sees at one point in the history: the pane's text, and for a file with no place for them (a bare payload), the view settings Studio keeps beside it. */
export interface Snapshot {
  text: string;
  /** Opaque here: Studio's own view settings, restored by Studio when a step that changed them is undone. */
  view?: unknown;
}

/** One step of the history: a change the person made, or one that arrived from the file. */
export interface HistoryStep {
  before: Snapshot;
  after: Snapshot;
  /** `mine`: an edit made in this tab. `file`: a change that arrived from disk (an agent, an editor), or the file loaded over the person's text. */
  origin: `mine` | `file`;
  /** What it was, for the undo button, the history list and what a screen reader announces: "Edit Content", "Change on disk". */
  label: string;
  /** Edits with the same group made in quick succession are one step: the keystrokes of one field. */
  group?: string;
  at: number;
}

/** How an edit is described in the history. */
export interface StepInfo {
  label: string;
  /** Edits with the same group, each within {@link coalesceMs} of the last, are one step. */
  group?: string;
  /** The view settings before and after, for a file whose text does not hold them. */
  view?: { before: unknown; after: unknown };
}

/** How long typing in one field can pause and still be the same step. */
export const coalesceMs = 1000;

/** The most steps kept; older ones are let go. */
export const historyLimit = 200;

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
  /**
   * One history of what the pane has shown, in the order it was shown: the person's edits and the changes that arrived from the file, interleaved. Undo steps back exactly one step and redo forward one, so an undo can never skip over a change from the file to reach an older edit of the person's: to get past an agent's change, the person undoes that change, by name. Every text undo or redo restores was on screen in this tab, and it is saved on top of the version on disk the tab knows, so a change on disk it has not seen yet refuses the write and becomes a conflict, never a silent overwrite. A new change of either kind clears what was undone, so redo cannot bring back text written before a newer change from the file.
   */
  history: { done: HistoryStep[]; undone: HistoryStep[] };
  /** The snapshot an undo or redo just restored, so Studio can put back what the text does not hold (the view settings of a bare payload). */
  restored: { snapshot: Snapshot; at: number } | null;
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
  /** The person changed the pane's text, by typing in it or through a form, the tree or a setting. `step` describes it for the history. */
  | { type: `edited`; text: string; step?: StepInfo; at?: number }
  /** The person changed a setting the text has no place for (a bare payload's view settings): a step in the history with the same text. */
  | {
      type: `viewChanged`;
      step: StepInfo & { view: NonNullable<StepInfo[`view`]> };
      at: number;
    }
  | { type: `undo`; at: number }
  | { type: `redo`; at: number }
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
  last: null,
  history: { done: [], undone: [] },
  restored: null
};

/** Whether the latest step can be undone now: not while a conflict waits on the person's choice, which is about what the pane holds. */
export const canUndo = (state: DocumentState): boolean =>
  !state.conflict && state.history.done.length > 0;

export const canRedo = (state: DocumentState): boolean =>
  !state.conflict && state.history.undone.length > 0;

/** The state with a step added: merged into the last when it is the same field typed on, otherwise pushed, and what was undone dropped. */
const record = (state: DocumentState, step: HistoryStep): DocumentState => {
  const { done } = state.history;
  const top = done.at(-1);
  const merged =
    top !== undefined &&
    step.origin === `mine` &&
    top.origin === `mine` &&
    step.group !== undefined &&
    top.group === step.group &&
    step.at - top.at <= coalesceMs &&
    top.after.text === step.before.text;
  const next = merged
    ? [...done.slice(0, -1), { ...top, after: step.after, at: step.at }]
    : [...done, step];
  return {
    ...state,
    history: { done: next.slice(-historyLimit), undone: [] }
  };
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
  // Nothing unsaved in the pane: take the file's new content, as a step of the history the person can see and undo by name.
  if (state.pane === state.disk.text && !state.conflict) {
    return record(
      {
        ...state,
        disk,
        missing: false,
        pane: text,
        last: { event: `external`, at }
      },
      {
        before: { text: state.pane },
        after: { text },
        origin: `file`,
        label: `Change on disk`,
        at
      }
    );
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
    case `edited`: {
      const text = lineFeeds(action.text);
      if (text === state.pane) return state;
      const edited = { ...state, pane: text };
      // Before the first read there is nothing to step back to.
      if (state.disk === null) return edited;
      return record(edited, {
        before: { text: state.pane, view: action.step?.view?.before },
        after: { text, view: action.step?.view?.after },
        origin: `mine`,
        label: action.step?.label ?? `Edit`,
        group: action.step?.group,
        at: action.at ?? 0
      });
    }
    case `viewChanged`:
      return record(state, {
        before: { text: state.pane, view: action.step.view.before },
        after: { text: state.pane, view: action.step.view.after },
        origin: `mine`,
        label: action.step.label,
        group: action.step.group,
        at: action.at
      });
    case `undo`: {
      const step = state.history.done.at(-1);
      if (step === undefined || state.conflict) return state;
      return {
        ...state,
        pane: step.before.text,
        history: {
          done: state.history.done.slice(0, -1),
          undone: [...state.history.undone, step]
        },
        restored: { snapshot: step.before, at: action.at }
      };
    }
    case `redo`: {
      const step = state.history.undone.at(-1);
      if (step === undefined || state.conflict) return state;
      return {
        ...state,
        pane: step.after.text,
        history: {
          done: [...state.history.done, step],
          undone: state.history.undone.slice(0, -1)
        },
        restored: { snapshot: step.after, at: action.at }
      };
    }
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
      // The person's text is not thrown away: it is the step before, and undo brings it back.
      return state.disk === null
        ? state
        : record(
            { ...state, pane: state.disk.text, conflict: false },
            {
              before: { text: state.pane },
              after: { text: state.disk.text },
              origin: `file`,
              label: `Load the file over your edits`,
              at: state.last?.at ?? 0
            }
          );
    case `keepMine`:
      return { ...state, conflict: false };
  }
};
