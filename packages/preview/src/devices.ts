/**
 * The devices a preview can be drawn for, the layouts the renderer can draw them with, and the parts of Discord's desktop window around the chat. Plain data with no Node built-ins, so the command line, the Node API and Studio read the same list.
 */

/** Which Discord client a device runs. */
export type Platform = `desktop` | `ios` | `android`;

/** What sort of screen it is: a desktop window, a phone or a tablet. */
export type FormFactor = `window` | `phone` | `tablet`;

/** A layout a device asks for: each platform's own client. Only the ones in {@link layouts} can be drawn; a device asking for any other is drawn with the desktop layout, and says so. */
export type RequestedLayout = Platform;

export interface LayoutInfo {
  /** As a sentence names it: "Discord's desktop web layout". */
  name: string;
  /** The platforms whose real client this layout has been checked against. A device on any other platform drawn with it gets a note saying the drawing is not what its users see. */
  calibratedFor: readonly Platform[];
  /** The kinds of screen it was checked on, when not every kind: the iOS layout was measured on an iPhone, so an iPad drawn with it is not calibrated. */
  calibratedForms?: readonly FormFactor[];
}

/**
 * The layouts the renderer can draw.
 *
 * - `desktop`: the desktop web client's, which every component draws by default, from Discord's shipped stylesheet and checked against captures of the desktop client (§7b of the design record).
 * - `ios`: the iOS app's, which is native and has no stylesheet. It was measured from captures of the app on an iPhone 14 Pro, and draws what those captures show as they show it; everything else is the desktop design at the app's text sizes, and is reported per scene as unobserved (see `parts.ts`). The components read it from the scene element's `data-discordkit-preview-layout`, in an `ios` block in each component's stylesheet, and from `useLayout` where the markup differs.
 *
 * A device asking for a layout not listed here (every Android device asks for `android`) is drawn with the desktop layout, and says so.
 */
export const layouts = {
  desktop: {
    name: `Discord's desktop web layout`,
    calibratedFor: [`desktop`]
  },
  ios: {
    name: `Discord's iOS layout`,
    calibratedFor: [`ios`],
    calibratedForms: [`phone`]
  }
} as const satisfies Record<string, LayoutInfo>;

export type LayoutId = keyof typeof layouts;

const isLayoutId = (value: string): value is LayoutId =>
  Object.hasOwn(layouts, value);

/** The layout a device that asks for `requested` is drawn with: the one it asks for when the renderer has it, and the desktop layout otherwise. */
export const drawnLayout = (requested: RequestedLayout): LayoutId =>
  isLayoutId(requested) ? requested : `desktop`;

/** Whether `layout` has been checked against the real client on `platform`, and on this kind of screen when the layout says which kinds it was checked on. */
export const isCalibrated = (
  layout: LayoutId,
  platform: Platform,
  form?: FormFactor
): boolean => {
  const info: LayoutInfo = layouts[layout];
  return (
    info.calibratedFor.includes(platform) &&
    (info.calibratedForms === undefined ||
      form === undefined ||
      info.calibratedForms.includes(form))
  );
};

export interface Device {
  /** Stable, for scene files and `--device`: `iphone-14-pro`. */
  id: string;
  /** As a person names it: "iPhone 14 Pro". */
  name: string;
  platform: Platform;
  form: FormFactor;
  /** The screen in portrait (a phone or tablet) or the window (desktop), in CSS pixels: points on iOS, dp on Android. */
  width: number;
  height: number;
  /** Device pixels per CSS pixel: what a screenshot taken on the device is scaled by. */
  pixelRatio: number;
  /** A phone's or tablet's portrait safe-area insets, in the same units: the status bar or sensor housing above, the home indicator below. */
  safeArea?: { top: number; bottom: number };
  /** The layout this device's Discord client draws. */
  layout: RequestedLayout;
  /** Where the numbers come from: a key of {@link deviceSources}. */
  source: keyof typeof deviceSources;
}

/** Where the device numbers were read, on 2026-11-25. */
export const deviceSources = {
  useYourLoaf: `Keith Harrison's screen-size tables at useyourloaf.com ("iPhone 14 Screen Sizes", "iPhone 16 Screen Sizes", "iPhone 17 Screen Sizes", "iPhone 13 Screen Sizes"): points, scale, pixels and portrait safe-area insets`,
  devtools: `Chrome DevTools' emulated device list (ChromeDevTools/devtools-frontend, front_end/models/emulation/EmulatedDevices.ts, main branch): CSS width, height and device pixel ratio. Safe-area insets are not in it, and are estimates here`,
  chosen: `Chosen as common window sizes, not measured: a maximised window is a little smaller than its screen. The two laptop sizes match Chrome DevTools' "Laptop with MDPI screen" and "Laptop with HiDPI screen"`
} as const;

const iphone = (
  id: string,
  name: string,
  [width, height]: [number, number],
  pixelRatio: number,
  [top, bottom]: [number, number]
): Device => ({
  id,
  name,
  platform: `ios`,
  form: `phone`,
  width,
  height,
  pixelRatio,
  safeArea: { top, bottom },
  layout: `ios`,
  source: `useYourLoaf`
});

const android = (
  id: string,
  name: string,
  [width, height]: [number, number],
  pixelRatio: number,
  form: FormFactor = `phone`
): Device => ({
  id,
  name,
  platform: `android`,
  form,
  width,
  height,
  pixelRatio,
  // Not measured: Android's 24 dp status bar, and a gesture-navigation bar of about the same height.
  safeArea: { top: 24, bottom: 24 },
  layout: `android`,
  source: `devtools`
});

const desktopWindow = (
  [width, height]: [number, number],
  name: string,
  pixelRatio = 1
): Device => ({
  id: `desktop-${String(width)}x${String(height)}`,
  name,
  platform: `desktop`,
  form: `window`,
  width,
  height,
  pixelRatio,
  layout: `desktop`,
  source: `chosen`
});

