import type { ReactElement } from "react";
import { clientNames, layouts } from "../devices.js";
import { Scene as SceneView, type SceneProps } from "../react/Scene.js";
import type { ResolvedViewport } from "../viewport.js";

/**
 * The frame the Node renderer draws one or more viewports in: each viewport's drawing under a caption naming its device, size and layout, side by side. The captions are this package's, styled as a developer tool and not as Discord, so nobody takes them for part of a message; and a phone drawn with the desktop layout says so in its caption, in the image itself.
 */

/** Marks the sheet, which the renderer screenshots instead of the scene when there is one. */
export const sheetAttribute = `data-discordkit-preview-sheet`;
/** Marks each viewport's panel, numbered from 0 in the order given. */
export const panelAttribute = `data-discordkit-preview-panel`;
/** Marks the line where a phone's first screen of chat ends. */
export const foldAttribute = `data-discordkit-preview-fold`;
/** Marks the caption line the renderer fills in once it knows whether the message fits on one screen. */
export const fitAttribute = `data-discordkit-preview-fit`;

/** Space around the viewports in a side-by-side image, and between them, in CSS pixels. A sheet of one viewport has none at its sides, so a phone drawn alone at its own pixel density is exactly as wide as a screenshot from that phone. */
export const sheetPadding = 16;
export const sheetGap = 24;

/** The sheet's own styles. Fixed colours and the bundled Noto Sans, so the frame is the same on every machine and in every Discord theme. Each panel's width and where its fold line sits are rules here too, keyed by the panel's number. */
export const sheetCss = (viewports: readonly ResolvedViewport[]): string =>
  `${viewports
    .map(
      (viewport, index) =>
        `[${panelAttribute}="${String(index)}"]{width:${String(viewport.chatWidth)}px}${
          viewport.visibleChat === null
            ? ``
            : `[${panelAttribute}="${String(index)}"] [${foldAttribute}]{top:${String(viewport.visibleChat.height)}px}`
        }`
    )
    .join(`\n`)}
[${sheetAttribute}]{display:grid;grid-auto-flow:column;grid-template-rows:auto auto;column-gap:${String(sheetGap)}px;width:max-content;padding:${String(sheetPadding)}px;background:#d4d4d8;font-family:"Noto Sans",sans-serif;color:#18181b}
[${sheetAttribute}][data-single]{padding:0}
[${panelAttribute}]{display:grid;grid-row:span 2;grid-template-rows:subgrid;row-gap:0}
[${panelAttribute}] header{align-self:end}
[${panelAttribute}] header{box-sizing:border-box;margin:0;padding:8px 10px;background:#f4f4f5;border-bottom:1px solid #a1a1aa;font-size:12px;line-height:16px}
[${panelAttribute}] header p{margin:0}
[${panelAttribute}] .dkp-title{font-size:13px;font-weight:700}
[${panelAttribute}] .dkp-meta{color:#52525b;font-size:11px;font-variant-numeric:tabular-nums}
[${panelAttribute}] .dkp-warning{margin-top:6px;padding:6px 8px;border-left:3px solid #b45309;background:#fef3c7;color:#78350f}
[${panelAttribute}] .dkp-fit{margin-top:4px;color:#3f3f46}
[${panelAttribute}] .dkp-drawing{position:relative;align-self:start;overflow:hidden}
[${foldAttribute}]{position:absolute;left:0;right:0;height:0;border-top:2px dashed #f59e0b;pointer-events:none}
[${foldAttribute}] span{position:absolute;right:4px;bottom:2px;padding:1px 5px;border-radius:3px;background:#f59e0b;color:#18181b;font:600 11px/14px "Noto Sans",sans-serif}
`;

const Caption = ({
  viewport
}: {
  viewport: ResolvedViewport;
}): ReactElement => {
  const screen =
    viewport.screen === null
      ? ``
      : `${String(viewport.screen.width)} × ${String(viewport.screen.height)} · ${String(viewport.pixelRatio)}x · `;
  const members =
    viewport.memberList === null
      ? ``
      : ` · member list ${viewport.memberList ? `open` : `closed`}`;
  return (
    <header>
      <p className="dkp-title">
        {viewport.name}
        {viewport.calibrated
          ? ``
          : ` · web layout, not ${viewport.platform === null ? `the app` : clientNames[viewport.platform]}`}
      </p>
      <p className="dkp-meta">
        {screen}
        {String(viewport.chatWidth)} px chat column{members} ·{" "}
        {layouts[viewport.layout].name}
      </p>
      {viewport.note === null ? null : (
        <p className="dkp-warning">{viewport.note}</p>
      )}
      {viewport.visibleChat === null ? null : (
        <p className="dkp-fit" {...{ [fitAttribute]: `` }}>
          {/* Filled in by the renderer once the drawing has been measured. */}
        </p>
      )}
    </header>
  );
};

export interface SheetProps {
  scene: SceneProps;
  viewports: readonly ResolvedViewport[];
}

/** Every viewport's caption and drawing, side by side; one viewport is drawn edge to edge with its caption above it. */
export const Sheet = ({ scene, viewports }: SheetProps): ReactElement => (
  <div
    {...{ [sheetAttribute]: `` }}
    {...(viewports.length === 1 ? { "data-single": `` } : {})}
  >
    {viewports.map((viewport, index) => (
      <section
        key={`${String(index)}:${viewport.key}`}
        {...{ [panelAttribute]: String(index) }}
      >
        <Caption viewport={viewport} />
        <div className="dkp-drawing">
          <SceneView
            {...scene}
            width={viewport.chatWidth}
            layout={viewport.layout}
          />
          {viewport.visibleChat === null ? null : (
            <div {...{ [foldAttribute]: `` }}>
              <span>
                ≈ end of the first screen ({String(viewport.visibleChat.height)}{" "}
                px of chat)
              </span>
            </div>
          )}
        </div>
      </section>
    ))}
  </div>
);
