import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import type { SceneMessage } from "../../scene.js";
import { isComponentsV2 } from "../Message.js";
import { Scene } from "../Scene.js";
import { browserAssetUrl } from "../SceneContext.js";

const text: SceneMessage = {
  payload: {
    components: [{ type: ComponentType.TextDisplay, content: `Round 3` }]
  }
};
const one = [text];
const withBadTimestamp = [text, { ...text, timestamp: `soon` }];
const v2WithContent: SceneMessage[] = [
  {
    payload: {
      flags: MessageFlag.IS_COMPONENTS_V2,
      content: `hello`,
      components: [{ type: ComponentType.TextDisplay, content: `x` }]
    }
  }
];

/** Server-rendering checks that need no browser: what a scene refuses, and how images load by default. */
describe(`scene`, () => {
  it(`refuses a message timestamp it cannot read, naming the message, instead of drawing a header with "Invalid Date"`, () => {
    expect(() =>
      renderToStaticMarkup(<Scene messages={withBadTimestamp} />)
    ).toThrow(/message 2's `timestamp`/);
  });

  it(`refuses a Components V2 message that also has content, which Discord will not send, instead of dropping the content`, () => {
    expect(() =>
      renderToStaticMarkup(<Scene messages={v2WithContent} />)
    ).toThrow(/Components V2 message .* also has content/);
  });

  it(`draws a message as Components V2 when it holds a layout component, even without the flag, since only V2 allows one`, () => {
    expect(isComponentsV2({ components: text.payload.components })).toBe(true);
    expect(isComponentsV2({ content: `hi`, components: [] })).toBe(false);
  });

  it(`writes the scene's locale as the page language, which is what switches Discord's font stack`, () => {
    expect(renderToStaticMarkup(<Scene locale="ja" messages={one} />)).toMatch(
      /<div data-discordkit-preview-scene="" lang="ja"/
    );
  });
});

describe(`browserAssetUrl`, () => {
  it(`loads a URL as written, which is all a browser needs`, () => {
    expect(browserAssetUrl(`https://cdn.example/a.png`)).toBe(
      `https://cdn.example/a.png`
    );
  });

  it(`draws an attachment as a placeholder, since a browser cannot open a file the scene names on disk`, () => {
    expect(browserAssetUrl(`attachment://card.png`)).toBeNull();
  });
});
