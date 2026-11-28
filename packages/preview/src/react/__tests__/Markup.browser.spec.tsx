import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { transparentPixel } from "../Image.js";
import imageStyles from "../Image.module.css";
import {
  byClass,
  dark,
  expectColor,
  find,
  findCheckbox,
  findElement,
  mountComponents,
  mountText
} from "./mount.js";

/**
 * Each construct of Discord's markdown, drawn in a real browser and read back as computed styles, against the values measured from Discord's own stylesheet (web client build 679963). These are what made Inbou's and Tome's cards hard to judge without the real client: which lines were headings or subtext, how emphasis read, what a mention or a countdown looked like. Text is in a container unless a case says otherwise, since that is where both bots put it; there Discord draws markup at its reduced 14px size.
 */

const style = (element: Element, pseudo?: string): CSSStyleDeclaration =>
  getComputedStyle(element, pseudo);

const px = (value: string): number => Number.parseFloat(value);

describe(`headings`, () => {
  it.each([
    [`#`, `h1`, 24],
    [`##`, `h2`, 20],
    [`###`, `h3`, 16]
  ])(
    `draws %s as a bold %s at Discord's %ipx, a line height of 1.375em, in the strong text colour, unaffected by the container's reduced size`,
    (hashes, tag, size) => {
      const heading = find(mountText(`${hashes} Round 3`), tag);
      const computed = style(heading);
      expect(px(computed.fontSize)).toBe(size);
      expect(computed.fontWeight).toBe(`700`);
      expect(px(computed.lineHeight)).toBeCloseTo(size * 1.375, 2);
      expectColor(computed.color, dark.textStrong);
    }
  );

  it(`styles only its own line: the next line is body text`, () => {
    const text = mountText(`## Round 3\nWhich hero is this?`);
    expect(find(text, `h2`).textContent).toBe(`Round 3`);
    expect(text.lastChild?.textContent).toBe(`Which hero is this?`);
  });

  it(`has no top margin as a text display's first line, and Discord's 16px above and 8px below otherwise`, () => {
    const text = mountText(`## First\n### Second\n-# after`);
    const [first, second] = [find(text, `h2`), find(text, `h3`)];
    expect(style(first).marginTop).toBe(`0px`);
    expect(style(first).marginBottom).toBe(`8px`);
    expect(style(second).marginTop).toBe(`16px`);
    // Followed by subtext, an element, so it keeps its bottom margin.
    expect(style(second).marginBottom).toBe(`8px`);
  });

  it(`loses its bottom margin when no element follows it, even with text after, as Discord's text display rule has it`, () => {
    const text = mountText(`### Options\nplain text after`);
    expect(style(find(text, `h3`)).marginBottom).toBe(`0px`);
  });

  it(`does not look bolder for bold inside it, because the heading is already bold`, () => {
    const heading = find(mountText(`## Plain **bold**`), `h2`);
    expect(style(find(heading, `strong`)).fontWeight).toBe(
      style(heading).fontWeight
    );
  });
});

describe(`subtext`, () => {
  it(`draws -# as its own block in the subtle colour at Discord's reduced 12px with a 16.5px line inside a container`, () => {
    const small = find(mountText(`-# Answer by the timer`), `small`);
    const computed = style(small);
    expect(computed.display).toBe(`block`);
    expect(computed.fontSize).toBe(`12px`);
    expect(px(computed.lineHeight)).toBeCloseTo(16.5, 2);
    expectColor(computed.color, dark.textSubtle);
  });

  it(`is 14px with a 1.20313rem line at the top level of a message`, () => {
    const small = find(mountText(`-# fine print`, { topLevel: true }), `small`);
    expect(style(small).fontSize).toBe(`14px`);
    expect(px(style(small).lineHeight)).toBeCloseTo(19.25, 1);
  });
});

