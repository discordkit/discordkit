import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { SceneMessage } from "../../scene.js";
import type { SceneProps } from "../Scene.js";
import containerStyles from "../Container.module.css";
import messageStyles from "../Message.module.css";
import textDisplayStyles from "../TextDisplay.module.css";
import { byClass, dark, expectColor, find, mountScene } from "./mount.js";

/**
 * The chrome around a message, at Discord's default cozy density, against the values measured from Discord's stylesheet (web client build 679963). Both bots' iterations were about how a card sits in a channel as much as what is in it: which messages share a header, what an edited or ephemeral message looks like.
 */

const style = (element: Element, pseudo?: string): CSSStyleDeclaration =>
  getComputedStyle(element, pseudo);

const bot = `1311000000000000001`;
const person = `1311000000000000101`;

const base: Omit<SceneProps, `messages`> = {
  now: `2026-11-25T16:05:00Z`,
  timeZone: `UTC`,
  context: {
    users: {
      [bot]: { name: `Tome of Knowledge`, bot: true, verified: true },
      [person]: { name: `Emberwing` }
    }
  }
};

const message = (overrides: Partial<SceneMessage> = {}): SceneMessage => ({
  author: bot,
  payload: {
    components: [{ type: ComponentType.TextDisplay, content: `Round 3` }]
  },
  ...overrides
});

const messagesIn = (root: HTMLElement): HTMLElement[] => [
  ...root.querySelectorAll<HTMLElement>(byClass(messageStyles.message))
];

const mountMessages = (...messages: SceneMessage[]): HTMLElement[] =>
  messagesIn(mountScene({ ...base, messages }));

