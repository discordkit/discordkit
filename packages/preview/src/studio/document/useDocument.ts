import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import type { FileSnapshot } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import {
  diskText,
  documentReducer,
  initialDocument,
  isUnsaved,
  shownText,
  type DocumentState,
  type StepInfo
} from "./documentState.js";
import { findJsonError, type JsonError } from "./jsonError.js";

/** How long typing has to pause before the pane is written, so a burst of keystrokes is one write. */
const saveDelay = 250;
/** How long to wait before trying a write again after one could not be sent. */
const retryDelay = 2000;

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export interface DocumentHandle {
  state: DocumentState;
  /** Where the pane's text stops being JSON, or undefined when it parses. */
  paneError: JsonError | undefined;
  /** The text the preview shows: the file's during a conflict, otherwise the pane's. */
  shown: string;
  unsaved: boolean;
  /** Whether the link to the file is up. Always true for a draft. */
  connected: boolean;
  /** Why the document could not be loaded at all, if it could not. */
  loadError: string | undefined;
  /** The file's name and path, once loaded. */
  file: { name: string; path: string } | undefined;
  /** Puts new text in the pane. `step` names it in the history; edits of one field in quick succession are one step. */
  edit: (text: string, step?: StepInfo) => void;
  /** Records a change to settings the text does not hold (a bare payload's view settings). */
  recordView: (
    step: StepInfo & { view: NonNullable<StepInfo[`view`]> }
  ) => void;
  undo: () => void;
  redo: () => void;
  loadFile: () => void;
  keepMine: () => void;
}

/**
 * The JSON pane's text and the file behind it: loads it, listens for changes from elsewhere, and writes the pane's text once it parses, based on the version it was edited from. The rules for what wins are in `documentReducer`.
 */
export const useDocument = (backend: Backend): DocumentHandle => {
  const [state, dispatch] = useReducer(documentReducer, initialDocument);
  const [connected, setConnected] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [file, setFile] = useState<{ name: string; path: string }>();

  useEffect(() => {
    let live = true;
    const receive = (snapshot: FileSnapshot): void => {
      dispatch({
        type: `received`,
        exists: snapshot.exists,
        ...(snapshot.exists
          ? { text: snapshot.text, version: snapshot.version }
          : {}),
        at: Date.now()
      });
    };
    const load = async (): Promise<void> => {
      try {
        const snapshot = await backend.load();
        if (!live) return;
        setFile({ name: snapshot.name, path: snapshot.path });
        receive(snapshot);
      } catch (error) {
        if (live) setLoadError(messageOf(error));
      }
    };
    void load();
    const stop = backend.subscribe(receive, setConnected);
    return (): void => {
      live = false;
      stop();
    };
  }, [backend]);

  const paneError = useMemo(() => findJsonError(state.pane), [state.pane]);
  const unsaved = isUnsaved(state);

  const { disk, saving, conflict, missing, pane, last } = state;
  const canSave =
    disk !== null &&
    unsaved &&
    saving === null &&
    !conflict &&
    !missing &&
    paneError === undefined;
  useEffect(() => {
    if (!canSave) return;
    const { version: baseVersion, eol } = disk;
    const save = async (): Promise<void> => {
      dispatch({ type: `saveStarted`, text: pane, baseVersion });
      try {
        const result = await backend.save(diskText(eol, pane), baseVersion);
        if (result.saved) {
          dispatch({
            type: `saveAccepted`,
            version: result.version,
            at: Date.now()
          });
          return;
        }
        dispatch({
          type: `saveRefused`,
          exists: result.current.exists,
          ...(result.current.exists
            ? { text: result.current.text, version: result.current.version }
            : {}),
          message: result.message,
          at: Date.now()
        });
      } catch (error) {
        dispatch({
          type: `saveFailed`,
          message: messageOf(error),
          at: Date.now()
        });
      }
    };
    const delay =
      last?.event === `failed`
        ? Math.max(saveDelay, retryDelay - (Date.now() - last.at))
        : saveDelay;
    const timer = setTimeout(() => void save(), delay);
    return (): void => clearTimeout(timer);
  }, [canSave, pane, disk, last, backend]);

  return {
    state,
    paneError,
    shown: shownText(state),
    unsaved,
    connected,
    loadError,
    file,
    edit: useCallback(
      (text: string, step?: StepInfo) =>
        dispatch({
          type: `edited`,
          text,
          ...(step === undefined ? {} : { step }),
          at: Date.now()
        }),
      []
    ),
    recordView: useCallback(
      (step: StepInfo & { view: NonNullable<StepInfo[`view`]> }) =>
        dispatch({ type: `viewChanged`, step, at: Date.now() }),
      []
    ),
    undo: useCallback(() => dispatch({ type: `undo`, at: Date.now() }), []),
    redo: useCallback(() => dispatch({ type: `redo`, at: Date.now() }), []),
    loadFile: useCallback(() => dispatch({ type: `loadFile` }), []),
    keepMine: useCallback(() => dispatch({ type: `keepMine` }), [])
  };
};
