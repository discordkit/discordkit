import {
  memo,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type RefObject
} from "react";
import type { InputKind } from "../../scene/intake.js";
import {
  defaultLocale,
  defaultNow,
  defaultTheme,
  defaultTimeZone,
  type Scene as SceneData,
  type Theme
} from "../../scene.js";
import type { AssetUrl } from "../../react/SceneContext.js";
import {
  defaultViewports,
  resolveViewport,
  sceneViewports,
  UnknownDeviceError,
  type ResolvedViewport,
  type SceneViewport
} from "../../viewport.js";
import { QuietButton } from "../controls/Buttons.js";
import buttons from "../controls/Buttons.module.css";
import {
  ComboField,
  SegmentedField,
  SelectField,
  ToggleField,
  TextInputField
} from "../controls/Fields.js";
import { PlusIcon } from "../controls/icons.js";
import { ConvertToScene } from "../editor/ConvertToScene.js";
import { useInspect } from "./selection.js";
import {
  localeOptions,
  nextViewport,
  noOpenSelect,
  openSelectValue,
  stringSelectOptions,
  themeOptions,
  timeZoneOptions
} from "./viewOptions.js";
import { ViewportPanel } from "./ViewportPanel.js";
import styles from "./PreviewPane.module.css";

/** A view setting the toolbar changes: a scene field, or which select is open. */
export type ViewChange =
  | { field: `theme`; value: Theme }
  | { field: `viewports`; value: SceneViewport[] }
  | { field: `locale` | `timeZone` | `now`; value: string }
  | { field: `revealSpoilers`; value: boolean }
  | { field: `openSelect`; value: string };

const kindNames: Record<Exclude<InputKind, `scene` | `unknown`>, string> = {
  message: `a message payload`,
  modal: `a modal`,
  components: `an array of components`,
  component: `one component`
};

const zones = timeZoneOptions();

/** The smallest a viewport is shown at before the row wraps instead. */
const minZoom = 0.5;

type ZoomMode = `fit` | `actual`;

const zoomOptions: ReadonlyArray<{ id: ZoomMode; label: string }> = [
  { id: `fit`, label: `Fit` },
  { id: `actual`, label: `100%` }
];

/** Room the row takes besides the drawings: the gaps between viewports and the stage's padding, in CSS pixels (`--st-space-7` and `--st-space-6`). */
const rowGap = 24;
const stagePadding = 16;
/** The narrowest a viewport's panel gets, for its controls: `13em` at Studio's 13px text (ViewportPanel.module.css). */
const minPanel = 13 * 13;

/** A viewport the person or an agent named, worked out; one that names an unknown device is shown as a free width at the default column, with the finding lint reports for it. */
const resolveShown = (viewport: SceneViewport): ResolvedViewport => {
  try {
    return resolveViewport(viewport);
  } catch (error) {
    if (!(error instanceof UnknownDeviceError)) throw error;
    return resolveViewport({ width: 600 });
  }
};

/**
 * Makes the heads of the viewports in one row (their controls, caption and notes) as tall as the tallest, so the drawings beside each other start at the same height and can be compared line by line, as the command line's sheet does. A phone's head carries a report a desktop window's does not, so without this its drawing sat lower. Rows are found by where each panel starts, so a wrapped row is levelled on its own. It is layout measured on screen, so it is written to the elements' style rather than kept as state.
 */
const useLevelHeads = (stage: RefObject<HTMLDivElement | null>): void => {
  useLayoutEffect(() => {
    const root = stage.current;
    if (root === null) return;
    const level = (): void => {
      const heads = [
        ...root.querySelectorAll<HTMLElement>(`[data-viewport-head]`)
      ];
      const rows = new Map<number, HTMLElement[]>();
      for (const head of heads) {
        const top = Math.round(head.getBoundingClientRect().top);
        rows.set(top, [...(rows.get(top) ?? []), head]);
      }
      for (const row of rows.values()) {
        const tallest = Math.max(
          ...row.map((head) =>
            head.firstElementChild instanceof HTMLElement
              ? head.firstElementChild.offsetHeight
              : 0
          )
        );
        for (const head of row) {
          const height = `${String(tallest)}px`;
          if (head.style.minHeight !== height) {
            head.style.setProperty(`min-height`, height);
          }
        }
      }
    };
    level();
    // Levelled in the next frame, not inside the observer's callback: a change of size there is reported again in the same frame, which the browser calls a loop.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(level);
    });
    observer.observe(root);
    const watched = new MutationObserver(() => {
      observer.disconnect();
      observer.observe(root);
      for (const inner of root.querySelectorAll(`[data-viewport-head] > *`)) {
        observer.observe(inner);
      }
      level();
    });
    for (const inner of root.querySelectorAll(`[data-viewport-head] > *`)) {
      observer.observe(inner);
    }
    watched.observe(root, { childList: true });
    return (): void => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      watched.disconnect();
    };
  }, [stage]);
};

