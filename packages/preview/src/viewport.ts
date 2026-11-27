import {
  clientNames,
  desktopChrome,
  devices,
  drawnLayout,
  findDevice,
  isCalibrated,
  layouts,
  phoneChrome,
  type Device,
  type LayoutId,
  type Platform,
  type RequestedLayout
} from "./devices.js";
import { defaultWidth } from "./scene.js";

/**
 * One view of a scene: a device from the registry, or a free width with no device ("responsive", as in a browser's device toolbar). A desktop device can say whether Discord's member list is open, which takes 264 pixels from the chat.
 */
export type SceneViewport =
  | { device: string; memberList?: boolean }
  | { width: number };

/** A viewport with everything the renderer, a caption and a JSON report need, worked out once. Plain data, so it prints as JSON as it is. */
export interface ResolvedViewport {
  /** Stable and safe in a file name: the device id, or `responsive-600`. */
  key: string;
  /** The device's id, or null for a free width. */
  device: string | null;
  /** "iPhone 14 Pro", or "Responsive". */
  name: string;
  platform: Platform | null;
  /** The device's screen or window in CSS pixels, or null for a free width. */
  screen: { width: number; height: number } | null;
  /** The device's own pixels per CSS pixel; 1 for a free width. */
  pixelRatio: number;
  /** For a desktop window: whether the member list is open beside the chat. Null otherwise. */
  memberList: boolean | null;
  /** The layout it is drawn with. */
  layout: LayoutId;
  /** The layout the device's own client uses, or null for a free width. */
  requestedLayout: RequestedLayout | null;
  /** Whether the layout drawn has been checked against the real client on this device's platform. A free width asks for the web layout at that width, which is what it gets, so it counts as calibrated. */
  calibrated: boolean;
  /** Width of the chat column the messages are drawn in, in CSS pixels. */
  chatWidth: number;
  /** For a phone or tablet: roughly how tall the chat is on its screen, from the top of the chat to the message box, so a drawing can show whether a message fits on one screen. Always approximate; `basis` says how it was worked out. */
  visibleChat: { height: number; approximate: true; basis: string } | null;
  /** One line naming the view: "iPhone 14 Pro · 393 × 852 · 3x". */
  label: string;
  /** What the drawing is, in plain words, when it is not what the device shows: null when it is. */
  note: string | null;
}

/** What Studio shows when a scene names no viewports: a desktop window and the iPhone 14 Pro, side by side. */
export const defaultViewports: readonly SceneViewport[] = [
  { device: `desktop-1280x800` },
  { device: `iphone-14-pro` }
];

/** Whether a viewport names a device rather than a free width. */
export const isDeviceViewport = (
  viewport: SceneViewport
): viewport is { device: string; memberList?: boolean } => `device` in viewport;

/** The width of Discord's chat column in a desktop window: the window less the server rail, the channel list, the member list when it is open, and the message list's scrollbar (see `desktopChrome`). */
export const desktopChatWidth = (
  windowWidth: number,
  memberList: boolean
): number =>
  Math.max(
    1,
    windowWidth -
      desktopChrome.serverRail -
      desktopChrome.channelList -
      (memberList ? desktopChrome.memberList : 0) -
      desktopChrome.scrollbar
  );

const visibleChat = (device: Device): ResolvedViewport[`visibleChat`] => {
  if (device.platform === `desktop` || device.safeArea === undefined)
    return null;
  const height =
    device.height -
    device.safeArea.top -
    phoneChrome.header -
    phoneChrome.composer -
    phoneChrome.composerGap -
    device.safeArea.bottom;
  const basis =
    device.id === `iphone-14-pro`
      ? `Measured from a full-screen capture of the iOS app on this phone: the chat runs from under the channel header to the top of the message box.`
      : device.platform === `ios` && device.form === `phone`
        ? `Worked out from the iOS app's header and message box as measured on an iPhone 14 Pro, with this phone's own safe-area insets. Not measured on this phone.`
        : `Estimated: the iOS app's header and message box as measured on an iPhone 14 Pro, with this device's insets assumed. Not measured on ${device.platform === `android` ? `Android` : `a tablet`}.`;
  return { height, approximate: true, basis };
};

const dimensions = (width: number, height: number): string =>
  `${String(width)} × ${String(height)}`;

/**
 * Words for what a drawing of this device is when the layout drawn is not its own client's: what the drawing shows, and what the device's users see instead.
 */
