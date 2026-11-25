import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactElement
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { Tab, TabList, TabPanel, Tabs, type Key } from "react-aria-components";
import { codegen } from "../codegen/index.js";
import { formatPath, type Finding } from "../findings.js";
import type { AssetUrl } from "../react/SceneContext.js";
import { readScene, type InputKind } from "../scene/intake.js";
import type { Scene } from "../scene.js";
import type { Backend } from "./backend/backend.js";
import type { DocumentHandle } from "./document/useDocument.js";
import { useDocument } from "./document/useDocument.js";
import {
  readFileShape,
  toFilePath,
  toFileText,
  toFileValue,
  withViewSettings,
  type FileShape
} from "./document/fileShape.js";
import { findJsonError } from "./document/jsonError.js";
import { lintResolver, lintScene } from "./form/lintResolver.js";
import { CodePane } from "./panels/CodePane.js";
import { FindingsPanel, type ShownFinding } from "./panels/FindingsPanel.js";
import { JsonPane } from "./panels/JsonPane.js";
import type { OverallState } from "./panels/LintState.js";
import { TopBar, type SyncStatus } from "./panels/TopBar.js";
import { PreviewPane, type ViewChange } from "./preview/PreviewPane.js";
import { withOpenSelect } from "./preview/viewOptions.js";
import styles from "./Studio.module.css";

/** What the shown text reads as, once it parses: the scene and the file's shape, or why it is not a scene. */
type Read =
  | { kind: Exclude<InputKind, `unknown`>; scene: Scene; shape: FileShape }
  | { kind: InputKind; scene: undefined; findings: Finding[] };

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
      text: `Changed on disk while you were editing: see the JSON pane.`
    };
  }
  if (doc.paneError !== undefined) {
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
  const form = useForm<Scene>({
    resolver: lintResolver,
    mode: `onChange`,
    defaultValues: { messages: [] }
  });
  // The whole scene, re-rendering on every change. `compute` is what gives it the form's own type rather than a deep partial.
  const values = useWatch({
    control: form.control,
    compute: (scene: Scene) => scene
  });
  const { errors } = form.formState;

  // The last text that parsed: while the pane's text does not, the preview, findings and code keep showing this.
  const read = useMemo(() => readText(doc.shown), [doc.shown]);
  const [current, setCurrent] = useState<Read>();
  // Adjusted while rendering, as React recommends over an effect; `read` is memoised per text, so this settles at once.
  if (read !== undefined && read !== current) setCurrent(read);

  // The form takes each scene the text reads as. For a file that has no place for view settings, the ones the person chose are kept.
  useEffect(() => {
    if (current?.scene === undefined) return;
    form.reset(withViewSettings(current.scene, form.getValues(), current.kind));
    void form.trigger();
  }, [current, form]);

  const [drawProblem, setDrawProblem] = useState<string>();
  const hasScene = current?.scene !== undefined && values.messages.length > 0;

  const linted = useMemo(
    () => (hasScene ? lintScene(values) : undefined),
    [hasScene, values]
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
        ? codegen(toFileValue(values, shape)).source
        : undefined,
    [hasScene, shape, values]
  );

  const assetUrl: AssetUrl = useCallback(
    (reference) =>
      reference.startsWith(`attachment://`)
        ? backend.attachmentUrl(reference.slice(`attachment://`.length))
        : reference,
    [backend]
  );

  const sceneFile = shape?.kind === `scene`;
  const disabledReason = !sceneFile
    ? undefined
    : doc.state.conflict
      ? `Settle the conflict in the JSON pane first: these settings are written to the file.`
      : doc.paneError === undefined
        ? undefined
        : `Fix the JSON first: these settings are written to the file, which would replace the text that does not parse.`;

  const onViewChange = (change: ViewChange): void => {
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
    void form.trigger();
    if (shape?.kind === `scene`) doc.edit(toFileText(form.getValues(), shape));
  };

  const fieldError = (
    field: `locale` | `timeZone` | `now` | `width`
  ): string | undefined => errors[field]?.message;

  const staleNote = doc.state.conflict
    ? `Showing the file on disk, not your unsaved text`
    : doc.paneError === undefined
      ? undefined
      : `Showing the last JSON that parsed`;

  const wide = useMediaQuery(`(min-width: 1280px)`);
  const stacked = !useMediaQuery(`(min-width: 820px)`);
  const [tab, setTab] = useState<Key>(`json`);
  const selectedTab = wide && tab === `findings` ? `json` : tab;

  const findingsLabel = `Findings${findings.length === 0 ? `` : ` (${String(findings.length)})`}`;
  const jsonPane = (
    <JsonPane
      text={doc.state.pane}
      onChange={doc.edit}
      error={doc.paneError}
      conflict={doc.state.conflict}
      fileName={doc.file?.name ?? `The file`}
      onLoadFile={doc.loadFile}
      onKeepMine={doc.keepMine}
      isDisabled={doc.state.disk === null}
    />
  );
  const findingsPanel = (
    <FindingsPanel
      overall={overall}
      drawProblem={drawProblem}
      findings={findings}
      counts={counts}
    />
  );
  const draft = backend.kind === `draft`;
  const previewPane = (
    <PreviewPane
      scene={hasScene ? values : undefined}
      kind={current?.kind}
      assetUrl={assetUrl}
      onChange={onViewChange}
      disabledReason={disabledReason}
      fieldError={fieldError}
      onProblem={setDrawProblem}
      staleNote={staleNote}
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
          <Tabs
            className={styles.tabs}
            selectedKey={selectedTab}
            onSelectionChange={setTab}
          >
            <TabList className={styles.tabList} aria-label="Source views">
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