describe(`a message's header`, () => {
  it(`draws the author's avatar as a 40px circle in the gutter, 16px from the edge and 4px from the top`, () => {
    const [first] = mountMessages(message());
    const avatar = find(first, byClass(messageStyles.avatar));
    const box = first.getBoundingClientRect();
    const image = avatar.getBoundingClientRect();
    expect([image.width, image.height]).toStrictEqual([40, 40]);
    expect(style(avatar).borderTopLeftRadius).toBe(`50%`);
    expect(image.left - box.left).toBe(16);
    expect(image.top - box.top).toBe(4);
  });

  it(`draws an author with no picture as their initial on a coloured circle, with no image to fetch`, () => {
    const [first] = mountMessages(message());
    const avatar = find(first, byClass(messageStyles.avatar));
    expect(avatar.tagName).toBe(`DIV`);
    expect(avatar.textContent).toBe(`T`);
    expect(first.querySelector(`img`)).toBeNull();
    expectColor(style(avatar).color, dark.white);
    expect(style(avatar).backgroundColor).not.toBe(`rgba(0, 0, 0, 0)`);
  });

  it(`draws an author's picture when the scene gives one`, () => {
    const root = mountScene({
      ...base,
      context: {
        users: { [bot]: { name: `Tome`, avatar: `https://cdn.example/a.png` } }
      },
      messages: [message()]
    });
    const avatar = find(root, byClass(messageStyles.avatar));
    expect(avatar.tagName).toBe(`IMG`);
  });

  it(`starts the message's content 72px in: the avatar and a 16px gutter either side of it`, () => {
    const [first] = mountMessages(message());
    expect(style(first).paddingLeft).toBe(`72px`);
    expect(style(first).paddingRight).toBe(`24px`);
  });

  it(`names the author at 16px, medium weight, in the strong text colour`, () => {
    const [first] = mountMessages(message());
    const name = find(first, `h3 span span`);
    expect(name.textContent).toBe(`Tome of Knowledge`);
    expect(style(name).fontSize).toBe(`16px`);
    expect(style(name).fontWeight).toBe(`500`);
    expectColor(style(name).color, dark.textStrong);
  });

  it(`puts Discord's APP tag after an app's name: white uppercase text on blurple, 15px tall`, () => {
    const [first] = mountMessages(message());
    const name = find(first, `h3 span span`);
    const tag = name.nextElementSibling;
    if (!(tag instanceof HTMLElement)) throw new Error(`No tag was drawn.`);
    expect(tag.textContent).toBe(`App`);
    expect(style(tag).textTransform).toBe(`uppercase`);
    expectColor(style(tag).backgroundColor, dark.brand);
    expectColor(style(tag).color, dark.white);
    expect(style(tag).height).toBe(`15px`);
    expect(style(tag).borderTopLeftRadius).toBe(`4px`);
    expect(style(find(tag, `span`)).fontWeight).toBe(`600`);
  });

  it(`starts a verified app's tag with a check mark, and a plain app's without`, () => {
    const verified = mountMessages(message());
    expect(verified[0].querySelector(`h3 svg`)).not.toBeNull();
    const plain = messagesIn(
      mountScene({
        ...base,
        context: { users: { [bot]: { name: `Inbou`, bot: true } } },
        messages: [message()]
      })
    );
    expect(plain[0].querySelector(`h3 span span + span`)?.textContent).toBe(
      `App`
    );
    expect(plain[0].querySelector(`h3 svg`)).toBeNull();
  });

  it(`puts no tag after a person's name`, () => {
    const [first] = mountMessages(message({ author: person }));
    expect(find(first, `h3 span`).textContent).toBe(`Emberwing`);
  });

  it(`shows when the message was sent at 12px in the muted chat colour, against the scene's clock, as the time alone for a message sent today, as every desktop capture shows`, () => {
    const [first] = mountMessages(
      message({ timestamp: `2026-11-25T15:58:00Z` })
    );
    const time = find(first, `time`);
    expect(time.textContent).toBe(`3:58 PM`);
    expect(time.getAttribute(`datetime`)).toBe(`2026-11-25T15:58:00.000Z`);
    const stamp = time.parentElement;
    if (!stamp) throw new Error(`The time has no wrapper.`);
    expect(style(stamp).fontSize).toBe(`12px`);
    expect(style(stamp).fontWeight).toBe(`500`);
    expectColor(style(stamp).color, dark.chatTextMuted);
  });

  it(`draws a message with no author as an app called "App"`, () => {
    const [first] = mountMessages(message({ author: undefined }));
    expect(find(first, `h3 span span`).textContent).toBe(`App`);
  });
});

describe(`messages in a channel`, () => {
  it(`groups a message under the one above when the same author sent it within minutes, as Discord does`, () => {
    const [first, second] = mountMessages(
      message({ timestamp: `2026-11-25T16:00:00Z` }),
      message({ timestamp: `2026-11-25T16:04:00Z` })
    );
    expect(first.querySelector(`h3`)).not.toBeNull();
    expect(second.querySelector(`h3`)).toBeNull();
    expect(second.querySelector(`img`)).toBeNull();
    expect(style(second).marginTop).toBe(`0px`);
  });

  it(`starts a new group, 17px below the last, for another author or a long gap`, () => {
    const messages = mountMessages(
      message({ timestamp: `2026-11-25T15:00:00Z` }),
      message({ timestamp: `2026-11-25T15:30:00Z` }),
      message({ author: person, timestamp: `2026-11-25T15:31:00Z` })
    );
    for (const each of messages) {
      expect(each.querySelector(`h3`)).not.toBeNull();
      expect(style(each).marginTop).toBe(`17px`);
      expect(style(each).minHeight).toBe(`44px`);
    }
  });
});

