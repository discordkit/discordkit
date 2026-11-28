import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactElement
} from "react";
import { fidelitySummary, viewportFidelity } from "../../parts.js";
import {
  missingAttribute,
  placeholderClass,
  transparentPixel
} from "../../react/Image.js";
import { InspectContext, type Inspect } from "../../react/Inspect.js";
import type { AssetUrl } from "../../react/SceneContext.js";
import type { Scene as SceneData } from "../../scene.js";
import {
  isDeviceViewport,
  type ResolvedViewport,
  type SceneViewport
} from "../../viewport.js";
import { QuietButton } from "../controls/Buttons.js";
import buttons from "../controls/Buttons.module.css";
import { NumberInputField, ToggleField } from "../controls/Fields.js";
import { RemoveIcon } from "../controls/icons.js";
import { DeviceChooser } from "./DeviceChooser.js";
import { DrawBoundary } from "./DrawBoundary.js";
import { clickedNode, useSelectionBox } from "./selection.js";
import { chooserKey, chooseViewport } from "./viewOptions.js";
import styles from "./ViewportPanel.module.css";

export interface ViewportPanelProps {
  viewport: SceneViewport;
  resolved: ResolvedViewport;
  /** The scene to draw, or undefined when there has never been one that reads. */
  scene: SceneData | undefined;
  assetUrl: AssetUrl;
  inspect: Inspect;
  /** How much the drawing is scaled to fit beside the others, from 0.5 to 1. */
  zoom: number;
  selected: string | undefined;
  onSelect: (id: string) => void;
  /** Why the scene cannot be drawn, when lint already knows; it is then not drawn (see `DrawBoundary`). */
  refusal: string | undefined;
  onProblem: (message: string | undefined) => void;
  onChange: (viewport: SceneViewport) => void;
  /** Absent when this is the only viewport, which cannot be removed. */
  onRemove: (() => void) | undefined;
  isDisabled: boolean;
}

/**
 * One viewport of the preview: its device chooser and settings, a caption saying what is drawn (for a device drawn with a layout that is not its own, that it is not the app; for an iPhone, which parts of this scene have not been seen in the app, or that every part has), and the drawing, scaled by the pane's zoom, with the selection outline over it.
 */
