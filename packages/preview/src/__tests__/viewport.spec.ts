import { describe, expect, it } from "vite-plus/test";
import {
  desktopChrome,
  deviceSources,
  devices,
  drawnLayout,
  findDevice,
  isCalibrated,
  layouts
} from "../devices.js";
import { lint } from "../lint/index.js";
import { readScene } from "../scene/intake.js";
import {
  closeDevices,
  defaultViewports,
  desktopChatWidth,
  resolveViewport,
  sceneViewports,
  UnknownDeviceError
} from "../viewport.js";

/**
 * The device registry and how a viewport becomes a chat column. What these hold to: a phone is never passed off as its native app, a desktop window's chat column is the window less Discord's own chrome as its stylesheet sets it, a scene's `width` still means what it always meant, and a mistyped device id is answered with the one probably meant.
 */

const message = { payload: { content: `Hi` } };

describe(`the device registry`, () => {
  it(`has the owner's phone, the iPhone 14 Pro, at 393 by 852 points and 3x, so a render of it at its own density is 1179 pixels wide like a screenshot from it`, () => {
    const phone = findDevice(`iphone-14-pro`);
    expect(phone).toMatchObject({
      platform: `ios`,
      form: `phone`,
      width: 393,
      height: 852,
      pixelRatio: 3,
      safeArea: { top: 59, bottom: 34 }
    });
    expect((phone?.width ?? 0) * (phone?.pixelRatio ?? 0)).toBe(1179);
  });

  it(`gives every device a unique id, a source, and a layout it can be drawn with`, () => {
    const ids = devices.map((device) => device.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const device of devices) {
      expect(Object.keys(layouts)).toContain(drawnLayout(device.layout));
      expect(Object.keys(deviceSources)).toContain(device.source);
    }
  });

  it(`covers the smallest and largest iPhones people use, Android phones, tablets and desktop windows`, () => {
    const widths = (platform: string, form: string): number[] =>
      devices
        .filter(
          (device) => device.platform === platform && device.form === form
        )
        .map((device) => device.width);
    expect(Math.min(...widths(`ios`, `phone`))).toBe(375);
    expect(Math.max(...widths(`ios`, `phone`))).toBe(440);
    expect(widths(`android`, `phone`).length).toBeGreaterThanOrEqual(3);
    expect(
      devices.filter((device) => device.form === `tablet`).length
    ).toBeGreaterThanOrEqual(2);
    expect(widths(`desktop`, `window`).length).toBeGreaterThanOrEqual(3);
  });
});

describe(`a desktop window's chat column`, () => {
  it(`is the window less the server rail, the channel list, the member list and the message list's scrollbar`, () => {
    expect(desktopChrome).toStrictEqual({
      serverRail: 72,
      channelList: 196,
      memberList: 264,
      scrollbar: 16
    });
    expect(desktopChatWidth(1280, true)).toBe(1280 - 72 - 196 - 264 - 16);
    // Closing the member list gives its width back to the chat.
    expect(desktopChatWidth(1280, false) - desktopChatWidth(1280, true)).toBe(
      264
    );
  });

  it(`has the member list open unless the viewport closes it, as a server channel opens with it`, () => {
    expect(resolveViewport({ device: `desktop-1280x800` })).toMatchObject({
      memberList: true,
      chatWidth: 732,
      calibrated: true,
      note: null
    });
    expect(
      resolveViewport({ device: `desktop-1280x800`, memberList: false })
    ).toMatchObject({ memberList: false, chatWidth: 996 });
  });
});

describe(`a phone`, () => {
  it(`is drawn, on an iPhone, with the iOS app's layout at its screen's width, which was measured on an iPhone, so it needs no warning`, () => {
    for (const device of devices.filter(
      (candidate) => candidate.platform === `ios` && candidate.form === `phone`
    )) {
      const viewport = resolveViewport({ device: device.id });
      expect(viewport.layout).toBe(`ios`);
      expect(viewport.calibrated).toBe(true);
      expect(viewport.chatWidth).toBe(device.width);
      expect(viewport.note).toBeNull();
    }
  });

  it(`is drawn, on Android, with the desktop web layout at its screen's width, and says plainly that this is not its app, since nothing of the Android app has been measured`, () => {
    for (const device of devices.filter(
      (candidate) => candidate.platform === `android`
    )) {
      const viewport = resolveViewport({ device: device.id });
      expect(viewport.layout).toBe(`desktop`);
      expect(viewport.requestedLayout).toBe(`android`);
      expect(viewport.calibrated).toBe(false);
      expect(viewport.note).toMatch(/not as the Android app/);
    }
  });

  it(`picks up a layout for its platform without any change to the device: only the layout list decides`, () => {
    expect(findDevice(`iphone-14-pro`)?.layout).toBe(`ios`);
    expect(drawnLayout(`ios`)).toBe(`ios`);
    expect(drawnLayout(`android`)).toBe(`desktop`);
    expect(isCalibrated(`desktop`, `desktop`)).toBe(true);
    expect(isCalibrated(`desktop`, `ios`)).toBe(false);
    expect(isCalibrated(`ios`, `ios`, `phone`)).toBe(true);
  });

  it(`knows roughly how much chat one screen shows, measured on the iPhone 14 Pro and worked out for the rest`, () => {
    const measured = resolveViewport({ device: `iphone-14-pro` }).visibleChat;
    expect(measured).toMatchObject({ height: 647, approximate: true });
    expect(measured?.basis).toMatch(/Measured/);
    // A phone with a home button and no home indicator has more of its screen for chat than its height alone suggests, and less than a taller phone.
    const se = resolveViewport({ device: `iphone-se` }).visibleChat;
    expect(se?.height).toBe(667 - 20 - 55 - 55 - 2);
    expect(se?.basis).toMatch(/Not measured on this phone/);
    expect(resolveViewport({ device: `pixel-7` }).visibleChat?.basis).toMatch(
      /Estimated/
    );
    expect(resolveViewport({ device: `desktop-1280x800` }).visibleChat).toBe(
      null
    );
  });
});

