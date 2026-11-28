import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { Tab, TabList, TabPanel, Tabs, type Key } from "react-aria-components";
import { codegen } from "../codegen/index.js";
import { formatPath, type Finding, type Path } from "../findings.js";
import type { AssetUrl } from "../react/SceneContext.js";
import { readScene, type InputKind } from "../scene/intake.js";
import type { Scene } from "../scene.js";
import type { Backend } from "./backend/backend.js";
import type { DocumentHandle } from "./document/useDocument.js";
import { useDocument } from "./document/useDocument.js";
import {
  readFileShape,
  toFilePath,
  toFileTextOver,
  toFileValue,
  withViewSettings,
  type FileShape
} from "./document/fileShape.js";
import { findJsonError } from "./document/jsonError.js";
import type { Marker } from "./editor/ComponentTree.js";
import type { EditResult } from "./editor/edits.js";
import { EditorContext, type Editor } from "./editor/EditorContext.js";
import { EditPanel } from "./editor/EditPanel.js";
import { isWithin, parsePathKey, pathKey } from "./editor/paths.js";
import { prune } from "./editor/prune.js";
import type { StartingPoint } from "./editor/startingPoints.js";
import { buildTree, flatten, nodeFor } from "./editor/tree.js";
import { lintResolver, lintScene } from "./form/lintResolver.js";
import { CodePane } from "./panels/CodePane.js";
import { FindingsPanel, type ShownFinding } from "./panels/FindingsPanel.js";
import { ConflictBanner, JsonPane } from "./panels/JsonPane.js";
import type { OverallState } from "./panels/LintState.js";
import { TopBar, type SyncStatus } from "./panels/TopBar.js";
import { PreviewPane, type ViewChange } from "./preview/PreviewPane.js";
import { withOpenSelect } from "./preview/viewOptions.js";
import styles from "./Studio.module.css";

/** What the shown text reads as, once it parses: the scene and the file's shape, or why it is not a scene. */
type Read =
  | { kind: Exclude<InputKind, `unknown`>; scene: Scene; shape: FileShape }
  | { kind: InputKind; scene: undefined; findings: Finding[] };

/** How an empty file is written once something is put in it: a camelCase scene, two spaces to a level. */
const emptyFileShape: FileShape = {
  kind: `scene`,
  style: `camel`,
  raw: {},
  indent: `  `,
  finalNewline: true
};

/** An empty file reads as an empty scene, so a new file opens on the starting points rather than on a JSON error. (An emptied pane does not: that is text being typed, and the preview keeps the last that parsed.) */
const emptyFile: Read = {
  kind: `scene`,
  scene: { messages: [] },
  shape: emptyFileShape
};

const readText = (text: string): Read | undefined => {
  if (findJsonError(text) !== undefined) return undefined;
  const read = readScene(text);
  if (read.scene === undefined || read.kind === `unknown`) {
    return { kind: read.kind, scene: undefined, findings: read.findings };
  }
  return {
    kind: read.kind,
    scene: read.scene,
    shape: readFileShape(text, read.kind)
  };
};

/** The same text reads as the same object, so reading it again (after the form takes it) changes nothing downstream. */
let lastRead: { text: string; read: Read | undefined } | undefined;
const readTextOnce = (text: string): Read | undefined => {
  if (lastRead?.text !== text) lastRead = { text, read: readText(text) };
  return lastRead.read;
};

const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener(`change`, onChange);
      return () => list.removeEventListener(`change`, onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );

const clock = (at: number): string =>
  new Date(at).toLocaleTimeString(undefined, {
    hour: `2-digit`,
    minute: `2-digit`,
    second: `2-digit`
  });