describe(`inline styles`, () => {
  const text = (): HTMLElement =>
    mountText(`**b** *i* __u__ ~~s~~ [label](https://example.com)`);

  it(`draws bold at weight 700 and italic slanted`, () => {
    const root = text();
    expect(style(find(root, `strong`)).fontWeight).toBe(`700`);
    expect(style(find(root, `em`)).fontStyle).toBe(`italic`);
  });

  it(`draws __text__ underlined and ~~text~~ struck through, not as bold or italic`, () => {
    const root = text();
    expect(style(find(root, `u`)).textDecorationLine).toBe(`underline`);
    expect(style(find(root, `u`)).fontWeight).toBe(`400`);
    expect(style(find(root, `s`)).textDecorationLine).toBe(`line-through`);
  });

  it(`draws a link in the link colour with no underline, since Discord underlines only on hover by default`, () => {
    const link = find(text(), `a`);
    expectColor(style(link).color, dark.textLink);
    expect(style(link).textDecorationLine).toBe(`none`);
    expect(link.getAttribute(`href`)).toBe(`https://example.com`);
    expect(link.textContent).toBe(`label`);
  });
});

describe(`code`, () => {
  it(`draws inline code at 85% of the text size, in a 1px bordered, 4px rounded box on the code background`, () => {
    const code = find(mountText(`count \`3\``), `code`);
    const computed = style(code);
    expect(px(computed.fontSize)).toBeCloseTo(14 * 0.85, 2);
    expect(computed.borderTopWidth).toBe(`1px`);
    expect(computed.borderTopStyle).toBe(`solid`);
    expectColor(computed.borderTopColor, dark.borderNormal);
    expect(computed.borderTopLeftRadius).toBe(`4px`);
    expectColor(computed.backgroundColor, dark.backgroundCode);
    // 0.2em of its own size on each side.
    expect(px(computed.paddingLeft)).toBeCloseTo(14 * 0.85 * 0.2, 2);
  });

  it(`leaves lines holding inline code and fallback-font bars 19.25px apart, as the desktop client keeps a vote chart's rows, whatever code font this machine has`, () => {
    const rows = [`A`, `B`, `C`, `D`].map(
      (letter, index) => `\`${letter}\` ░░░░██████ \`${String(index)}\` 4700`
    );
    const text = mountText(rows.join(`\n`));
    expect(text.getBoundingClientRect().height).toBe(4 * 19.25);
  });

  it(`draws a code block as a padded, bordered box at 14px on an 18px line, 6px below what precedes it, across the text display's full width`, () => {
    const text = mountText("before\n```\nconst x = 1;\n```");
    const pre = find(text, `pre`);
    const code = find(pre, `code`);
    expect(style(pre).marginTop).toBe(`6px`);
    expect(style(pre).maxWidth).toBe(`none`);
    expect(style(code).fontSize).toBe(`14px`);
    expect(style(code).lineHeight).toBe(`18px`);
    expect(style(code).paddingTop).toBe(`7px`);
    expect(style(code).borderTopLeftRadius).toBe(`4px`);
    expectColor(style(code).color, dark.textCode);
    expect(code.textContent).toBe(`const x = 1;`);
  });
});

describe(`block quotes`, () => {
  it(`draws a 4px rounded bar in the spine colour beside the quote, 12px from the text`, () => {
    const text = mountText(`> _The star fell for a hundred nights._`);
    const quote = find(text, `blockquote`);
    const bar = quote.previousElementSibling;
    if (!bar) throw new Error(`The quote has no bar.`);
    expect(style(bar).width).toBe(`4px`);
    expect(style(bar).borderTopLeftRadius).toBe(`4px`);
    expectColor(style(bar).backgroundColor, dark.spineDefault);
    expect(style(quote).paddingLeft).toBe(`12px`);
    expect(style(quote).paddingRight).toBe(`8px`);
    // The bar runs the quote's full height.
    expect(bar.getBoundingClientRect().height).toBe(
      quote.getBoundingClientRect().height
    );
  });

  it(`sets the quoted text in the subtle colour, with Discord's 4px above and below the quote`, () => {
    const text = mountText(`> quoted`);
    const quote = find(text, `blockquote`);
    expectColor(style(quote).color, dark.textSubtle);
    const container = quote.parentElement;
    if (!container) throw new Error(`The quote has no container.`);
    expect(style(container).marginTop).toBe(`4px`);
    expect(style(container).marginBottom).toBe(`4px`);
  });
});

