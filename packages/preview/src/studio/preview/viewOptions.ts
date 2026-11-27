import { isObject } from "@discordkit/core/utils/isObject";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { devices, findDevice } from "../../devices.js";
import type { Scene, Theme } from "../../scene.js";
import {
  isDeviceViewport,
  resolveViewport,
  type SceneViewport
} from "../../viewport.js";
import type { Option } from "../controls/Fields.js";

export const themeOptions: ReadonlyArray<Option<Theme>> = [
  { id: `light`, label: `Light` },
  { id: `ash`, label: `Ash` },
  { id: `dark`, label: `Dark` },
  { id: `onyx`, label: `Onyx` }
];

/** The device chooser's value for a free width with no device. */
export const responsiveKey = `responsive`;

/** What the device chooser shows as chosen for a viewport. */
export const chooserKey = (viewport: SceneViewport): string =>
  isDeviceViewport(viewport) ? viewport.device : responsiveKey;

/** The viewport a choice in the device chooser makes of `current`: a device keeps a desktop window's member-list setting, and "responsive" starts at the chat column the device had, so switching to it changes nothing on screen. */
export const chooseViewport = (
  current: SceneViewport,
  key: string
): SceneViewport => {
  if (key === responsiveKey) {
    return isDeviceViewport(current)
      ? { width: resolveViewport(current).chatWidth }
      : current;
  }
  return isDeviceViewport(current) && current.memberList !== undefined
    ? { device: key, memberList: current.memberList }
    : { device: key };
};

/** The viewport to add after the last: the next device Studio does not show yet, preferring a phone after a desktop window and a desktop window after a phone, so each new one is a different view. */
export const nextViewport = (
  viewports: readonly SceneViewport[]
): SceneViewport => {
  const shown = new Set(
    viewports.filter(isDeviceViewport).map((viewport) => viewport.device)
  );
  const last = viewports.at(-1);
  const lastPlatform =
    last !== undefined && isDeviceViewport(last)
      ? findDevice(last.device)?.platform
      : undefined;
  const candidates = devices.filter((device) => !shown.has(device.id));
  const different = candidates.find((device) =>
    lastPlatform === `desktop`
      ? device.platform !== `desktop` && device.form === `phone`
      : device.platform === `desktop`
  );
  const pick = different ?? candidates.at(0);
  return pick === undefined ? { width: 600 } : { device: pick.id };
};

const languageNames = ((): Intl.DisplayNames | undefined => {
  try {
    return new Intl.DisplayNames([`en`], { type: `language` });
  } catch {
    return undefined;
  }
})();

/** Locales Discord's client offers, as suggestions; any BCP 47 tag can be typed. */
export const localeOptions: ReadonlyArray<Option<string>> = [
  `en-US`,
  `en-GB`,
  `ja`,
  `ko`,
  `zh-CN`,
  `zh-TW`,
  `de`,
  `fr`,
  `es-ES`,
  `pt-BR`,
  `ru`,
  `pl`
].map((id) => ({ id, label: languageNames?.of(id) ?? id }));

/** Time zones as suggestions: UTC, the browser's own, and a spread of common ones. Any IANA zone can be typed. */
export const timeZoneOptions = (): ReadonlyArray<Option<string>> => {
  let local: string | undefined;
  try {
    local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    local = undefined;
  }
  const zones = [
    `UTC`,
    ...(local === undefined ? [] : [local]),
    `America/Los_Angeles`,
    `America/New_York`,
    `Europe/London`,
    `Europe/Berlin`,
    `Asia/Tokyo`,
    `Asia/Seoul`,
    `Australia/Sydney`
  ];
  return [...new Set(zones)].map((id) => ({ id, label: id }));
};

/** The value of the open-select control for "every select closed". */
export const noOpenSelect = `none`;

/** Every String Select in the scene, by message, as choices for which to draw open. The id is `<message index>:<customId>`. */
export const stringSelectOptions = (scene: Scene): Array<Option<string>> => {
  const options: Array<Option<string>> = [];
  scene.messages.forEach((message, index) => {
    const walk = (items: unknown): void => {
      const list: unknown[] = Array.isArray(items)
        ? items
        : isObject(items)
          ? [items]
          : [];
      for (const item of list) {
        if (!isObject(item)) continue;
        if (
          item.type === ComponentType.StringSelect &&
          typeof item.customId === `string`
        ) {
          const placeholder =
            typeof item.placeholder === `string`
              ? ` (“${item.placeholder}”)`
              : ``;
          options.push({
            id: `${String(index)}:${item.customId}`,
            label: `${item.customId}${placeholder}`,
            detail:
              scene.messages.length > 1
                ? `Message ${String(index + 1)}`
                : undefined
          });
        }
        walk(item.components);
      }
    };
    walk(message.payload.components);
  });
  return options;
};

/** Which select the scene draws open, as a `stringSelectOptions` id: the first message that names one. */
export const openSelectValue = (scene: Scene): string => {
  const index = scene.messages.findIndex(
    (message) => message.openSelect !== undefined
  );
  return index === -1
    ? noOpenSelect
    : `${String(index)}:${scene.messages[index].openSelect ?? ``}`;
};

/** The scene's messages with the chosen select open and every other closed. Studio draws one select open at a time. */
export const withOpenSelect = (
  scene: Scene,
  choice: string
): Scene[`messages`] => {
  const separator = choice.indexOf(`:`);
  const index =
    choice === noOpenSelect ? -1 : Number(choice.slice(0, separator));
  const customId = choice.slice(separator + 1);
  return scene.messages.map((message, position) => {
    const { openSelect: _, ...rest } = message;
    return position === index ? { ...rest, openSelect: customId } : rest;
  });
};