/** The status line: how the pane stands against the file, the most pressing thing first. */
const syncStatus = (doc: DocumentHandle, backend: Backend): SyncStatus => {
  const { state } = doc;
  const draft = backend.kind === `draft`;
  if (doc.loadError !== undefined) {
    return { tone: `problem`, text: `Could not load: ${doc.loadError}` };
  }
  if (state.disk === null) return { tone: `quiet`, text: `Loading…` };
  if (!draft && !doc.connected) {
    return {
      tone: `problem`,
      text: `Lost the studio command; reconnecting. Edits are kept here until it is back.`
    };
  }
  if (state.missing) {
    return {
      tone: `attention`,
      text: `The file is no longer on disk. Studio picks it up again if it comes back.`
    };
  }
  if (state.conflict) {
    return {
      tone: `attention`,
      text: `Changed on disk while you were editing: choose which version to keep.`
    };
  }
  if (
    doc.paneError !== undefined &&
    state.disk.text.trim() !== state.pane.trim()
  ) {
    return { tone: `attention`, text: `Not saved: the JSON does not parse.` };
  }
  if (state.saving !== null || doc.unsaved)
    return { tone: `quiet`, text: `Saving…` };
  const problem = backend.storageProblem?.();
  if (problem !== undefined) return { tone: `attention`, text: problem };
  const { last } = state;
  if (last?.event === `failed`) {
    return {
      tone: `problem`,
      text: `Could not save, retrying: ${last.message}`
    };
  }
  if (last?.event === `external`) {
    return { tone: `quiet`, text: `Updated from disk at ${clock(last.at)}` };
  }
  if (last?.event === `saved`) {
    return {
      tone: `quiet`,
      text: draft
        ? `Draft kept in this browser at ${clock(last.at)}`
        : `Saved at ${clock(last.at)}`
    };
  }
  return {
    tone: `quiet`,
    text: draft ? `Draft kept in this browser` : `In step with the file`
  };
};

