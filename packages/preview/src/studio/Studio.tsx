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
import {
  formatPath,
  undrawableCodes,
  type Finding,
  type Path
} from "../findings.js";
import { twemojiBase } from "../format/emoji.js";
import type { AssetUrl } from "../react/SceneContext.js";
import { readScene, type InputKind } from "../scene/intake.js";
import type { Scene, SceneContext } from "../scene.js";
import type { Backend } from "./backend/backend.js";
import type { DocumentHandle } from "./document/useDocument.js";
import { useDocument } from "./document/useDocument.js";
import {
  readFileShape,
  toFilePath,
  toFileTextOver,
  toFileValue,
  toSceneText,
  viewFields,
  withViewSettings,
  type FileShape
} from "./document/fileShape.js";
import { findJsonError } from "./document/jsonError.js";
import type { Marker } from "./editor/ComponentTree.js";
import {
  contextUsage,
  newEntry,
  withEntry,
  type ContextKind,
  type UnknownReference
} from "./editor/contextUsage.js";
import { SurroundingsPanel } from "./editor/SurroundingsPanel.js";
import { defineLabel } from "./editor/UnknownNotes.js";
import type { StepInfo } from "./document/documentState.js";
import type { EditResult } from "./editor/edits.js";
import { EditorContext, type Editor } from "./editor/EditorContext.js";
import { EditPanel } from "./editor/EditPanel.js";
import { isWithin, parsePathKey, pathKey } from "./editor/paths.js";
import { prune } from "./editor/prune.js";
import type { StartingPoint } from "./editor/startingPoints.js";
import { buildTree, flatten, nodeFor } from "./editor/tree.js";
import { lintResolver, lintScene } from "./form/lintResolver.js";
import { CodePane } from "./panels/CodePane.js";
import {
  FindingsPanel,
  type ShownCount,
  type ShownFinding
} from "./panels/FindingsPanel.js";
import { ConflictBanner, JsonPane } from "./panels/JsonPane.js";
import type { OverallState } from "./panels/LintState.js";
import type { RenderRequest } from "../bridge/protocol.js";
import { defaultViewports, sceneViewports } from "../viewport.js";
import { useFocusRescue } from "./focusRescue.js";
import { Export } from "./panels/Export.js";
import { History } from "./panels/History.js";
import { TopBar, type SyncStatus } from "./panels/TopBar.js";
import { PreviewPane, type ViewChange } from "./preview/PreviewPane.js";
import {
  noOpenSelect,
  openSelectValue,
  withOpenSelect
} from "./preview/viewOptions.js";
import styles from "./Studio.module.css";

/** What the shown text reads as, once it parses: the scene and the file's shape, or why it is not a scene. */
type Read =
  | { kind: Exclude<InputKind, `unknown`>; scene: Scene; shape: FileShape }
  | { kind: InputKind; scene: undefined; findings: Finding[] };

/** A bare payload's view settings, as the history keeps them: the scene's view fields and which select is drawn open. */
type View = Partial<Pick<Scene, (typeof viewFields)[number]>> & {
  openSelect?: string;
};

const viewOf = (scene: Scene): View => {
  const view: View = {};
  for (const field of viewFields) {
    if (scene[field] !== undefined)
      Object.assign(view, { [field]: scene[field] });
  }
  const open = openSelectValue(scene);
  return open === noOpenSelect ? view : { ...view, openSelect: open };
};

/** A view snapshot as {@link viewOf} made it, which the history hands back without knowing its shape. */
const isView = (value: unknown): value is View =>
  typeof value === `object` && value !== null;