const layoutNote = (
  device: Device,
  layout: LayoutId,
  chatWidth: number
): string =>
  layout === device.layout
    ? `Drawn with ${layouts[layout].name} at ${String(chatWidth)} pixels wide. That layout was measured on an iPhone, and nothing has been captured on a ${device.form === `tablet` ? `tablet` : device.form}, so every part of this drawing is unobserved here: the app's text sizes and button shapes are probably the same, but its chat width, gallery sizes and margins on this screen are guesses. Check it on the device.`
    : `Drawn with ${layouts[layout].name} at ${String(chatWidth)} pixels wide, not as ${clientNames[device.platform]} draws it. The app has its own text sizes, button widths and gallery sizes, so this shows how the message wraps and overflows at this width, not what a ${device.form === `tablet` ? `tablet` : `phone`} user sees.`;

/** Every device id, closest to `id` first: the few worth suggesting for a mistyped one. */
export const closeDevices = (id: string, count = 3): Device[] => {
  const query = id.trim().toLowerCase();
  const distance = (a: string, b: string): number => {
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) {
        row[j] = Math.min(
          previous[j] + 1,
          row[j - 1] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      previous = row;
    }
    return previous[b.length];
  };
  const score = (device: Device): number => {
    const name = device.name.toLowerCase();
    if (query !== `` && (device.id.includes(query) || name.includes(query)))
      return -1;
    return Math.min(
      distance(query, device.id),
      distance(query, name.replaceAll(/[^a-z0-9]+/g, `-`))
    );
  };
  return [...devices]
    .map((device) => ({ device, score: score(device) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(({ device }) => device);
};

/** Why a device id cannot be used, and which ones were probably meant. */
export const unknownDeviceMessage = (id: string): string =>
  `There is no device called ${JSON.stringify(id)}. Close matches: ${closeDevices(
    id
  )
    .map((device) => `\`${device.id}\` (${device.name})`)
    .join(
      `, `
    )}. Use one of those, list every device with \`discordkit-preview devices\`, or give a free width instead, as \`{ "width": 600 }\`.`;

/** Thrown by {@link resolveViewport} for a device id the registry does not have. Its message lists close matches. */
export class UnknownDeviceError extends Error {
  override name = `UnknownDeviceError`;
}

/**
 * Works out everything about one viewport: the device, the layout it is drawn with and whether that is its own client's, the chat column's width, and on a phone how much of the chat one screen shows. Throws {@link UnknownDeviceError} for a device the registry does not have.
 */
export const resolveViewport = (viewport: SceneViewport): ResolvedViewport => {
  if (!isDeviceViewport(viewport)) {
    return {
      key: `responsive-${String(viewport.width)}`,
      device: null,
      name: `Responsive`,
      platform: null,
      screen: null,
      pixelRatio: 1,
      memberList: null,
      layout: `desktop`,
      requestedLayout: null,
      calibrated: true,
      chatWidth: viewport.width,
      visibleChat: null,
      label: `Responsive · ${String(viewport.width)} px chat column`,
      note: null
    };
  }
  const device = findDevice(viewport.device);
  if (device === undefined) {
    throw new UnknownDeviceError(unknownDeviceMessage(viewport.device));
  }
  const desktop = device.platform === `desktop`;
  const memberList = desktop ? (viewport.memberList ?? true) : null;
  const chatWidth = desktop
    ? desktopChatWidth(device.width, memberList ?? true)
    : device.width;
  const layout = drawnLayout(device.layout);
  const calibrated = isCalibrated(layout, device.platform, device.form);
  const size = `${dimensions(device.width, device.height)} · ${String(device.pixelRatio)}x`;
  return {
    key: memberList === false ? `${device.id}-no-members` : device.id,
    device: device.id,
    name: device.name,
    platform: device.platform,
    screen: { width: device.width, height: device.height },
    pixelRatio: device.pixelRatio,
    memberList,
    layout,
    requestedLayout: device.layout,
    calibrated,
    chatWidth,
    visibleChat: visibleChat(device),
    label: desktop
      ? `${device.name} · member list ${memberList === true ? `open` : `closed`} · ${String(chatWidth)} px chat`
      : `${device.name} · ${size}`,
    note: calibrated ? null : layoutNote(device, layout, chatWidth)
  };
};

/**
 * The viewports a scene asks for: its `viewports` when it has any, else its `width` as one free width, else `fallback`. The command line falls back to one 600-pixel column, as it always has; Studio falls back to {@link defaultViewports}.
 */
export const sceneViewports = (
  scene: { viewports?: readonly SceneViewport[]; width?: number },
  fallback: readonly SceneViewport[] = [{ width: defaultWidth }]
): SceneViewport[] =>
  scene.viewports !== undefined && scene.viewports.length > 0
    ? [...scene.viewports]
    : scene.width === undefined
      ? [...fallback]
      : [{ width: scene.width }];