export const ViewportPanel = memo(function ViewportPanel({
  viewport,
  resolved,
  scene,
  assetUrl,
  inspect,
  zoom,
  selected,
  onSelect,
  refusal,
  onProblem,
  onChange,
  onRemove,
  isDisabled
}: ViewportPanelProps): ReactElement {
  const frameRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<HTMLDivElement>(null);
  const foldRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  useSelectionBox(frameRef, drawingRef, outlineRef, selected, scene, zoom);
  const fold = resolved.visibleChat?.height;
  // The scene at this viewport's chat column. Only the top level is copied, so every message and component keeps the identity the selection map knows it by.
  const drawn = useMemo(
    () =>
      scene === undefined ? undefined : { ...scene, width: resolved.chatWidth },
    [scene, resolved.chatWidth]
  );
  // Which parts of this scene the viewport draws from rules nobody has seen on its platform. A scene that cannot be read (a timestamp that is not a date) has none to report; the drawing says why it cannot be drawn.
  const fidelity = useMemo(() => {
    if (scene === undefined) return null;
    try {
      const found = viewportFidelity(scene, resolved);
      return { ...found, summary: fidelitySummary(found, resolved) };
    } catch {
      return null;
    }
  }, [scene, resolved]);

  // The drawing is scaled with a transform, which keeps its layout exactly the renderer's but does not change the room it takes, so the box around it is sized to the scaled drawing here. The fold line shows only when the drawing reaches it.
  useLayoutEffect(() => {
    const drawing = drawingRef.current;
    const sizer = sizerRef.current;
    if (drawing === null || sizer === null) return;
    const measure = (): void => {
      const height = drawing.offsetHeight;
      sizer.style.setProperty(`height`, `${String(height * zoom)}px`);
      foldRef.current?.toggleAttribute(
        `hidden`,
        fold === undefined || height <= fold
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(drawing);
    return (): void => observer.disconnect();
  }, [zoom, fold, scene]);

  // An image that does not arrive (a file the studio command cannot serve, a URL that is gone) is drawn as the placeholder the Node renderer draws in its place, not as the browser's broken-image icon. Error events do not bubble, so they are caught on the way down.
  useEffect(() => {
    const drawing = drawingRef.current;
    if (drawing === null) return;
    const onError = (event: Event): void => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      if (image.getAttribute(`src`) === transparentPixel) return;
      image.setAttribute(missingAttribute, image.getAttribute(`src`) ?? ``);
      image.classList.add(placeholderClass);
      image.src = transparentPixel;
    };
    drawing.addEventListener(`error`, onError, true);
    return (): void => drawing.removeEventListener(`error`, onError, true);
  }, []);

  // React's style type has no entries for custom properties; these are the ones ViewportPanel.module.css reads.
  const sizes = useMemo(
    (): Record<string, string> => ({
      "--vp-width": `${String(resolved.chatWidth)}px`,
      "--vp-zoom": String(zoom),
      "--vp-fold": `${String(fold ?? 0)}px`
    }),
    [resolved.chatWidth, zoom, fold]
  );

  const screen =
    resolved.screen === null
      ? ``
      : `${String(resolved.screen.width)} × ${String(resolved.screen.height)} · ${String(resolved.pixelRatio)}x · `;
  return (
    <section
      className={styles.panel}
      style={sizes}
      aria-label={`${resolved.name} viewport`}
    >
      {/* Everything above the drawing. The pane makes the heads in one row as tall as the tallest, so drawings side by side start level (see `useLevelHeads`). */}
      <div className={styles.head} data-viewport-head>
        <div className={styles.headInner}>
          <div className={styles.controls}>
            <DeviceChooser
              value={chooserKey(viewport)}
              onChange={(key) => onChange(chooseViewport(viewport, key))}
              isDisabled={isDisabled}
            />
            {isDeviceViewport(viewport) ? null : (
              <NumberInputField
                label="Width (px)"
                value={viewport.width}
                minValue={1}
                maxValue={4096}
                width={4}
                onChange={(width) => onChange({ width })}
                isDisabled={isDisabled}
              />
            )}
            {resolved.memberList === null ? null : (
              <ToggleField
                label="Member list"
                isSelected={resolved.memberList}
                onChange={(memberList) =>
                  onChange(
                    isDeviceViewport(viewport)
                      ? { device: viewport.device, memberList }
                      : viewport
                  )
                }
                isDisabled={isDisabled}
              />
            )}
            {onRemove === undefined ? null : (
              <div className={styles.remove}>
                <QuietButton
                  aria-label={`Remove the ${resolved.name} viewport`}
                  onPress={onRemove}
                  isDisabled={isDisabled}
                >
                  <RemoveIcon className={buttons.icon} />
                </QuietButton>
              </div>
            )}
          </div>
          <p className={styles.caption}>
            {screen}
            {String(resolved.chatWidth)} px chat
            {resolved.memberList === null
              ? ``
              : ` · member list ${resolved.memberList ? `open` : `closed`}`}
            {zoom === 1 ? `` : ` · shown at ${String(Math.round(zoom * 100))}%`}
          </p>
          {resolved.note === null ? null : (
            <p className={styles.note}>
              <strong>
                {resolved.layout === resolved.requestedLayout
                  ? `Not measured on this device.`
                  : `Web layout, not the app.`}
              </strong>{" "}
              {resolved.note}
            </p>
          )}
          {fidelity === null ||
          fidelity.summary === null ||
          !resolved.calibrated ? null : (
            <p
              className={
                fidelity.unobserved.length === 0 ? styles.checked : styles.note
              }
              data-testid="viewport-fidelity"
            >
              {fidelity.summary}
            </p>
          )}
          {fidelity?.limits.map((limit) => (
            <p key={limit} className={styles.limit}>
              {limit}
            </p>
          ))}
        </div>
      </div>
      <div ref={frameRef} className={styles.frame}>
        <div ref={sizerRef} className={styles.sizer}>
          <div className={styles.scaled}>
            {/* `all: initial` stops Studio's inherited text styles reaching the preview, so it is drawn as the Node renderer draws it. */}
            {/* A click selects what was clicked, in the tree and the form. The tree is the keyboard's way to the same thing, so this is a pointer convenience and needs no role of its own. */}
            {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the tree is the keyboard route to the same selection. */}
            <div
              ref={drawingRef}
              className={styles.isolate}
              data-testid="preview-viewport"
              data-device={resolved.device ?? `responsive`}
              onClick={(event) => {
                const id = clickedNode(event.target);
                if (id !== undefined) onSelect(id);
              }}
            >
              {drawn === undefined ? (
                <p className={styles.empty}>Nothing to draw yet.</p>
              ) : (
                <InspectContext value={inspect}>
                  <DrawBoundary
                    scene={drawn}
                    layout={resolved.layout}
                    assetUrl={assetUrl}
                    refusal={refusal}
                    onProblem={onProblem}
                  />
                </InspectContext>
              )}
            </div>
            {fold === undefined ? null : (
              <div
                ref={foldRef}
                className={styles.fold}
                aria-hidden="true"
                hidden
              >
                <span>≈ end of the first screen (approximate)</span>
              </div>
            )}
          </div>
        </div>
        <div
          ref={outlineRef}
          className={styles.selection}
          data-testid="selection-outline"
          aria-hidden="true"
          hidden
        />
      </div>
    </section>
  );
});