const viewLabels: Record<ViewChange[`field`], string> = {
  theme: `Change the theme`,
  viewports: `Change the viewports`,
  revealSpoilers: `Reveal spoilers`,
  openSelect: `Open a select`,
  locale: `Change the locale`,
  timeZone: `Change the time zone`,
  now: `Change the clock`
};

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
const syncStatus = (
  doc: DocumentHandle,
  backend: Backend,
  notice: SyncStatus | undefined
): SyncStatus => {
  const { state } = doc;
  const draft = backend.kind === `draft`;
  if (doc.loadError !== undefined) {
    return { tone: `problem`, text: `Could not load: ${doc.loadError}` };
  }
  // What an undo or redo just did, or what the next undo would take back, outranks "Saving…" for a moment.
  if (notice !== undefined && !state.conflict) return notice;
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

  const appRef = useRef<HTMLDivElement>(null);
  useFocusRescue(appRef);

  const [drawProblem, setDrawProblem] = useState<string>();
  const hasScene = current?.scene !== undefined && scene.messages.length > 0;

  // An empty scene is linted too, so it says it needs a message rather than calling itself valid.
  const linted = useMemo(
    () => (current?.scene === undefined ? undefined : lintScene(scene)),
    [current?.scene, scene]
  );
  // Lint and the renderer read the same lists of what can be drawn, so a scene lint says the renderer refuses is not handed to it: the preview says why instead (see DrawBoundary).
  const refusal = linted?.findings.find((finding) =>
    undrawableCodes.has(finding.code)
  )?.message;
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
  const counts: ShownCount[] = useMemo(
    () =>
      (linted?.counts ?? []).map((count) => ({
        ...count,
        scenePath: count.path,
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

  // Emoji come from the bridge's copy of the renderer's asset cache when there is one, so they draw at once, offline, and as `render` draws them; otherwise from the CDN as written.
  // An attachment the scene does not list is drawn as a placeholder at once, as `render` draws it. A listed one is asked for with its path in the address, so naming another file loads it afresh rather than keeping what the browser loaded before.
  const attachments = scene.context?.attachments;
  const assetUrl: AssetUrl = useCallback(
    (reference) => {
      if (reference.startsWith(`attachment://`)) {
        const name = reference.slice(`attachment://`.length);
        const url = backend.attachmentUrl(name);
        const entry =
          attachments !== undefined && Object.hasOwn(attachments, name)
            ? attachments[name]
            : undefined;
        return url === null || entry === undefined
          ? null
          : `${url}?path=${encodeURIComponent(entry.path)}`;
      }
      return backend.emojiUrl !== undefined &&
        reference.startsWith(`${twemojiBase}/`)
        ? backend.emojiUrl(reference.slice(twemojiBase.length + 1))
        : reference;
    },
    [backend, attachments]
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
  const write = useCallback(
    (step?: StepInfo): void => {
      const { pane, shape: fileShape, blocked } = latest.current;
      if (!blocked && fileShape !== undefined) {
        const text = toFileTextOver(pane, prune(form.getValues()), fileShape);
        if (text !== pane) {
          latest.current = { ...latest.current, pane: text };
          setEcho(text);
          // The form has moved on from the text it last read, so that text, read again (an undo back to it, or an agent writing it), must reset the form rather than be taken for what it already holds.
          lastRead = undefined;
          edit(text, step);
        }
      }
      relint();
    },
    [edit, form, relint]
  );

  const { recordView } = doc;
  const onViewChange = useCallback(
    (change: ViewChange): void => {
      const before = viewOf(form.getValues());
      switch (change.field) {
        case `theme`:
          form.setValue(`theme`, change.value);
          break;
        case `viewports`:
          form.setValue(`viewports`, change.value);
          // The viewports say which views to draw, so a width beside them would be unused (lint says so); it is replaced by them.
          form.setValue(`width`, undefined);
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
      const label = viewLabels[change.field];
      // A bare payload has no place for these, so nothing changes in its text and nothing is written; the history keeps them instead, so undo covers them too.
      if (latest.current.shape?.kind === `scene`) {
        write({ label });
      } else {
        write();
        recordView({
          label,
          view: { before, after: viewOf(form.getValues()) }
        });
      }
    },
    [form, write, recordView]
  );

  // An undo or redo of a step that changed a bare payload's view settings puts them back, since its text does not hold them.
  const { restored } = doc.state;
  useEffect(() => {
    const view = restored?.snapshot.view;
    if (!isView(view)) return;
    for (const field of viewFields) form.setValue(field, view[field]);
    form.setValue(
      `messages`,
      withOpenSelect(form.getValues(), view.openSelect ?? noOpenSelect)
    );
  }, [restored, form]);

  const { errors } = form.formState;
  const fieldError = useCallback(
    (field: `locale` | `timeZone` | `now`): string | undefined =>
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
    (change: (scene: Scene) => EditResult, label?: string): string => {
      const result = change(prune(form.getValues()));
      form.setValue(`messages`, result.scene.messages);
      // A change made in a form (a style, a flag, an item of a list) is named after what it changed.
      write({
        label:
          label ??
          `Edit ${nodeFor(nodes, result.selected)?.name ?? `the message`}`
      });
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
    [form, write, nodes]
  );

  /** A file holding a bare payload, rewritten as a scene that holds it, with the view settings chosen here. Asked for by the person, after the dialog says what it does. */
  const convertToScene = useCallback((): void => {
    const { shape: fileShape, blocked } = latest.current;
    if (blocked || fileShape === undefined || fileShape.kind === `scene`) {
      return;
    }
    edit(toSceneText(prune(form.getValues()), fileShape), {
      label: `Make the file a scene`
    });
  }, [edit, form]);

  const [tab, setTab] = useState<Key>(`edit`);
  const [focusField, setFocusField] = useState<{ path: Path; at: number }>();

  /** Selects what is at a scene path and puts the cursor in its field: what choosing a finding, or a place an entry is used, does. */
  const goTo = useCallback(
    (path: Path): void => {
      const node = nodeFor(nodes, path);
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
      setFocusField({ path, at: Date.now() });
    },
    [nodes]
  );

  /** Where a scene path is, in words, for saying where an entry is used. */
  const placeName = useCallback(
    (path: Path): string => {
      if (path[0] === `context`) {
        const [, kind, key] = path;
        const entry =
          kind === `users` || kind === `emoji`
            ? scene.context?.[kind]?.[String(key)]
            : undefined;
        const name = entry?.name ?? String(key);
        return kind === `users`
          ? `the avatar of ${name}`
          : `the image of the emoji ${name}`;
      }
      const node = nodeFor(nodes, path);
      const message = nodeFor(nodes, path.slice(0, 2));
      if (node === undefined || message === undefined) return `the scene`;
      return node === message ? message.name : `${message.name} › ${node.name}`;
    },
    [nodes, scene.context]
  );

  /** The scene's context, changed whole and written: its entries are keyed by ids and file names that cannot be form field names. */
  const setContext = useCallback(
    (
      change: (context: SceneContext | undefined) => SceneContext | undefined,
      step: StepInfo = { label: `Edit the surroundings` }
    ): void => {
      if (latest.current.blocked) return;
      form.setValue(`context`, change(prune(form.getValues()).context));
      write(step);
    },
    [form, write]
  );

  const report = useMemo(() => contextUsage(scene), [scene]);
  const [focusEntry, setFocusEntry] = useState<{
    kind: ContextKind;
    key: string;
    at: number;
  }>();
  /** Starts the entry for something the scene uses but does not describe, and takes the person to it with the cursor in its first field. */
  const define = useCallback(
    (reference: UnknownReference): void => {
      if (latest.current.shape?.kind !== `scene`) return;
      setContext(
        (context) =>
          context?.[reference.kind]?.[reference.key] === undefined
            ? withEntry(
                context,
                reference.kind,
                reference.key,
                newEntry(reference)
              )
            : context,
        { label: defineLabel(reference) }
      );
      setTab(`context`);
      setFocusEntry({
        kind: reference.kind,
        key: reference.key,
        at: Date.now()
      });
    },
    [setContext]
  );

  const fileName =
    doc.file?.name ?? (backend.kind === `draft` ? `The draft` : `The file`);
  const editor: Editor = useMemo(
    () => ({
      control: form.control,
      write,
      disabledReason: editDisabledReason,
      fileKind: shape?.kind ?? `scene`,
      scene: () => prune(form.getValues()),
      apply: (change, label) => {
        apply(change, label);
      },
      fileName,
      convertToScene,
      report,
      setContext,
      define,
      goTo,
      placeName,
      checkAttachment: backend.checkAttachment,
      attachmentUrl: backend.attachmentUrl,
      diskVersion: doc.state.disk?.version
    }),
    [
      form,
      write,
      editDisabledReason,
      shape?.kind,
      apply,
      fileName,
      convertToScene,
      report,
      setContext,
      define,
      goTo,
      placeName,
      backend,
      doc.state.disk?.version
    ]
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
      edit(text, { label: `Start from ${point.name}` });
    },
    [current, edit]
  );

  const wide = useMediaQuery(`(min-width: 1280px)`);
  const stacked = !useMediaQuery(`(min-width: 820px)`);
  const selectedTab = wide && tab === `findings` ? `edit` : tab;

  const canChoose = useCallback(
    (finding: ShownFinding): boolean =>
      finding.path[0] === `messages` &&
      nodeFor(nodes, finding.path) !== undefined,
    [nodes]
  );
  const onChooseFinding = useCallback(
    (finding: ShownFinding): void => goTo(finding.path),
    [goTo]
  );
  const [reveal, setReveal] = useState<{ id: string; at: number }>();
  const onSelectFromPreview = useCallback((id: string): void => {
    setSelectedId(id);
    setTab(`edit`);
    setReveal({ id, at: Date.now() });
  }, []);

  // Undo and redo. Undo takes back the latest step whoever made it. From the keyboard, where nothing on screen names the step, a change that came from the file is not undone on the first press: that press says which change it is, and a second press undoes it.
  const [notice, setNotice] = useState<SyncStatus>();
  useEffect(() => {
    if (notice === undefined) return;
    const timer = setTimeout(() => setNotice(undefined), 6000);
    return (): void => clearTimeout(timer);
  }, [notice]);
  const armed = useRef<number>(undefined);
  const { history } = doc.state;
  const historyBlocked = doc.state.conflict
    ? `Settle the conflict first: undo and redo change what the pane holds.`
    : undefined;
  const undo = useCallback(
    (fromKeyboard: boolean): void => {
      const step = history.done.at(-1);
      if (step === undefined || historyBlocked !== undefined) return;
      if (fromKeyboard && step.origin === `file` && armed.current !== step.at) {
        armed.current = step.at;
        setNotice({
          tone: `attention`,
          text: `The last change came from the file (${step.label}, ${clock(step.at)}). Press Ctrl+Z again to undo it.`
        });
        return;
      }
      armed.current = undefined;
      doc.undo();
      setNotice({
        tone: `quiet`,
        text: `Undid: ${step.label}. Redo brings it back.`
      });
    },
    [history, historyBlocked, doc]
  );
  const redo = useCallback((): void => {
    const step = history.undone.at(-1);
    if (step === undefined || historyBlocked !== undefined) return;
    armed.current = undefined;
    doc.redo();
    setNotice({ tone: `quiet`, text: `Redid: ${step.label}.` });
  }, [history, historyBlocked, doc]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      const isRedo = (key === `z` && event.shiftKey) || key === `y`;
      if (key !== `z` && !isRedo) return;
      // One history for the whole app, the JSON pane and the form fields included, so the browser's own undo in a text field is not used.
      event.preventDefault();
      if (isRedo) redo();
      else undo(true);
    };
    window.addEventListener(`keydown`, onKeyDown, { capture: true });
    return (): void =>
      window.removeEventListener(`keydown`, onKeyDown, { capture: true });
  }, [undo, redo]);

  // What the PNG export draws: the file as saved, at the version on screen, for the viewports on screen. A scene file's own settings are in it; a bare payload's, and the viewports Studio shows when a file names none, are sent as the command line's options would be.
  const diskVersion = doc.state.disk?.version;
  const exportWaitingFor = doc.state.conflict
    ? `Settle the conflict first: the export draws the file as it is saved.`
    : doc.unsaved || doc.state.saving !== null
      ? `Waiting for the file to be saved: the export draws it as it is on disk.`
      : !hasScene
        ? `There is nothing to draw yet.`
        : undefined;
  const exportRequest = useMemo((): RenderRequest | undefined => {
    if (diskVersion === undefined || exportWaitingFor !== undefined) {
      return undefined;
    }
    const sceneFile = shape?.kind === `scene`;
    const viewports =
      sceneFile && (scene.viewports !== undefined || scene.width !== undefined)
        ? undefined
        : sceneViewports(scene, defaultViewports);
    return {
      baseVersion: diskVersion,
      ...(viewports === undefined ? {} : { viewports }),
      ...(sceneFile
        ? {}
        : Object.fromEntries(
            ([`theme`, `now`, `timeZone`, `locale`] as const).flatMap((field) =>
              scene[field] === undefined ? [] : [[field, scene[field]]]
            )
          ))
    };
  }, [diskVersion, exportWaitingFor, shape?.kind, scene]);

  const findingsLabel = `Findings${findings.length === 0 ? `` : ` (${String(findings.length)})`}`;
  const jsonPane = (
    <JsonPane
      text={doc.state.pane}
      onChange={(text) =>
        doc.edit(text, { label: `Edit the JSON`, group: `json` })
      }
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
      messageCount={scene.messages.length}
      unknown={report.unknown}
      fileKind={shape?.kind}
      onDefine={define}
      isDefineDisabled={editDisabledReason !== undefined}
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
      refusal={refusal}
      staleNote={staleNote}
      selected={selected?.id}
      onSelect={onSelectFromPreview}
      fileName={fileName}
      onConvertToScene={convertToScene}
    />
  );

  return (
    <div ref={appRef} className={stacked ? styles.appStacked : styles.app}>
      <TopBar
        title={draft ? `Draft` : (doc.file?.name ?? `…`)}
        path={draft ? undefined : doc.file?.path}
        status={syncStatus(doc, backend, notice)}
        overall={overall}
        {...(draft
          ? {
              onImport: (text: string, name: string) =>
                doc.edit(text, { label: `Import ${name}` }),
              onExport: () => download(doc.state.pane, `scene.json`)
            }
          : {})}
      >
        <History
          done={history.done}
          undone={history.undone}
          onUndo={() => undo(false)}
          onRedo={redo}
          disabledReason={historyBlocked}
        />
        <Export
          backend={backend}
          request={exportRequest}
          waitingFor={exportWaitingFor}
          fileName={fileName}
        />
      </TopBar>
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
              <Tab id="context" className={styles.tab}>
                Surroundings
                {report.unknown.length === 0 ? null : (
                  <>
                    <span className={styles.tabBadge} aria-hidden="true">
                      {report.unknown.length}
                    </span>
                    <span className={styles.visuallyHidden}>
                      {`(${String(report.unknown.length)} not described)`}
                    </span>
                  </>
                )}
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
                    values.messages.length === 0 &&
                    // The file read has none, or the form removed the last (its own write, not yet read back): not the moment before the form first takes the file.
                    (current?.scene?.messages.length === 0 ||
                      echo !== undefined)
                  }
                  onStart={onStart}
                  focusField={focusField}
                  reveal={reveal}
                />
              </EditorContext>
            </TabPanel>
            <TabPanel id="context" className={styles.tabPanel}>
              <EditorContext value={editor}>
                <SurroundingsPanel focusEntry={focusEntry} />
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
