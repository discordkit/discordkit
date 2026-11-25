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

/** A select in its action row, in the array Discord expects. The client's `ActionRow` type has a select as a bare object (#106), so the row is cast. */
const selectRow = (select: Record<string, unknown>): never =>
  ({ type: ComponentType.ActionRow, components: [select] }) as never;

/** A message holding a user select and a string select, with `openSelect` naming the given `customId`. */
const withOpenSelect = (openSelect: string): SceneMessage[] => [
  {
    openSelect,
    payload: {
      components: [
        selectRow({ type: ComponentType.UserSelect, customId: `buddy` }),
        selectRow({
          type: ComponentType.StringSelect,
          customId: `level`,
          options: [{ label: `N5`, value: `n5` }]
        })
      ]
    }
  }
];
const openMissing = withOpenSelect(`missing`);
const openUserSelect = withOpenSelect(`buddy`);
const openStringSelect = withOpenSelect(`level`);

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

  it.each([
    [
      `no component has its customId`,
      openMissing,
      /no component in the message has that `customId`/
    ],
    [
      `it names a user select, whose options the client fetches`,
      openUserSelect,
      /not a String Select/
    ]
  ])(
    `refuses to draw a select open when %s, instead of drawing every select closed and hiding the mistake`,
    (_, messages, message) => {
      expect(() => renderToStaticMarkup(<Scene messages={messages} />)).toThrow(
        message
      );
    }
  );

  it(`marks the open select's list as an overlay, so the Node renderer can make room for it`, () => {
    const markup = renderToStaticMarkup(<Scene messages={openStringSelect} />);
    expect(markup).toMatch(/data-discordkit-preview-overlay=""[^>]*>.*N5/);
    expect(markup).toContain(`anchor-name:--dkp-open-select-0`);
    expect(markup).toContain(`position-anchor:--dkp-open-select-0`);
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