export interface PreviewPaneProps {
  /** The scene to draw, or undefined when there has never been one that reads. */
  scene: SceneData | undefined;
  /** What the file holds. Only a scene file has a place for view settings. */
  kind: InputKind | undefined;
  assetUrl: AssetUrl;
  onChange: (change: ViewChange) => void;
  /** Why the controls are off, when they are. */
  disabledReason: string | undefined;
  /** Lint's message for a view setting's field, if any. */
  fieldError: (field: `locale` | `timeZone` | `now`) => string | undefined;
  /** Called with the renderer's reason when the scene cannot be drawn, and with undefined once it can. */
  onProblem: (message: string | undefined) => void;
  /** Why the scene cannot be drawn, when lint already knows: every viewport shows it instead of drawing. */
  refusal: string | undefined;
  /** Shown over the stage when the scene on screen is not the pane's text: it does not parse, or a conflict is showing the file's. */
  staleNote: string | undefined;
  /** The tree's selected node, outlined in every viewport. */
  selected: string | undefined;
  /** Called with a node's id when the person clicks what it draws, in any viewport. */
  onSelect: (id: string) => void;
  /** The file's name, for the conversion's dialog. */
  fileName: string;
  /** Rewrites a bare payload as a scene, so these settings have somewhere to be saved. */
  onConvertToScene: () => void;
}

/**
 * The preview: the scene in each of its viewports side by side, with the settings they share (theme, language, clock) above them. Each viewport has its own device. When they do not fit side by side they are scaled down together, to no less than half size, so they stay comparable; past that they wrap onto another line. The zoom is shown on each viewport and beside the zoom control, which can also set them to their actual size.
 */