/**
 * Every device a preview can be drawn for, grouped by platform and in size order within each group. The iPhone 14 Pro (393 by 852 points at 3x) is the phone §7b's iOS measurements were taken on.
 */
export const devices: readonly Device[] = [
  desktopWindow([1920, 1080], `Desktop 1920 × 1080`),
  desktopWindow([1440, 900], `Laptop 1440 × 900 (HiDPI)`, 2),
  desktopWindow([1366, 768], `Laptop 1366 × 768`),
  desktopWindow([1280, 800], `Laptop 1280 × 800`),
  desktopWindow([1024, 768], `Small window 1024 × 768`),

  // The iPhone SE's insets are the 20-point status bar of an iPhone with a home button, which the cited tables do not list.
  iphone(`iphone-se`, `iPhone SE (2nd and 3rd gen)`, [375, 667], 2, [20, 0]),
  // The 13 mini draws at 3x and scales down to its panel's 2.88, so a screenshot from it is 1080 pixels wide.
  iphone(`iphone-13-mini`, `iPhone 13 mini`, [375, 812], 2.88, [50, 34]),
  iphone(`iphone-14`, `iPhone 14`, [390, 844], 3, [47, 34]),
  iphone(`iphone-14-pro`, `iPhone 14 Pro`, [393, 852], 3, [59, 34]),
  iphone(`iphone-16`, `iPhone 16`, [393, 852], 3, [59, 34]),
  iphone(`iphone-16-pro`, `iPhone 16 Pro`, [402, 874], 3, [62, 34]),
  iphone(`iphone-17`, `iPhone 17`, [402, 874], 3, [62, 34]),
  iphone(`iphone-air`, `iPhone Air`, [420, 912], 3, [68, 34]),
  iphone(`iphone-14-pro-max`, `iPhone 14 Pro Max`, [430, 932], 3, [59, 34]),
  iphone(`iphone-17-pro-max`, `iPhone 17 Pro Max`, [440, 956], 3, [62, 34]),
  {
    id: `ipad-mini`,
    name: `iPad mini (5th gen)`,
    platform: `ios`,
    form: `tablet`,
    width: 768,
    height: 1024,
    pixelRatio: 2,
    // A home-button iPad's status bar; not in the cited list.
    safeArea: { top: 20, bottom: 0 },
    layout: `ios`,
    source: `devtools`
  },
  {
    id: `ipad-pro-13`,
    name: `iPad Pro 13-inch`,
    platform: `ios`,
    form: `tablet`,
    width: 1032,
    height: 1376,
    pixelRatio: 2,
    // A Face ID iPad's insets; not in the cited list.
    safeArea: { top: 24, bottom: 20 },
    layout: `ios`,
    source: `devtools`
  },

  android(`galaxy-z-fold-5`, `Galaxy Z Fold 5 (folded)`, [344, 882], 2.625),
  android(`galaxy-a55`, `Samsung Galaxy A55`, [360, 800], 2.25),
  android(`pixel-7`, `Pixel 7`, [412, 915], 2.625),
  android(`galaxy-s20-ultra`, `Samsung Galaxy S20 Ultra`, [412, 915], 3.5),
  android(`pixel-9`, `Pixel 9`, [412, 924], 2.625),
  android(`pixel-9-pro-xl`, `Pixel 9 Pro XL`, [448, 997], 3),
  android(`galaxy-tab-s4`, `Galaxy Tab S4`, [712, 1138], 2.25, `tablet`)
];

/** Looks a device up by its id. */
export const findDevice = (id: string): Device | undefined =>
  devices.find((device) => device.id === id);

/** Platform names as a sentence uses them. */
export const platformNames: Record<Platform, string> = {
  desktop: `Desktop`,
  ios: `iOS`,
  android: `Android`
};

/** Each platform's own Discord client, as a sentence names it. */
export const clientNames: Record<Platform, string> = {
  desktop: `the desktop app`,
  ios: `the iOS app`,
  android: `the Android app`
};

/**
 * The parts of Discord's desktop window beside the chat, in CSS pixels at the default density, read from Discord's production stylesheet (build 679963, fetched 2026-11-24). The window's width less these is the chat column.
 */
export const desktopChrome = {
  /** The server rail: `--custom-guild-list-width`, which is `--guildbar-avatar-size` (40px) plus twice `--custom-guild-list-padding` (`--space-md`, 16px at the default density). */
  serverRail: 72,
  /** The channel list: the sidebar is `--custom-guild-sidebar-width` (268px) holding the rail and the list, whose rule is `calc(268px - 72px - 1px)` plus a 1px leading border. People can drag it wider; this is its width before they do. */
  channelList: 196,
  /** The member list: `--custom-member-list-width` (264px at the default density; 256 compact, 268 cozy), the second column of the channel's grid. Open by default in a server channel. */
  memberList: 264,
  /** The message list's scrollbar: the managed scroller always scrolls (`overflow-y: scroll`) with the `auto` scrollbar's 16px width, and the gradient over it stops 16px short of the edge. */
  scrollbar: 16
} as const;

/**
 * The parts of the iOS app's channel screen above and below the chat, in points, measured from one full-screen capture of the app on an iPhone 14 Pro (§7b): the chat starts 114 points down, under the 59-point status-bar inset and a 55-point channel header, and ends at the top of the 55-point message box, whose bottom sits 2 points above the 34-point home-indicator inset. So the chat shows 647 of the screen's 852 points. Other phones are assumed to keep the header and message box and change only their insets, which is unmeasured.
 */
export const phoneChrome = {
  header: 55,
  composer: 55,
  composerGap: 2
} as const;
