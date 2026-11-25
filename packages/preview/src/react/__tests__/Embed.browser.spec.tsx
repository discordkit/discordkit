import { describe, expect, it } from "vite-plus/test";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Embed } from "@discordkit/client/messages/types/Embed";
import messageStyles from "../Message.module.css";
import {
  byClass,
  dark,
  expectColor,
  find,
  mountPayload,
  mountScene
} from "./mount.js";

/**
 * Inbou's older features are classic embeds, and its users still see them. Values from Discord build 679963's embed rules: the 4px leading bar, 1px border, 4px radius and 2/16/16/12px padding; the author's 24px round icon; the 16px semibold title; the field grid; the thumbnail column; the footer's 20px icon. The text sizes and line heights are set in Discord's JavaScript and are the commonly measured ones, unverified.
 */

const mountEmbed = (embed: Embed): HTMLElement =>
  find(mountPayload({ embeds: [embed] }), `article`);

const style = (element: Element): CSSStyleDeclaration =>
  getComputedStyle(element);

const user = `1311000000000000102`;

describe(`an embed`, () => {
  it(`draws its colour as a 4px bar down the leading edge, inside a 1px subtle border with 4px corners`, () => {
    const computed = style(mountEmbed({ title: `Correct`, color: 0x4a6b45 }));
    expect(computed.borderLeftWidth).toBe(`4px`);
    expect(computed.borderLeftColor).toBe(`rgb(74, 107, 69)`);
    expect(computed.borderTopWidth).toBe(`1px`);
    expectColor(computed.borderTopColor, dark.borderSubtle);
    expect(computed.borderTopLeftRadius).toBe(`4px`);
    expectColor(computed.backgroundColor, dark.backgroundSurfaceHigh);
  });

  it(`draws the bar in the normal border colour when the embed has no colour`, () => {
    expectColor(
      style(mountEmbed({ title: `Plain` })).borderLeftColor,
      dark.borderNormal
    );
  });

  it(`pads its content 2px above, 16px right and below, and 12px left, with 8px above each part`, () => {
    const embed = mountEmbed({ title: `Title`, description: `Body` });
    const grid = embed.firstElementChild?.firstElementChild;
    if (!grid) throw new Error(`No grid was drawn.`);
    const computed = style(grid);
    expect([
      computed.paddingTop,
      computed.paddingRight,
      computed.paddingBottom,
      computed.paddingLeft
    ]).toStrictEqual([`2px`, `16px`, `16px`, `12px`]);
    for (const part of grid.children) expect(style(part).marginTop).toBe(`8px`);
  });

  it(`draws the author's icon as a 24px circle 8px before a 14px semibold name`, () => {
    const embed = mountEmbed({
      author: { name: `Study Hall`, iconUrl: `https://cdn.example/i.png` }
    });
    const icon = find(embed, `img`);
    expect(icon.getBoundingClientRect().width).toBe(24);
    expect(style(icon).borderTopLeftRadius).toBe(`50%`);
    expect(style(icon).marginRight).toBe(`8px`);
    const name = icon.nextElementSibling;
    if (!name) throw new Error(`No author name was drawn.`);
    expect(style(name).fontSize).toBe(`14px`);
    expect(style(name).fontWeight).toBe(`600`);
    expectColor(style(name).color, dark.textStrong);
  });

  it(`draws its title at 16px semibold in the strong colour, or the link colour when it has a URL`, () => {
    const plain = find(mountEmbed({ title: `Correct` }), `div > div > div`);
    expect(style(plain).fontSize).toBe(`16px`);
    expect(style(plain).fontWeight).toBe(`600`);
    expectColor(style(plain).color, dark.textStrong);
    const link = find(
      mountEmbed({ title: `Guide`, url: `https://example.com` }),
      `a`
    );
    expectColor(style(link).color, dark.textLink);
  });

  it(`leaves a user mention in the title as written, since Discord does not resolve mentions there, but resolves one in the description`, () => {
    const embed = mountEmbed({
      title: `<@${user}> won`,
      description: `<@${user}> got it`
    });
    expect(embed.textContent).toContain(`<@${user}> won`);
    expect(embed.textContent).toContain(`@unknown-user got it`);
  });

  it(`draws a heading in the description but not in a field value`, () => {
    const embed = mountEmbed({
      description: `## 食べます`,
      fields: [{ name: `Notes`, value: `## not a heading` }]
    });
    expect(embed.querySelector(`h2`)?.textContent).toBe(`食べます`);
    expect(embed.textContent).toContain(`## not a heading`);
  });

  it(`sets description and field text at 14px, field names semibold and 2px above their value`, () => {
    const embed = mountEmbed({
      description: `Body`,
      fields: [{ name: `Answer`, value: `食べなかった` }]
    });
    const name = [...embed.querySelectorAll(`div`)].find(
      (element) => element.textContent === `Answer`
    );
    if (!name) throw new Error(`No field name was drawn.`);
    expect(style(name).fontSize).toBe(`14px`);
    expect(style(name).fontWeight).toBe(`600`);
    expect(style(name).marginBottom).toBe(`2px`);
    expect(style(name.nextElementSibling ?? name).fontWeight).toBe(`400`);
  });

  it(`lines up three inline fields side by side, as Inbou's From, Target and Class sit, 8px apart`, () => {
    const embed = mountEmbed({
      fields: [
        { name: `From`, value: `Non-past (polite)`, inline: true },
        { name: `Target`, value: `Past negative (plain)`, inline: true },
        { name: `Class`, value: `Ichidan`, inline: true },
        { name: `Meaning`, value: `to eat` }
      ]
    });
    const fields = [
      ...(embed.querySelector(`div > div > div:last-child`)?.children ?? [])
    ].map((field) => field.getBoundingClientRect());
    expect(fields[0].top).toBe(fields[1].top);
    expect(fields[1].top).toBe(fields[2].top);
    expect(fields[1].left).toBeGreaterThan(fields[0].right);
    expect(fields[3].top - fields[0].bottom).toBe(8);
  });

  it(`puts the thumbnail in its own column 16px from the text, no larger than 80px`, () => {
    const embed = mountEmbed({
      description: `Body`,
      thumbnail: { url: `https://cdn.example/t.png` }
    });
    const thumbnail = find(embed, `img`);
    const holder = thumbnail.parentElement;
    if (!holder) throw new Error(`No thumbnail was drawn.`);
    expect(style(holder).marginLeft).toBe(`16px`);
    expect(thumbnail.getBoundingClientRect().width).toBe(80);
    expect(thumbnail.getBoundingClientRect().height).toBe(80);
  });

  it(`puts the image 16px below the text with 4px corners`, () => {
    const embed = mountEmbed({
      description: `Body`,
      image: { url: `https://cdn.example/i.png` }
    });
    const holder = find(embed, `img`).parentElement;
    if (!holder) throw new Error(`No image was drawn.`);
    expect(style(holder).marginTop).toBe(`16px`);
    expect(style(holder).borderTopLeftRadius).toBe(`4px`);
  });

  it(`ends with the footer: a 20px round icon, 12px text, a bullet and the time against the scene's clock`, () => {
    const root = mountPayload(
      {
        embeds: [
          {
            footer: { text: `Inbou`, iconUrl: `https://cdn.example/f.png` },
            timestamp: `2026-11-25T16:00:00Z`
          }
        ]
      },
      { now: `2026-11-25T16:05:00Z`, timeZone: `UTC` }
    );
    const icon = find(find(root, `article`), `img`);
    expect(icon.getBoundingClientRect().width).toBe(20);
    expect(style(icon).borderTopLeftRadius).toBe(`50%`);
    const text = icon.nextElementSibling;
    if (!text) throw new Error(`No footer text was drawn.`);
    expect(text.textContent).toBe(`Inbou•Today at 4:00 PM`);
    expect(style(text).fontSize).toBe(`12px`);
  });

  it(`stacks several embeds 4px apart`, () => {
    const root = mountPayload({
      embeds: [{ title: `One` }, { title: `Two` }]
    });
    const [first, second] = root.querySelectorAll(`article`);
    expect(
      second.getBoundingClientRect().top - first.getBoundingClientRect().bottom
    ).toBe(4);
  });
});

describe(`a classic message`, () => {
  it(`draws its content as message text, 16px on a 22px line, with "(edited)" after it`, () => {
    const root = mountScene({
      messages: [
        {
          payload: { content: `Type your answer in the channel` },
          edited: true
        }
      ]
    });
    const content = find(root, byClass(messageStyles.content));
    expect(content.textContent).toBe(`Type your answer in the channel(edited)`);
    expect(style(content).fontSize).toBe(`16px`);
    expect(style(content).lineHeight).toBe(`22px`);
  });

  it(`draws its rows of buttons under its embeds, 6px apart`, () => {
    const root = mountPayload({
      embeds: [{ title: `Question 3` }],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Secondary,
              label: `Hint`,
              customId: `h`
            }
          ]
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              label: `End session`,
              customId: `e`
            }
          ]
        }
      ]
    });
    const embed = find(root, `article`).getBoundingClientRect();
    const [hint, end] = [...root.querySelectorAll(`button`)].map((button) =>
      button.getBoundingClientRect()
    );
    expect(hint.top).toBeGreaterThan(embed.bottom);
    expect(end.top - hint.bottom).toBe(6);
  });
});