describe(`lists`, () => {
  it(`indents a bulleted list 16px with discs, nested lists with circles, and 4px under each item`, () => {
    const text = mountText(`- one\n- two\n  - nested`);
    const outer = find(text, `ul`);
    const inner = find(outer, `ul`);
    expect(style(outer).marginLeft).toBe(`16px`);
    expect(style(outer).listStyleType).toBe(`disc`);
    expect(style(inner).listStyleType).toBe(`circle`);
    expect(style(find(outer, `li`)).marginBottom).toBe(`4px`);
  });

  it(`numbers from the number the list was written with, and indents for the widest number`, () => {
    const items = Array.from(
      { length: 8 },
      (_, index) => `${String(index + 3)}. item`
    ).join(`\n`);
    const list = find(mountText(items), `ol`);
    expect(list.getAttribute(`start`)).toBe(`3`);
    expect(style(list).listStyleType).toBe(`decimal`);
    // Numbers run to 10, two characters: 0.4em + 2 × 0.6em at 14px.
    expect(px(style(list).marginLeft)).toBeCloseTo(14 * 1.6, 1);
  });
});

describe(`spoilers`, () => {
  it(`hides the text under a 4px rounded bar in the hidden-spoiler colour, as a posted message shows it`, () => {
    const text = mountText(`The answer is ||Fallen Sky <@1>||.`);
    const label = find(text, `label`);
    const content = find(label, `span`);
    expectColor(style(content).backgroundColor, dark.spoilerHidden);
    expect(style(content).borderTopLeftRadius).toBe(`4px`);
    expect(style(content).color).toBe(`rgba(0, 0, 0, 0)`);
    // A mention pill paints its own colours, so it is faded out rather than recoloured.
    expect(style(find(content, `span`)).opacity).toBe(`0`);
  });

  it(`reveals on a click with no script, through the label's hidden checkbox`, () => {
    const text = mountText(`||Fallen Sky||`);
    const label = find(text, `label`);
    const content = find(label, `span`);
    label.click();
    expect(findCheckbox(label).checked).toBe(true);
    expectColor(style(content).backgroundColor, dark.backgroundModSubtle);
    expectColor(style(content).color, dark.textDefault);
  });

  it(`draws every spoiler revealed when the scene asks, for checking what is underneath`, () => {
    const text = mountText(`||Fallen Sky||`, { revealSpoilers: true });
    expect(findCheckbox(text).checked).toBe(true);
    expectColor(
      style(find(find(text, `label`), `span`)).backgroundColor,
      dark.backgroundModSubtle
    );
  });
});

describe(`mentions`, () => {
  const context = {
    users: { "10": { name: `Emberwing` } },
    roles: {
      "20": { name: `Moderators`, color: 0xe91e63 },
      "21": { name: `Plain` }
    },
    channels: { "30": { name: `general` } }
  };
  const mentions = (content: string): HTMLElement[] => [
    ...mountText(content, { context }).querySelectorAll<HTMLElement>(
      `:scope > span`
    )
  ];

  it(`draws a user mention as Discord's pill: medium weight, 3px corners, 2px side padding, in the mention colours`, () => {
    const [pill] = mentions(`<@10>`);
    expect(pill.textContent).toBe(`@Emberwing`);
    const computed = style(pill);
    expectColor(computed.color, dark.mentionForeground);
    expectColor(computed.backgroundColor, dark.mentionBackground);
    expect(computed.fontWeight).toBe(`500`);
    expect(computed.borderTopLeftRadius).toBe(`3px`);
    expect(computed.paddingLeft).toBe(`2px`);
    expect(computed.paddingTop).toBe(`0px`);
  });

  it(`shows an id the scene does not know the way Discord does`, () => {
    expect(
      mentions(`<@99> <@&99> <#99>`).map((pill) => pill.textContent)
    ).toStrictEqual([`@unknown-user`, `@deleted-role`, `unknown`]);
  });

  it(`draws a role mention in its role's colour on a 10% tint of it`, () => {
    const [pill] = mentions(`<@&20>`);
    expect(pill.textContent).toBe(`@Moderators`);
    expectColor(style(pill).color, [233, 30, 99]);
    expectColor(style(pill).backgroundColor, [233, 30, 99, 0.1]);
  });

  it(`draws a role with no colour in the default mention colours`, () => {
    const [pill] = mentions(`<@&21>`);
    expectColor(style(pill).color, dark.mentionForeground);
    expectColor(style(pill).backgroundColor, dark.mentionBackground);
  });

  it(`draws a channel mention with a 1em icon before the name`, () => {
    const [pill] = mentions(`<#30>`);
    expect(pill.textContent).toBe(`general`);
    const icon = findElement(pill, `svg`);
    expect(style(icon).width).toBe(style(pill).fontSize);
    expect(style(icon).marginRight).toBe(`4px`);
  });

  it(`draws @everyone, a command and a server page as pills with their text`, () => {
    expect(
      mentions(`@everyone </trivia start:1> <id:browse>`).map(
        (pill) => pill.textContent
      )
    ).toStrictEqual([`@everyone`, `/trivia start`, `Browse Channels`]);
  });
});