const download = (text: string, name: string): void => {
  const url = URL.createObjectURL(
    new Blob([text], { type: `application/json` })
  );
  const link = document.createElement(`a`);
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** Studio itself, on whichever backend holds the document. */
export const Studio = ({ backend }: { backend: Backend }): ReactElement => {
  const doc = useDocument(backend);
  const { edit } = doc;
  const form = useForm<Scene>({
    resolver: lintResolver,
    // Lint runs when Studio asks (`relint`), a moment after typing pauses, not inside every keystroke: on a 40-component message it is the costliest thing a keystroke would do.
    mode: `onSubmit`,
    defaultValues: { messages: [] }
  });
  const relintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const relint = useCallback((): void => {
    clearTimeout(relintTimer.current);
    relintTimer.current = setTimeout(() => void form.trigger(), 60);
  }, [form]);
  useEffect(() => (): void => clearTimeout(relintTimer.current), []);
  // The whole scene as the form holds it, re-rendering on every change. `compute` is what gives it the form's own type rather than a deep partial.
  const values = useWatch({
    control: form.control,
    compute: (scene: Scene) => scene
  });
  // The tree and the selected form follow every keystroke. The preview, lint and code are drawn from a deferred copy, so typing is never held up by redrawing a large message: React draws them when it has time, and drops a stale draw when the next keystroke comes.
  const editScene = useMemo(() => prune(values), [values]);
  const deferred = useDeferredValue(values);
  const scene = useMemo(() => prune(deferred), [deferred]);

  // The text Studio last wrote from the form. The pane holding it is the form's own echo: it is not read back into the form, which already holds it (and reading it back would reset every field array under the person's caret).
  const [echo, setEcho] = useState<string>();
  const loaded = doc.state.disk !== null;
  const fileIsEmpty =
    doc.state.disk?.text.trim() === `` && doc.shown.trim() === ``;
  const read = useMemo(
    () =>
      !loaded || doc.shown === echo
        ? undefined
        : fileIsEmpty
          ? emptyFile
          : readTextOnce(doc.shown),
    [loaded, doc.shown, echo, fileIsEmpty]
  );
  const [current, setCurrent] = useState<Read>();
  // Adjusted while rendering, as React recommends over an effect; `read` is the same object for the same text, so this settles at once. The form is about to take this text, not the last one it wrote, so the echo no longer applies.
  if (read !== undefined && read !== current) {
    setCurrent(read);
    setEcho(undefined);
  }

  // The form takes each scene the text reads as. For a file that has no place for view settings, the ones the person chose are kept.
  useEffect(() => {
    if (current?.scene === undefined) return;
    form.reset(withViewSettings(current.scene, form.getValues(), current.kind));
    relint();
  }, [current, form, relint]);

  const [drawProblem, setDrawProblem] = useState<string>();
  const hasScene = current?.scene !== undefined && scene.messages.length > 0;

  // An empty scene is linted too, so it says it needs a message rather than calling itself valid.
  const linted = useMemo(
    () => (current?.scene === undefined ? undefined : lintScene(scene)),
    [current?.scene, scene]
  );
  const shape = current?.scene === undefined ? undefined : current.shape;
  const findings: ShownFinding[] = useMemo(() => {
    if (current !== undefined && current.scene === undefined) {
      return current.findings.map((finding) => ({
        ...finding,
        filePath: formatPath(finding.path)
      }));
    }
    return (linted?.findings ?? []).map((finding) => {
      const path =
        shape === undefined ? finding.path : toFilePath(finding.path, shape);
      return {
        ...finding,
        filePath: path === undefined ? undefined : formatPath(path)
      };
    });
  }, [current, linted, shape]);

  // Counts point at each message's payload; in the file's own terms that is the file itself for a bare payload.
  const counts = useMemo(
    () =>
      (linted?.counts ?? []).map((count) => ({
        ...count,
        path:
          (shape === undefined ? count.path : toFilePath(count.path, shape)) ??
          count.path
      })),
    [linted, shape]
  );

  const overall: OverallState = useMemo(() => {
    const errorCount = findings.filter(
      (finding) => finding.severity === `error`
    ).length;
    const warningCount = findings.length - errorCount;
    if (
      (current !== undefined && current.scene === undefined) ||
      drawProblem !== undefined ||
      findings.some((finding) => finding.code === `component-unsupported`)
    ) {
      return { state: `undrawable` };
    }
    if (errorCount > 0)
      return { state: `errors`, errors: errorCount, warnings: warningCount };
    if (warningCount > 0) return { state: `warnings`, warnings: warningCount };
    return { state: `valid` };
  }, [current, drawProblem, findings]);

  const source = useMemo(
    () =>
      hasScene && shape !== undefined
        ? codegen(toFileValue(scene, shape)).source
        : undefined,
    [hasScene, shape, scene]
  );

  const assetUrl: AssetUrl = useCallback(
    (reference) =>
      reference.startsWith(`attachment://`)
        ? backend.attachmentUrl(reference.slice(`attachment://`.length))
        : reference,
    [backend]
  );

  const paneProblem = doc.paneError !== undefined && !fileIsEmpty;
  const sceneFile = shape?.kind === `scene`;
  const disabledReason = !sceneFile
    ? undefined
    : doc.state.conflict
      ? `Settle the conflict first: these settings are written to the file.`
      : paneProblem
        ? `Fix the JSON first: these settings are written to the file, which would replace the text that does not parse.`
        : undefined;

  // Why the structured editor cannot write now. Each case would otherwise overwrite something the person has not chosen to lose.
  const editDisabledReason = !loaded
    ? `Loading the file…`
    : doc.state.conflict
      ? `The file changed on disk while you had unsaved edits. The forms show the file's version and are paused until you choose a version in the banner above.`
      : paneProblem
        ? `The JSON pane holds text that does not parse. Fix it there first: an edit here would replace it.`
        : current?.scene === undefined
          ? `The file is not a scene, a message or components Studio can read. Fix it in the JSON pane.`
          : undefined;

  // The latest pane text, shape and editability, for the writer, which runs from event handlers after the render that set them.
  const latest = useRef({
    pane: doc.state.pane,
    shape,
    blocked: editDisabledReason !== undefined
  });
  useLayoutEffect(() => {
    latest.current = {
      pane: doc.state.pane,
      shape,
      blocked: editDisabledReason !== undefined
    };
  });

  /** Writes the form to the file in the file's own shape, changing only the text of what changed, and only when something did. */
  const write = useCallback((): void => {
    const { pane, shape: fileShape, blocked } = latest.current;
    if (!blocked && fileShape !== undefined) {
      const text = toFileTextOver(pane, prune(form.getValues()), fileShape);
      if (text !== pane) {
        latest.current = { ...latest.current, pane: text };
        setEcho(text);
        edit(text);
      }
    }
    relint();
  }, [edit, form, relint]);

  const onViewChange = useCallback(
    (change: ViewChange): void => {
      switch (change.field) {
        case `theme`:
          form.setValue(`theme`, change.value);
          break;
        case `width`:
          form.setValue(`width`, change.value);
          break;
        case `revealSpoilers`:
          form.setValue(`revealSpoilers`, change.value);
          break;
        case `openSelect`:
          form.setValue(
            `messages`,
            withOpenSelect(form.getValues(), change.value)
          );
          break;
        case `locale`:
        case `timeZone`:
        case `now`:
          form.setValue(change.field, change.value);
          break;
      }
      // A bare payload has no place for these, so nothing changes in its text and nothing is written.
      write();
    },
    [form, write]
  );

  const { errors } = form.formState;
  const fieldError = useCallback(
    (field: `locale` | `timeZone` | `now` | `width`): string | undefined =>
      errors[field]?.message,
    [errors]
  );

  const staleNote = doc.state.conflict
    ? `Showing the file on disk, not your unsaved text`
    : paneProblem
      ? `Showing the last JSON that parsed`
      : undefined;

  // The tree and the selection.
  // Built from the deferred scene, like the preview: a keystroke changes a summary, which can wait for the preview's redraw.
  const nodes = useMemo(() => buildTree(scene), [scene]);
  const all = useMemo(() => flatten(nodes), [nodes]);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = useMemo(() => {
    if (selectedId !== undefined) {
      const found = nodeFor(nodes, parsePathKey(selectedId));
      if (found !== undefined) return found;
    }
    return nodes.at(0);
  }, [nodes, selectedId]);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const markers = useMemo(() => {
    const ids = new Set(all.map((node) => node.id));
    const result = new Map<string, Marker>();
    for (const finding of linted?.findings ?? []) {
      for (let length = 2; length <= finding.path.length; length++) {
        const id = pathKey(finding.path.slice(0, length));
        if (!ids.has(id)) continue;
        const marker = result.get(id) ?? { errors: 0, warnings: 0 };
        if (finding.severity === `error`) marker.errors++;
        else marker.warnings++;
        result.set(id, marker);
      }
    }
    return result;
  }, [all, linted]);

  const apply = useCallback(
    (change: (scene: Scene) => EditResult): string => {
      const result = change(prune(form.getValues()));
      form.setValue(`messages`, result.scene.messages);
      write();
      const id = pathKey(result.selected);
      setSelectedId(id);
      setCollapsed(
        (previous) =>
          new Set(
            [...previous]
              .map((key) => result.remap(parsePathKey(key)))
              .filter((path): path is Path => path !== undefined)
              .map(pathKey)
          )
      );
      return id;
    },
    [form, write]
  );

  const editor: Editor = useMemo(
    () => ({
      control: form.control,
      write,
      disabledReason: editDisabledReason,
      fileKind: shape?.kind ?? `scene`,
      scene: () => prune(form.getValues()),
      apply: (change) => {
        apply(change);
      }
    }),
    [form, write, editDisabledReason, shape?.kind, apply]
  );

  const onStart = useCallback(
    (point: StartingPoint): void => {
      const { pane, shape: fileShape } = latest.current;
      // Whatever else the empty scene file held (context, a theme) is kept; the starting point's messages and clock go in.
      const base = current?.scene ?? { messages: [] };
      const context = { ...base.context, ...point.scene.context };
      const next: Scene = {
        ...base,
        ...point.scene,
        ...(Object.keys(context).length === 0 ? {} : { context })
      };
      const text =
        fileShape === undefined ||
        fileShape.kind !== `scene` ||
        pane.trim() === ``
          ? `${JSON.stringify(next, null, 2)}\n`
          : toFileTextOver(pane, next, fileShape);
      setSelectedId(undefined);
      edit(text);
    },
    [current, edit]
  );

  const wide = useMediaQuery(`(min-width: 1280px)`);
  const stacked = !useMediaQuery(`(min-width: 820px)`);
  const [tab, setTab] = useState<Key>(`edit`);
  const selectedTab = wide && tab === `findings` ? `edit` : tab;

  const [focusField, setFocusField] = useState<{ path: Path; at: number }>();
  const canChoose = useCallback(
    (finding: ShownFinding): boolean =>
      finding.path[0] === `messages` &&
      nodeFor(nodes, finding.path) !== undefined,
    [nodes]
  );
  const onChooseFinding = useCallback(
    (finding: ShownFinding): void => {
      const node = nodeFor(nodes, finding.path);
      if (node === undefined) return;
      setSelectedId(node.id);
      // Folded ancestors open, so the row can be seen.
      setCollapsed(
        (previous) =>
          new Set(
            [...previous].filter((id) => !isWithin(node.path, parsePathKey(id)))
          )
      );
      setTab(`edit`);
      setFocusField({ path: finding.path, at: Date.now() });
    },
    [nodes]
  );
  const onSelectFromPreview = useCallback((id: string): void => {
    setSelectedId(id);
    setTab(`edit`);
  }, []);

  const findingsLabel = `Findings${findings.length === 0 ? `` : ` (${String(findings.length)})`}`;
  const jsonPane = (
    <JsonPane
      text={doc.state.pane}
      onChange={doc.edit}
      error={paneProblem ? doc.paneError : undefined}
      isDisabled={!loaded}
    />
  );
  const findingsPanel = (
    <FindingsPanel
      overall={overall}
      drawProblem={drawProblem}
      findings={findings}
      counts={counts}
      onChoose={onChooseFinding}
      canChoose={canChoose}
    />
  );
  const draft = backend.kind === `draft`;
  const previewPane = (
    <PreviewPane
      scene={hasScene ? scene : undefined}
      kind={current?.kind}
      assetUrl={assetUrl}
      onChange={onViewChange}
      disabledReason={disabledReason}
      fieldError={fieldError}
      onProblem={setDrawProblem}
      staleNote={staleNote}
      selected={selected?.id}
      onSelect={onSelectFromPreview}
    />
  );

  return (
    <div className={stacked ? styles.appStacked : styles.app}>
      <TopBar
        title={draft ? `Draft` : (doc.file?.name ?? `…`)}
        path={draft ? undefined : doc.file?.path}
        status={syncStatus(doc, backend)}
        overall={overall}
        {...(draft
          ? {
              onImport: (text: string) => doc.edit(text),
              onExport: () => download(doc.state.pane, `scene.json`)
            }
          : {})}
      />
      <main
        className={
          wide
            ? styles.workspaceWide
            : stacked
              ? styles.workspaceStacked
              : styles.workspace
        }
      >
        {/* In one column the preview comes first, in reading and focus order as well as on screen. */}
        {stacked ? previewPane : null}
        <aside className={styles.side} aria-label="Source">
          {doc.state.conflict ? (
            <div className={styles.banner}>
              <ConflictBanner
                fileName={doc.file?.name ?? `The file`}
                onLoadFile={doc.loadFile}
                onKeepMine={doc.keepMine}
                canKeepMine={doc.paneError === undefined}
              />
            </div>
          ) : null}
          <Tabs
            className={styles.tabs}
            selectedKey={selectedTab}
            onSelectionChange={setTab}
          >
            <TabList className={styles.tabList} aria-label="Source views">
              <Tab id="edit" className={styles.tab}>
                Edit
              </Tab>
              <Tab id="json" className={styles.tab}>
                JSON
              </Tab>
              {wide ? null : (
                <Tab id="findings" className={styles.tab}>
                  {findingsLabel}
                </Tab>
              )}
              <Tab id="code" className={styles.tab}>
                TypeScript
              </Tab>
            </TabList>
            <TabPanel id="edit" className={styles.tabPanel}>
              <EditorContext value={editor}>
                <EditPanel
                  scene={editScene}
                  nodes={nodes}
                  selected={selected}
                  onSelect={setSelectedId}
                  markers={markers}
                  collapsed={collapsed}
                  onCollapsedChange={setCollapsed}
                  apply={apply}
                  disabledReason={editDisabledReason}
                  empty={
                    loaded &&
                    current?.scene?.messages.length === 0 &&
                    values.messages.length === 0
                  }
                  onStart={onStart}
                  focusField={focusField}
                />
              </EditorContext>
            </TabPanel>
            <TabPanel id="json" className={styles.tabPanel}>
              {jsonPane}
            </TabPanel>
            {wide ? null : (
              <TabPanel id="findings" className={styles.tabPanel}>
                {findingsPanel}
              </TabPanel>
            )}
            <TabPanel id="code" className={styles.tabPanel}>
              <CodePane source={source} />
            </TabPanel>
          </Tabs>
        </aside>
        {stacked ? null : previewPane}
        {wide ? (
          <aside
            className={styles.findingsColumn}
            aria-labelledby="findings-heading"
          >
            <h2 id="findings-heading" className={styles.columnHeading}>
              Findings
            </h2>
            {findingsPanel}
          </aside>
        ) : null}
      </main>
    </div>
  );
};