export const PreviewPane = memo(function PreviewPane({
  scene,
  kind,
  assetUrl,
  onChange,
  disabledReason,
  fieldError,
  onProblem,
  refusal,
  staleNote,
  selected,
  onSelect,
  fileName,
  onConvertToScene
}: PreviewPaneProps): ReactElement {
  const headingId = useId();
  const inspect = useInspect(scene);
  const disabled = disabledReason !== undefined || scene === undefined;
  const theme = scene?.theme ?? defaultTheme;
  const selects = scene === undefined ? [] : stringSelectOptions(scene);

  const viewports = useMemo(
    () => sceneViewports(scene ?? {}, defaultViewports),
    [scene]
  );
  const resolved = useMemo(() => viewports.map(resolveShown), [viewports]);
  const setViewports = useCallback(
    (value: SceneViewport[]) => onChange({ field: `viewports`, value }),
    [onChange]
  );

  // The stage's width, for scaling the row to fit it.
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage === null) return;
    const measure = (): void => setStageWidth(stage.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return (): void => observer.disconnect();
  }, []);
  useLevelHeads(stageRef);
  const [zoomMode, setZoomMode] = useState<ZoomMode>(`fit`);
  const room = stageWidth - stagePadding * 2 - rowGap * (resolved.length - 1);
  // The largest zoom, in steps of a percent, at which every panel fits in one row. A panel is never narrower than its controls, so it is not simply the room over the columns' total.
  const fitsAt = (scale: number): boolean =>
    resolved.reduce(
      (sum, viewport) => sum + Math.max(viewport.chatWidth * scale, minPanel),
      0
    ) <= room;
  let fitted = 1;
  while (fitted > minZoom && !fitsAt(fitted)) {
    fitted = Math.round((fitted - 0.01) * 100) / 100;
  }
  const zoom = zoomMode === `actual` || stageWidth === 0 ? 1 : fitted;

  return (
    <section className={styles.pane} aria-labelledby={headingId}>
      <div className={styles.toolbar}>
        <h2 id={headingId} className={styles.heading}>
          Preview
        </h2>
        <fieldset className={styles.controls}>
          <legend className={styles.visuallyHidden}>
            Preview settings, shared by every viewport
          </legend>
          <SegmentedField
            label="Discord theme"
            value={theme}
            options={themeOptions}
            onChange={(value) => onChange({ field: `theme`, value })}
            isDisabled={disabled}
          />
          <ComboField
            label="Locale"
            value={scene?.locale ?? defaultLocale}
            options={localeOptions}
            onCommit={(value) => onChange({ field: `locale`, value })}
            isDisabled={disabled}
            error={fieldError(`locale`)}
            width={11}
          />
          <ComboField
            label="Time zone"
            value={scene?.timeZone ?? defaultTimeZone}
            options={zones}
            onCommit={(value) => onChange({ field: `timeZone`, value })}
            isDisabled={disabled}
            error={fieldError(`timeZone`)}
            width={18}
          />
          <TextInputField
            label="Clock (now)"
            value={scene?.now ?? defaultNow}
            onCommit={(value) => onChange({ field: `now`, value })}
            isDisabled={disabled}
            error={fieldError(`now`)}
            width={26}
          />
          <ToggleField
            label="Reveal spoilers"
            isSelected={scene?.revealSpoilers ?? false}
            onChange={(value) => onChange({ field: `revealSpoilers`, value })}
            isDisabled={disabled}
          />
          {selects.length === 0 || scene === undefined ? null : (
            <SelectField
              label="Open select"
              value={openSelectValue(scene)}
              options={[
                { id: noOpenSelect, label: `None (all closed)` },
                ...selects
              ]}
              onChange={(value) => onChange({ field: `openSelect`, value })}
              isDisabled={disabled}
            />
          )}
          <SegmentedField<ZoomMode>
            label={`Zoom${zoom === 1 ? `` : ` (${String(Math.round(zoom * 100))}%)`}`}
            value={zoomMode}
            options={zoomOptions}
            onChange={setZoomMode}
          />
          <div className={styles.add}>
            <QuietButton
              onPress={() =>
                setViewports([...viewports, nextViewport(viewports)])
              }
              isDisabled={disabled}
            >
              <PlusIcon className={buttons.icon} />
              New viewport
            </QuietButton>
          </div>
        </fieldset>
        {disabledReason === undefined ? null : (
          <p className={styles.note}>{disabledReason}</p>
        )}
        {kind === undefined || kind === `scene` || kind === `unknown` ? null : (
          <div className={styles.convert}>
            <p className={styles.note}>
              Not written to the file: it holds {kindNames[kind]}, which has no
              place for these settings. To keep them, make it a scene,{" "}
              <code>{`{ "messages": [{ "payload": … }] }`}</code>.
            </p>
            <ConvertToScene
              fileKind={kind}
              fileName={fileName}
              onConvert={onConvertToScene}
              isDisabled={disabled}
            />
          </div>
        )}
        {staleNote === undefined ? null : (
          <p className={styles.staleNote}>{staleNote}</p>
        )}
      </div>
      <div ref={stageRef} className={styles.stage} data-testid="preview">
        {resolved.map((viewport, index) => (
          <ViewportPanel
            // oxlint-disable-next-line react/no-array-index-key -- a viewport's place in the list is its identity; the same device can be shown twice.
            key={index}
            viewport={viewports[index]}
            resolved={viewport}
            scene={scene}
            assetUrl={assetUrl}
            inspect={inspect}
            zoom={zoom}
            selected={selected}
            onSelect={onSelect}
            refusal={refusal}
            onProblem={onProblem}
            onChange={(next) =>
              setViewports(
                viewports.map((current, at) => (at === index ? next : current))
              )
            }
            onRemove={
              viewports.length === 1
                ? undefined
                : () => setViewports(viewports.filter((_, at) => at !== index))
            }
            isDisabled={disabled}
          />
        ))}
      </div>
    </section>
  );
});
