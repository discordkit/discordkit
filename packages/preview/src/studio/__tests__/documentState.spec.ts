import { describe, expect, it } from "vite-plus/test";
import {
  diskText,
  documentReducer,
  initialDocument,
  isUnsaved,
  shownText,
  type DocumentAction,
  type DocumentState
} from "../document/documentState.js";

/**
 * A person in Studio and an agent editing the same file will, sooner or later, change it at the same moment. These specs fix who wins and what is kept: nobody's work is ever dropped without a trace. An agent's change is never overwritten by text the browser had not seen, and a person's unsaved text is never thrown away because the file changed under it.
 */

const run = (...actions: DocumentAction[]): DocumentState =>
  actions.reduce(documentReducer, initialDocument);

const received = (text: string, version: string, at = 1): DocumentAction => ({
  type: `received`,
  exists: true,
  text,
  version,
  at
});

const loaded = received(`{"a":1}`, `v1`);

describe(`the document`, () => {
  it(`loads the file into the pane`, () => {
    const state = run(loaded);
    expect(state.pane).toBe(`{"a":1}`);
    expect(isUnsaved(state)).toBe(false);
  });

  it(`takes a change from disk straight into the pane when nothing in it is unsaved`, () => {
    const state = run(loaded, received(`{"a":2}`, `v2`));
    expect(state.pane).toBe(`{"a":2}`);
    expect(state.conflict).toBe(false);
    expect(state.last?.event).toBe(`external`);
  });

  it(`keeps the person's unsaved text when the file changes under it, and shows the file instead`, () => {
    const state = run(
      loaded,
      { type: `edited`, text: `{"a":` },
      received(`{"a":2}`, `v2`)
    );
    expect(state.conflict).toBe(true);
    expect(state.pane).toBe(`{"a":`);
    expect(shownText(state)).toBe(`{"a":2}`);
  });

  it(`treats a refused write the same way: the file's newer content is shown, the person's text is kept`, () => {
    const state = run(
      loaded,
      { type: `edited`, text: `{"a":3}` },
      { type: `saveStarted`, text: `{"a":3}`, baseVersion: `v1` },
      {
        type: `saveRefused`,
        exists: true,
        text: `{"a":2}`,
        version: `v2`,
        message: `changed`,
        at: 2
      }
    );
    expect(state.conflict).toBe(true);
    expect(state.pane).toBe(`{"a":3}`);
    expect(state.disk).toMatchObject({ text: `{"a":2}`, version: `v2` });
  });

  it(`lets the person drop their text for the file's, or keep it to write over the new version`, () => {
    const conflicted = run(
      loaded,
      { type: `edited`, text: `{"a":3}` },
      received(`{"a":2}`, `v2`)
    );
    const dropped = documentReducer(conflicted, { type: `loadFile` });
    expect(dropped).toMatchObject({ pane: `{"a":2}`, conflict: false });
    const kept = documentReducer(conflicted, { type: `keepMine` });
    expect(kept).toMatchObject({ pane: `{"a":3}`, conflict: false });
    // Saving resumes from the version on disk now, so the write is not refused again.
    expect(kept.disk?.version).toBe(`v2`);
  });

  it(`does not call the echo of its own write a conflict, even when the person typed on meanwhile`, () => {
    const state = run(
      loaded,
      { type: `edited`, text: `{"a":3}` },
      { type: `saveStarted`, text: `{"a":3}`, baseVersion: `v1` },
      { type: `edited`, text: `{"a":34}` },
      received(`{"a":3}`, `v3`),
      { type: `saveAccepted`, version: `v3`, at: 3 }
    );
    expect(state.conflict).toBe(false);
    expect(state.disk).toMatchObject({ text: `{"a":3}`, version: `v3` });
    expect(state.pane).toBe(`{"a":34}`);
    expect(isUnsaved(state)).toBe(true);
  });

  it(`does not let a late write acknowledgement roll the file back past a newer change`, () => {
    const state = run(
      loaded,
      { type: `edited`, text: `{"a":3}` },
      { type: `saveStarted`, text: `{"a":3}`, baseVersion: `v1` },
      received(`{"a":3}`, `v3`),
      received(`{"a":4}`, `v4`),
      { type: `saveAccepted`, version: `v3`, at: 4 }
    );
    expect(state.disk).toMatchObject({ text: `{"a":4}`, version: `v4` });
    expect(state.pane).toBe(`{"a":4}`);
  });

  it(`notes a deleted file without losing what is in the pane`, () => {
    const state = run(
      loaded,
      { type: `edited`, text: `{"a":5}` },
      {
        type: `received`,
        exists: false,
        at: 2
      }
    );
    expect(state.missing).toBe(true);
    expect(state.pane).toBe(`{"a":5}`);
  });

  it(`compares Windows text by its lines, and writes it back with the file's own line endings`, () => {
    const state = run(received(`{\r\n  "a": 1\r\n}\r\n`, `v1`));
    expect(state.pane).toBe(`{\n  "a": 1\n}\n`);
    expect(isUnsaved(state)).toBe(false);
    expect(diskText(state.disk?.eol ?? `\n`, `{\n  "a": 2\n}\n`)).toBe(
      `{\r\n  "a": 2\r\n}\r\n`
    );
  });
});