describe(`an ephemeral message`, () => {
  it(`is tinted blurple with a 2px blurple bar down its leading edge`, () => {
    const [first] = mountMessages(message({ ephemeral: true }));
    expectColor(style(first).backgroundColor, dark.brand05a);
    const bar = style(first, `::before`);
    expect(bar.width).toBe(`2px`);
    expect(bar.left).toBe(`0px`);
    expectColor(bar.backgroundColor, dark.brand);
  });

  it(`ends with "Only you can see this" in 12px muted text`, () => {
    const [first] = mountMessages(message({ ephemeral: true }));
    const notice = find(first, byClass(messageStyles.ephemeralNotice));
    expect(notice.textContent).toBe(`Only you can see this • Dismiss message`);
    expect(style(notice).fontSize).toBe(`12px`);
    expectColor(style(notice).color, dark.textMuted);
    expectColor(style(find(notice, `a`)).color, dark.textLink);
  });

  it(`is not drawn as ephemeral unless the scene says so`, () => {
    const [first] = mountMessages(message());
    expect(
      first.querySelector(byClass(messageStyles.ephemeralNotice))
    ).toBeNull();
    expect(style(first).backgroundColor).toBe(`rgba(0, 0, 0, 0)`);
  });
});

describe(`an edited message`, () => {
  it(`is marked "(edited)" at Discord's 10px`, () => {
    const [first] = mountMessages(message({ edited: true }));
    const mark = find(first, byClass(messageStyles.edited));
    expect(mark.textContent).toBe(`(edited)`);
    expect(style(mark).fontSize).toBe(`10px`);
  });

  it(`marks a Components V2 message under its components, at their leading edge, and moves the next message in the group 32px below the container, where the desktop client draws it`, () => {
    const payload = {
      components: [
        {
          type: ComponentType.Container,
          components: [{ type: ComponentType.TextDisplay, content: `closed` }]
        }
      ]
    } satisfies SceneMessage[`payload`];
    const [first, second] = mountMessages(
      message({ edited: true, payload }),
      message({ payload })
    );
    const container = find(
      first,
      byClass(containerStyles.container)
    ).getBoundingClientRect();
    const mark = find(
      first,
      byClass(messageStyles.edited)
    ).getBoundingClientRect();
    const next = find(
      second,
      byClass(containerStyles.container)
    ).getBoundingClientRect();
    expect(mark.top).toBeGreaterThan(container.bottom);
    expect(mark.left).toBe(container.left);
    // Grouped messages are 8px apart; the client's edited line adds 24px.
    expect(next.top - container.bottom).toBe(32);
  });
});

describe(`the chat column`, () => {
  it(`is painted #1a1a1e in the dark theme, the colour the desktop captures show behind messages (Discord's --background-base-lower)`, () => {
    const root = mountScene({ ...base, messages: [message()] });
    expectColor(style(root).backgroundColor, dark.backgroundBaseLower);
  });
});

describe(`the scene's language`, () => {
  it(`sets lang from the locale, which switches to Discord's Japanese font stack for a Japanese viewer`, () => {
    const root = mountScene({ ...base, locale: `ja`, messages: [message()] });
    expect(root.lang).toBe(`ja`);
    expect(style(root).fontFamily).toMatch(/^"gg sans", "Hiragino Sans", /);
  });

  it(`uses Discord's Latin stack, gg sans then Noto Sans, for an English viewer in a browser`, () => {
    const root = mountScene({ ...base, messages: [message()] });
    expect(style(root).fontFamily).toMatch(/^"gg sans", "Noto Sans", /);
  });
});

describe(`the light theme`, () => {
  it(`draws text one weight heavier on a 1x screen, as Discord does, and leaves the dark theme alone`, () => {
    // The browser project renders at 1x; at 2x this rule does not apply.
    expect(window.devicePixelRatio).toBe(1);
    const weightIn = (theme: SceneProps[`theme`]): string[] => {
      const [first] = messagesIn(
        mountScene({ ...base, theme, messages: [message()] })
      );
      const text = find(first, byClass(textDisplayStyles.textDisplay));
      return [
        style(text).fontWeight,
        style(find(first, `h3 span span`)).fontWeight
      ];
    };
    expect(weightIn(`light`)).toStrictEqual([`500`, `600`]);
    expect(weightIn(`dark`)).toStrictEqual([`400`, `500`]);
  });
});
