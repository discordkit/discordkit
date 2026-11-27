import type { ReactElement } from "react";
import { clientNames, findDevice, layouts, phoneChrome } from "../devices.js";
import { fidelitySummary, viewportFidelity } from "../parts.js";
import { Scene as SceneView, type SceneProps } from "../react/Scene.js";
import type { ResolvedViewport } from "../viewport.js";

/**
 * The frame the Node renderer draws one or more viewports in: each viewport's drawing under a caption naming its device, size and layout, side by side. The captions are this package's, styled as a developer tool and not as Discord, so nobody takes them for part of a message; and a phone drawn with the desktop layout says so in its caption, in the image itself, as does a phone whose drawing holds parts nobody has seen in its app.
 */

/** Marks the sheet, which the renderer screenshots instead of the scene when there is one. */
export const sheetAttribute = `data-discordkit-preview-sheet`;
/** Marks each viewport's panel, numbered from 0 in the order given. */
export const panelAttribute = `data-discordkit-preview-panel`;
/** Marks the line where a phone's first screen of chat ends. */
export const foldAttribute = `data-discordkit-preview-fold`;
/** Marks the caption line the renderer fills in once it knows whether the message fits on one screen. */
export const fitAttribute = `data-discordkit-preview-fit`;
/** Marks a viewport drawn as its whole screen (`frame: "screen"`): the box an overlay on a screenshot lines up with. */
export const screenAttribute = `data-discordkit-preview-screen`;

/** Space around the viewports in a side-by-side image, and between them, in CSS pixels. A sheet of one viewport has none at its sides, so a phone drawn alone at its own pixel density is exactly as wide as a screenshot from that phone. */
export const sheetPadding = 16;
export const sheetGap = 24;

/** What a viewport's drawing shows: the chat column alone (the default), or the device's whole screen, with plain placeholders for the status bar, channel header, message box and home indicator around the chat, so the image is the size of a screenshot and lines up with one. */
export type Frame = `chat` | `screen`;

/** The heights of a phone's or tablet's screen from top to bottom, in whole CSS pixels, or null for a desktop window or a free width, which have no screen to frame. */
export const screenBands = (
  viewport: ResolvedViewport
): {
  statusBar: number;
  header: number;
  chat: number;
  composer: number;
  homeIndicator: number;
} | null => {
  const device =
    viewport.device === null ? undefined : findDevice(viewport.device);
  if (
    device?.safeArea === undefined ||
    viewport.visibleChat === null ||
    viewport.screen === null
  ) {
    return null;
  }
  return {
    statusBar: device.safeArea.top,
    header: phoneChrome.header,
    chat: viewport.visibleChat.height,
    composer: phoneChrome.composer,
    homeIndicator: phoneChrome.composerGap + device.safeArea.bottom
  };
};

/** The sheet's own styles. Fixed colours and the bundled Noto Sans, so the frame is the same on every machine and in every Discord theme. Each panel's width, where its fold line sits and the heights of a framed screen's bands are rules here too, keyed by the panel's number. */
export const sheetCss = (
  viewports: readonly ResolvedViewport[],
  frame: Frame = `chat`
): string =>
  `${viewports
    .map((viewport, index) => {
      const panel = `[${panelAttribute}="${String(index)}"]`;
      const bands = frame === `screen` ? screenBands(viewport) : null;
      return `${panel}{width:${String(viewport.chatWidth)}px}${
        viewport.visibleChat === null
          ? ``
          : `${panel} [${foldAttribute}]{top:${String(viewport.visibleChat.height)}px}`
      }${
        bands === null
          ? ``
          : Object.entries(bands)
              .map(
                ([band, height]) =>
                  `${panel} .dkp-${band}{height:${String(height)}px}`
              )
              .join(``)
      }`;
    })
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
[${panelAttribute}] .dkp-checked{margin-top:6px;padding:6px 8px;border-left:3px solid #15803d;background:#dcfce7;color:#14532d}
[${panelAttribute}] .dkp-limit{margin-top:4px;color:#3f3f46}
[${panelAttribute}] .dkp-fit{margin-top:4px;color:#3f3f46}
[${panelAttribute}] .dkp-drawing{position:relative;align-self:start;overflow:hidden}
[${foldAttribute}]{position:absolute;left:0;right:0;height:0;border-top:2px dashed #f59e0b;pointer-events:none}
[${foldAttribute}] span{position:absolute;right:4px;bottom:2px;padding:1px 5px;border-radius:3px;background:#f59e0b;color:#18181b;font:600 11px/14px "Noto Sans",sans-serif}
[${screenAttribute}]{display:flex;flex-direction:column}
[${screenAttribute}] .dkp-band{box-sizing:border-box;display:flex;flex:none;align-items:center;justify-content:center;background:#3f3f46;color:#a1a1aa;font:600 11px/14px "Noto Sans",sans-serif;letter-spacing:.04em;text-transform:uppercase}
[${screenAttribute}] .dkp-band+.dkp-band,[${screenAttribute}] .dkp-chat+.dkp-band{border-top:1px solid #52525b}
[${screenAttribute}] .dkp-chat{display:flex;flex:none;flex-direction:column;justify-content:flex-end;overflow:hidden;background:#71717a}
[${screenAttribute}] .dkp-chat>[data-discordkit-preview-scene]{flex:1 0 auto;justify-content:flex-end}
`;

