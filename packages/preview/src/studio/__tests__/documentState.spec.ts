import { describe, expect, it } from "vite-plus/test";
import {
  diskText,
  documentReducer,
  initialDocument,
  isUnsaved,
  shownText,
  canRedo,
  canUndo,
  coalesceMs,
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

  it(`keeps the person's unsaved text when they load the file in a conflict, as the step undo brings back`, () => {
    const conflicted = run(
      loaded,
      { type: `edited`, text: `{"a":3}` },
      received(`{"a":2}`, `v2`)
    );
    const dropped = documentReducer(conflicted, { type: `loadFile` });
    const back = documentReducer(dropped, { type: `undo`, at: 9 });
    expect(back.pane).toBe(`{"a":3}`);
    // Undone, it is unsaved text over the version on disk the tab now knows, so saving it is a choice the person sees made.
    expect(isUnsaved(back)).toBe(true);
    expect(back.disk?.version).toBe(`v2`);
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

/**
 * Undo and redo cover the person's own edits and the changes that arrive from the file, in one history. The rule these specs hold it to: undo steps back exactly one step, whatever made it, so it can never reach past an agent's change to an older edit without first undoing that change by name; everything it restores was on screen in this tab; and it is saved on top of the version the tab knows, so a change on disk it has not seen refuses the write.
 */
describe(`the history`, () => {
  const type = (
    text: string,
    at: number,
    group = `content`
  ): DocumentAction => ({
    type: `edited`,
    text,
    step: { label: `Edit Content`, group },
    at
  });
  const labels = (state: DocumentState): string[] =>
    state.history.done.map((step) => `${step.origin}:${step.label}`);

  it(`makes one step of a burst of typing in one field, and a new one after a pause or in another field`, () => {
    const state = run(
      loaded,
      type(`{"a":1,"b":"x"}`, 100),
      type(`{"a":1,"b":"xy"}`, 400),
      type(`{"a":1,"b":"xyz"}`, 400 + coalesceMs - 1),
      type(`{"a":1,"b":"xyz!"}`, 400 + coalesceMs * 3),
      type(`{"a":2,"b":"xyz!"}`, 400 + coalesceMs * 3 + 10, `other`)
    );
    expect(state.history.done.map((step) => step.after.text)).toEqual([
      `{"a":1,"b":"xyz"}`,
      `{"a":1,"b":"xyz!"}`,
      `{"a":2,"b":"xyz!"}`
    ]);
    // The first step starts at the text before the burst.
    expect(state.history.done[0].before.text).toBe(`{"a":1}`);
  });

  it(`undoes and redoes one step at a time, and a new edit drops what was undone`, () => {
    const edited = run(loaded, type(`{"a":2}`, 1), type(`{"a":3}`, 5000));
    const undone = documentReducer(edited, { type: `undo`, at: 6000 });
    expect(undone.pane).toBe(`{"a":2}`);
    expect(canRedo(undone)).toBe(true);
    const redone = documentReducer(undone, { type: `redo`, at: 6001 });
    expect(redone.pane).toBe(`{"a":3}`);
    const branched = documentReducer(undone, type(`{"a":9}`, 7000, `x`));
    expect(canRedo(branched)).toBe(false);
  });

  it(`records a change from the file as its own step, so an undo after it takes back that change, by name, and never skips over it to the person's older edit`, () => {
    const state = run(
      loaded,
      type(`{"a":2}`, 1),
      { type: `saveStarted`, text: `{"a":2}`, baseVersion: `v1` },
      { type: `saveAccepted`, version: `v2`, at: 2 },
      received(`{"a":2,"agent":true}`, `v3`, 3)
    );
    expect(labels(state)).toEqual([`mine:Edit Content`, `file:Change on disk`]);
    const undone = documentReducer(state, { type: `undo`, at: 4 });
    // The agent's change is what goes, not the person's edit before it, which stays.
    expect(undone.pane).toBe(`{"a":2}`);
    expect(undone.history.undone.at(-1)?.origin).toBe(`file`);
  });

  it(`drops what was undone when the file changes, so redo cannot bring back text written before the agent's change`, () => {
    const undone = documentReducer(run(loaded, type(`{"a":2}`, 1)), {
      type: `undo`,
      at: 2
    });
    expect(canRedo(undone)).toBe(true);
    // Nothing was saved yet, so the pane matches the file; then an agent changes it.
    const afterAgent = documentReducer(
      undone,
      received(`{"a":1,"agent":1}`, `v2`, 3)
    );
    expect(afterAgent.pane).toBe(`{"a":1,"agent":1}`);
    expect(canRedo(afterAgent)).toBe(false);
  });

  it(`saves an undo on top of the version the tab knows, so an agent's change it has not yet seen refuses it and nothing is overwritten`, () => {
    const undone = documentReducer(
      run(
        loaded,
        type(`{"a":2}`, 1),
        { type: `saveStarted`, text: `{"a":2}`, baseVersion: `v1` },
        { type: `saveAccepted`, version: `v2`, at: 2 }
      ),
      { type: `undo`, at: 3 }
    );
    expect(undone.pane).toBe(`{"a":1}`);
    // The write goes with the version the tab last knew; meanwhile an agent wrote v3, which the tab has not received yet.
    expect(undone.disk?.version).toBe(`v2`);
    const actions: DocumentAction[] = [
      { type: `saveStarted`, text: `{"a":1}`, baseVersion: `v2` },
      {
        type: `saveRefused`,
        exists: true,
        text: `{"agent":3}`,
        version: `v3`,
        message: `changed`,
        at: 4
      }
    ];
    const refused = actions.reduce(documentReducer, undone);
    expect(refused.conflict).toBe(true);
    expect(refused.pane).toBe(`{"a":1}`);
    expect(shownText(refused)).toBe(`{"agent":3}`);
    // And no undo or redo while the conflict waits on the person.
    expect(canUndo(refused)).toBe(false);
    expect(documentReducer(refused, { type: `undo`, at: 5 })).toBe(refused);
  });

  it(`keeps a setting a bare payload has no place for as a step of its own, and gives its old value back on undo`, () => {
    const state = run(loaded, {
      type: `viewChanged`,
      step: {
        label: `Change the theme`,
        view: { before: { theme: `dark` }, after: { theme: `light` } }
      },
      at: 1
    });
    const undone = documentReducer(state, { type: `undo`, at: 2 });
    expect(undone.pane).toBe(state.pane);
    expect(undone.restored?.snapshot.view).toEqual({ theme: `dark` });
  });

  it(`starts empty: loading the file is not a step`, () => {
    expect(canUndo(run(loaded))).toBe(false);
  });
});
