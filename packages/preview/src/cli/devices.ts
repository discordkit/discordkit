import { parseArgs } from "node:util";
import {
  desktopChrome,
  deviceSources,
  devices,
  layouts,
  platformNames,
  type Platform
} from "../devices.js";
import { desktopChatWidth, resolveViewport } from "../viewport.js";
import { exitCodes, print, printJson, program } from "./shared.js";

export const devicesUsage = `Usage: ${program} devices [options]

Lists the devices \`render --device\` and a scene's \`viewports\` can name, by platform: each one's screen or window size in CSS pixels, its pixel density, the chat column a message is drawn in, and the layout it is drawn with.

A phone's chat fills its screen. A desktop window's chat column is the window less Discord's server rail (72px), channel list (196px), member list (264px, when open) and the message list's scrollbar (16px), as Discord's stylesheet sets them.

Desktop windows are drawn with Discord's desktop web layout, and iPhones and iPads with its iOS layout, measured from the app on an iPhone 14 Pro (nothing has been captured on an iPad). Android devices are drawn with the desktop web layout at their width, which shows how a message wraps and overflows there but not what the Android app shows.

Options:
      --json      Print one JSON document on standard output.
  -h, --help      Show this help.`;

const platforms: readonly Platform[] = [`desktop`, `ios`, `android`];

/** Every device with what a render of it would be, as `--json` prints it. */
const report = (): unknown => ({
  devices: devices.map((device) => {
    const viewport = resolveViewport({ device: device.id });
    return {
      ...device,
      requestedLayout: device.layout,
      layout: viewport.layout,
      calibrated: viewport.calibrated,
      chatWidth: viewport.chatWidth,
      ...(device.platform === `desktop`
        ? { chatWidthMemberListClosed: desktopChatWidth(device.width, false) }
        : {}),
      visibleChat: viewport.visibleChat,
      note: viewport.note
    };
  }),
  layouts,
  desktopChrome,
  sources: deviceSources
});

const listDevices = (args: readonly string[]): number => {
  const { values } = parseArgs({
    args: [...args],
    options: {
      json: { type: `boolean`, default: false },
      help: { type: `boolean`, short: `h`, default: false }
    }
  });
  if (values.help) {
    print(devicesUsage);
    return exitCodes.ok;
  }
  if (values.json) {
    printJson(report());
    return exitCodes.ok;
  }
  for (const platform of platforms) {
    print(`${platformNames[platform]}:`);
    for (const device of devices.filter(
      (candidate) => candidate.platform === platform
    )) {
      const viewport = resolveViewport({ device: device.id });
      const chat =
        platform === `desktop`
          ? `chat ${String(viewport.chatWidth)}, ${String(desktopChatWidth(device.width, false))} without the member list`
          : `chat ${String(viewport.chatWidth)}, about ${String(viewport.visibleChat?.height ?? `?`)} tall on screen`;
      print(
        `  ${device.id.padEnd(22)} ${device.name.padEnd(30)} ${`${String(device.width)} × ${String(device.height)} @${String(device.pixelRatio)}x`.padEnd(20)} ${chat}`
      );
    }
  }
  print();
  print(
    `Desktop windows are drawn with ${layouts.desktop.name}. iPhones are drawn with ${layouts.ios.name}, measured from the app on an iPhone 14 Pro; each image lists anything in its message not yet seen in the app. iPads are drawn with it too, but nothing has been captured on one. Android devices are drawn with ${layouts.desktop.name} at their width, not as the Android app draws them; each image of one says so in its caption.`
  );
  return exitCodes.ok;
};

/** Runs `devices`. Nothing in it waits, but every command has the same signature. */
export const runDevices = async (args: readonly string[]): Promise<number> =>
  Promise.resolve(listDevices(args));