const Caption = ({
  viewport,
  scene
}: {
  viewport: ResolvedViewport;
  scene: SceneProps;
}): ReactElement => {
  const screen =
    viewport.screen === null
      ? ``
      : `${String(viewport.screen.width)} × ${String(viewport.screen.height)} · ${String(viewport.pixelRatio)}x · `;
  const members =
    viewport.memberList === null
      ? ``
      : ` · member list ${viewport.memberList ? `open` : `closed`}`;
  const fidelity = viewportFidelity(scene, viewport);
  const summary = fidelitySummary(fidelity, viewport);
  return (
    <header>
      <p className="dkp-title">
        {viewport.name}
        {viewport.requestedLayout === null ||
        viewport.layout === viewport.requestedLayout
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
      {summary === null || !viewport.calibrated ? null : (
        <p
          className={
            fidelity.unobserved.length === 0 ? `dkp-checked` : `dkp-warning`
          }
        >
          {summary}
        </p>
      )}
      {fidelity.limits.map((limit) => (
        <p key={limit} className="dkp-limit">
          {limit}
        </p>
      ))}
      {viewport.visibleChat === null ? null : (
        <p className="dkp-fit" {...{ [fitAttribute]: `` }}>
          {/* Filled in by the renderer once the drawing has been measured. */}
        </p>
      )}
    </header>
  );
};

/** A phone's or tablet's whole screen: placeholders at the measured heights of what surrounds the chat, and the chat between them showing the messages' last screenful, as the app does at the end of a channel. The placeholders are plain bands, never an imitation of the app. */
const Screen = ({
  viewport,
  scene
}: {
  viewport: ResolvedViewport;
  scene: SceneProps;
}): ReactElement => (
  <div {...{ [screenAttribute]: `` }}>
    {/* Each band's height is a rule in `sheetCss`, keyed by the panel. */}
    <div className="dkp-band dkp-statusBar">status bar</div>
    <div className="dkp-band dkp-header">channel header</div>
    <div className="dkp-chat">
      <SceneView
        {...scene}
        width={viewport.chatWidth}
        layout={viewport.layout}
      />
    </div>
    <div className="dkp-band dkp-composer">message box</div>
    <div className="dkp-band dkp-homeIndicator" />
  </div>
);

export interface SheetProps {
  scene: SceneProps;
  viewports: readonly ResolvedViewport[];
  /** Draw each viewport's caption. Without, a single viewport is drawn edge to edge with nothing above it. Defaults to true. */
  captions?: boolean;
  /** What each phone's or tablet's drawing shows. Defaults to the chat column. */
  frame?: Frame;
}

/** Every viewport's caption and drawing, side by side; one viewport is drawn edge to edge with its caption above it. */
export const Sheet = ({
  scene,
  viewports,
  captions = true,
  frame = `chat`
}: SheetProps): ReactElement => (
  <div
    {...{ [sheetAttribute]: `` }}
    {...(viewports.length === 1 ? { "data-single": `` } : {})}
  >
    {viewports.map((viewport, index) => {
      const framed = frame === `screen` && screenBands(viewport) !== null;
      return (
        <section
          key={`${String(index)}:${viewport.key}`}
          {...{ [panelAttribute]: String(index) }}
        >
          {captions ? <Caption viewport={viewport} scene={scene} /> : null}
          <div className="dkp-drawing">
            {framed ? (
              <Screen viewport={viewport} scene={scene} />
            ) : (
              <>
                <SceneView
                  {...scene}
                  width={viewport.chatWidth}
                  layout={viewport.layout}
                />
                {viewport.visibleChat === null ? null : (
                  <div {...{ [foldAttribute]: `` }}>
                    <span>
                      ≈ end of the first screen (
                      {String(viewport.visibleChat.height)} px of chat)
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      );
    })}
  </div>
);