describe(`an iPad`, () => {
  it(`is drawn with the iOS app's layout, since it runs the same app, but is not calibrated and says why: nothing has been captured on an iPad`, () => {
    for (const device of devices.filter(
      (candidate) => candidate.platform === `ios` && candidate.form === `tablet`
    )) {
      const viewport = resolveViewport({ device: device.id });
      expect(viewport.layout).toBe(`ios`);
      expect(viewport.calibrated).toBe(false);
      expect(viewport.note).toMatch(/measured on an iPhone/);
      expect(viewport.note).not.toMatch(/web layout/);
    }
  });
});

describe(`a scene's viewports`, () => {
  it(`keeps a scene's width meaning what it meant: one chat column of that width, in the web layout, with no caption needed`, () => {
    expect(sceneViewports({ width: 480 })).toStrictEqual([{ width: 480 }]);
    expect(resolveViewport({ width: 480 })).toMatchObject({
      device: null,
      chatWidth: 480,
      layout: `desktop`,
      calibrated: true,
      note: null,
      pixelRatio: 1
    });
  });

  it(`uses the scene's viewports over its width, and falls back to one 600-pixel column, or Studio's pair, when it names none`, () => {
    expect(
      sceneViewports({ width: 480, viewports: [{ device: `iphone-14` }] })
    ).toStrictEqual([{ device: `iphone-14` }]);
    expect(sceneViewports({})).toStrictEqual([{ width: 600 }]);
    expect(sceneViewports({}, defaultViewports)).toStrictEqual([
      { device: `desktop-1280x800` },
      { device: `iphone-14-pro` }
    ]);
  });

  it(`are read from a scene file in either key style`, () => {
    const read = readScene({
      messages: [message],
      viewports: [
        { device: `desktop-1440x900`, member_list: false },
        { device: `iphone-14-pro` },
        { width: 600 }
      ]
    });
    expect(read.findings).toStrictEqual([]);
    expect(read.scene?.viewports).toStrictEqual([
      { device: `desktop-1440x900`, memberList: false },
      { device: `iphone-14-pro` },
      { width: 600 }
    ]);
  });

  it(`refuses a free width that is not a whole number of pixels`, () => {
    const read = readScene({ messages: [message], viewports: [{ width: 0 }] });
    expect(read.findings).toContainEqual(
      expect.objectContaining({
        code: `scene`,
        path: [`viewports`, 0, `width`]
      })
    );
  });
});

describe(`a mistyped device`, () => {
  it(`is suggested the device probably meant`, () => {
    expect(closeDevices(`iphone14pro`)[0]?.id).toBe(`iphone-14-pro`);
    expect(closeDevices(`iphone-14-pr`)[0]?.id).toBe(`iphone-14-pro`);
    expect(closeDevices(`pixel`).map((device) => device.id)).toContain(
      `pixel-7`
    );
  });

  it(`is an error lint reports where the scene names it, in the caller's spelling, listing close matches`, () => {
    const result = lint({
      messages: [message],
      viewports: [{ device: `iphone-14` }, { device: `iphone14pro` }]
    });
    expect(result.valid).toBe(false);
    const finding = result.findings.find(
      (candidate) => candidate.code === `viewport-device-unknown`
    );
    expect(finding).toMatchObject({
      severity: `error`,
      path: [`viewports`, 1, `device`]
    });
    expect(finding?.message).toMatch(/`iphone-14-pro` \(iPhone 14 Pro\)/);
    expect(() => resolveViewport({ device: `iphone14pro` })).toThrow(
      UnknownDeviceError
    );
  });

  it(`does not make a message invalid when it is not there: a scene with only known devices lints exactly as without them`, () => {
    const plain = lint({ messages: [message] });
    const viewed = lint({
      messages: [message],
      viewports: [{ device: `desktop-1920x1080` }, { device: `pixel-9` }]
    });
    expect(viewed.findings).toStrictEqual(plain.findings);
    expect(viewed.counts).toStrictEqual(plain.counts);
  });

  it(`warns that width is unused when viewports are set too`, () => {
    const result = lint({
      messages: [message],
      width: 480,
      viewports: [{ device: `iphone-14-pro` }]
    });
    expect(result.valid).toBe(true);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: `viewport-width-ignored`,
        severity: `warning`,
        path: [`width`]
      })
    );
  });
});