describe(`timestamps`, () => {
  const scene = {
    now: `2026-11-25T16:05:00Z`,
    timeZone: `Asia/Tokyo`,
    locale: `en-US`
  };
  const ends = Date.parse(scene.now) / 1000 + 45;

  it(`counts down against the scene's clock, so a 45-second timer reads the same on any day`, () => {
    const pill = find(mountText(`ends <t:${String(ends)}:R>`, scene), `span`);
    expect(pill.textContent).toBe(`in 45 seconds`);
  });

  it(`writes the time in the scene's zone and locale`, () => {
    const pill = find(mountText(`<t:${String(ends)}:t>`, scene), `span`);
    // 16:05:45 UTC is 1:05 AM the next day in Tokyo.
    expect(pill.textContent).toBe(`1:05 AM`);
  });

  it(`draws the time in Discord's pill: a 3px rounded box on the normal modifier background`, () => {
    const pill = find(mountText(`<t:${String(ends)}:t>`, scene), `span`);
    expectColor(style(pill).backgroundColor, dark.backgroundModNormal);
    expect(style(pill).borderTopLeftRadius).toBe(`3px`);
    expect(style(pill).paddingLeft).toBe(`2px`);
  });
});

describe(`emoji`, () => {
  /** Hands every image a blank pixel and records what was asked for, so nothing loads from the network. */
  const recording = (): {
    asked: string[];
    assetUrl: (url: string) => string;
  } => {
    const asked: string[] = [];
    return {
      asked,
      assetUrl: (url) => {
        asked.push(url);
        return transparentPixel;
      }
    };
  };

  it(`draws a Unicode emoji as its Twemoji image, sized 1.375em of the text around it`, () => {
    const { asked, assetUrl } = recording();
    const image = find(mountText(`Correct ✅`, { assetUrl }), `img`);
    // The message's avatar is asked for too.
    expect(asked).toContain(
      `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/2705.svg`
    );
    expect(image.getAttribute(`alt`)).toBe(`✅`);
    expect(px(style(image).width)).toBeCloseTo(14 * 1.375, 2);
    expect(px(style(image).height)).toBeCloseTo(14 * 1.375, 2);
    expect(style(image).verticalAlign).toBe(`bottom`);
  });

  it(`draws emoji at Discord's 48px jumbo size when the text is only emoji`, () => {
    const { assetUrl } = recording();
    const images = [
      ...mountText(`🥇 <:blob:42>`, { assetUrl }).querySelectorAll(`img`)
    ];
    expect(images).toHaveLength(2);
    for (const image of images) expect(style(image).width).toBe(`48px`);
  });

  it(`draws a custom emoji from Discord's CDN, with :name: as its alt text`, () => {
    const { asked, assetUrl } = recording();
    const image = find(mountText(`gg <:blob:42>`, { assetUrl }), `img`);
    expect(asked).toContain(
      `https://cdn.discordapp.com/emojis/42.webp?size=96&quality=lossless`
    );
    expect(image.getAttribute(`alt`)).toBe(`:blob:`);
  });

  it(`draws an image that is not available as an empty box of the same size, as Discord shows an image still loading`, () => {
    const image = find(mountText(`Correct ✅`), `img`);
    expect(image.matches(byClass(imageStyles.placeholder))).toBe(true);
    expectColor(style(image).backgroundColor, dark.backgroundModSubtle);
    expect(px(style(image).width)).toBeCloseTo(14 * 1.375, 2);
  });
});

describe(`text size`, () => {
  it(`keeps a top-level text display at Discord's full 16px message size`, () => {
    const root = mountComponents([
      { type: ComponentType.TextDisplay, content: `**top level**` }
    ]);
    expect(style(find(root, `strong`)).fontSize).toBe(`16px`);
  });
});
