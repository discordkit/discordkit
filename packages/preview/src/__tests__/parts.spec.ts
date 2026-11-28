import { describe, expect, it } from "vite-plus/test";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import {
  fidelitySummary,
  parts,
  sceneParts,
  viewportFidelity
} from "../parts.js";
import type { Scene } from "../scene.js";
import { resolveViewport } from "../viewport.js";
import {
  componentFixtures,
  fixtures,
  iosAnswerCard,
  iosGalleries,
  iosMixed,
  iosQuestionCard,
  iosSections
} from "./fixtures.js";
import {
  checkboxSheet,
  legacyTextInputSheet,
  modalFilled,
  modalOpening,
  radioGroupSheet
} from "./modalFixtures.js";

/**
 * Which parts of a scene each viewport draws from rules nobody has observed on its platform. What this holds to: an iPhone drawing of a card built only from what the captures of the app show carries no warning, one holding anything else names exactly that, an iPad (never captured) warns about everything, desktop warns about nothing (it draws from Discord's own stylesheet), and the walk finds a part wherever the components would draw it.
 */

const iphone = resolveViewport({ device: `iphone-14-pro` });
const ipad = resolveViewport({ device: `ipad-mini` });
const desktop = resolveViewport({ device: `desktop-1280x800` });
const android = resolveViewport({ device: `pixel-7` });

const card = (
  ...components: NonNullable<Scene[`messages`][number][`payload`][`components`]>
): Scene => ({
  messages: [
    {
      payload: {
        flags: MessageFlag.IS_COMPONENTS_V2,
        components: [{ type: ComponentType.Container, components } as never]
      }
    }
  ]
});

const text = (content: string): never =>
  ({ type: ComponentType.TextDisplay, content }) as never;

const unobserved = (scene: Scene): string[] =>
  viewportFidelity(scene, iphone).unobserved.map(({ part }) => part);

describe(`the parts list`, () => {
  it(`names a capture of the app for every part the iOS layout draws from observation, and none for a part it does not`, () => {
    for (const info of Object.values(parts)) {
      if (info.ios !== null) expect(info.ios).toMatch(/tome-\d{3}/);
    }
    // What §7b says was never captured on iOS stays unobserved.
    for (const part of [
      `embed`,
      `subtext`,
      `blockQuote`,
      `list`,
      `codeBlock`,
      `mention`,
      `emoji`,
      `heading1`,
      `heading3`,
      `primaryButton`,
      `dangerButton`,
      `disabledButton`,
      `linkButton`,
      `buttonEmoji`,
      `select`,
      `file`,
      `spoiler`,
      `galleryLarge`,
      `topLevel`,
      `edited`,
      `ephemeral`,
      `groupedMessage`,
      `lightTheme`
    ] as const) {
      expect(parts[part].ios).toBeNull();
    }
  });
});

describe(`an iPhone's report`, () => {
  it.each(
    Object.entries({
      iosQuestionCard,
      iosGalleries,
      iosSections,
      iosAnswerCard
    })
  )(
    `is empty for %s, which holds only what the captures of the app show, so its drawing needs no warning`,
    (_, scene) => {
      expect(viewportFidelity(scene, iphone)).toStrictEqual({
        unobserved: [],
        limits: []
      });
      expect(fidelitySummary({ unobserved: [], limits: [] }, iphone)).toMatch(
        /Every part of this message was drawn as measured from the iOS app/
      );
    }
  );

  it(`names each unobserved part of a mixed scene, and only those, in the parts list's order, so it reads the same every time`, () => {
    expect(unobserved(iosMixed)).toStrictEqual([
      `embed`,
      `subtext`,
      `emoji`,
      `dangerButton`
    ]);
    expect(fidelitySummary(viewportFidelity(iosMixed, iphone), iphone)).toBe(
      `Not yet seen in the iOS app, so drawn from desktop's design at the app's sizes: classic embed, subtext, emoji, danger button. Check these on a real phone.`
    );
  });

  it(`says Unicode emoji are drawn as Twemoji where the app draws Apple's, whenever the scene has one, in text or on a button`, () => {
    expect(viewportFidelity(iosMixed, iphone).limits).toStrictEqual([
      expect.stringMatching(/Twemoji, where the iOS app draws Apple's/)
    ]);
    const button = card({
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          customId: `x`,
          emoji: { name: `✅` }
        }
      ]
    } as never);
    expect(viewportFidelity(button, iphone).limits).toHaveLength(1);
    // A server's own emoji is an image the app draws as we do.
    expect(
      viewportFidelity(card(text(`<:wave:1311000000000000900>`)), iphone).limits
    ).toStrictEqual([]);
  });

  it(`finds a part wherever it sits: inside a heading, a list item, a section's text or a quote`, () => {
    expect(unobserved(card(text(`## Title with \`code\``)))).toStrictEqual([
      `inlineCode`
    ]);
    expect(unobserved(card(text(`- item with <@1>`)))).toStrictEqual([
      `list`,
      `mention`
    ]);
    expect(
      unobserved(
        card({
          type: ComponentType.Section,
          components: [text(`> quoted ||secret||`)],
          accessory: {
            type: ComponentType.Thumbnail,
            media: { url: `attachment://x.png` }
          }
        } as never)
      )
    ).toStrictEqual([`blockQuote`, `spoiler`]);
  });

  it(`tells a relative timestamp, which the app was seen drawing, from a date or time, which it was not`, () => {
    expect(unobserved(card(text(`<t:1795604745:R>`)))).toStrictEqual([]);
    expect(unobserved(card(text(`<t:1795604745:F>`)))).toStrictEqual([
      `timestamp`
    ]);
  });

  it(`reports a theme other than Dark, the only one captured in the app`, () => {
    expect(unobserved({ ...iosQuestionCard, theme: `light` })).toStrictEqual([
      `lightTheme`
    ]);
    expect(unobserved({ ...iosQuestionCard, theme: `dark` })).toStrictEqual([]);
  });

  it(`reports a message continuing a group, an edit and an ephemeral reply, none of which the app was seen drawing`, () => {
    const message = iosQuestionCard.messages[0];
    expect(
      unobserved({
        ...iosQuestionCard,
        messages: [message, { ...message, edited: true, ephemeral: false }]
      })
    ).toStrictEqual([`groupedMessage`, `edited`]);
    expect(
      unobserved({
        ...iosQuestionCard,
        messages: [{ ...message, ephemeral: true }]
      })
    ).toStrictEqual([`ephemeral`]);
  });

  it(`walks every bot card without throwing, and lists the same parts in every run`, () => {
    for (const scene of Object.values({ ...fixtures, ...componentFixtures })) {
      expect(sceneParts(scene)).toStrictEqual(sceneParts(scene));
    }
  });
});

describe(`modals on an iPhone`, () => {
  it(`reports every part of a modal as unobserved, since no modal has been captured in the app`, () => {
    for (const part of [
      `modal`,
      `modalLabel`,
      `shortTextInput`,
      `paragraphTextInput`,
      `modalSelect`,
      `fileUpload`,
      `radioGroup`,
      `checkboxGroup`,
      `checkbox`,
      `modalError`
    ] as const) {
      expect(parts[part].ios).toBeNull();
    }
    expect(unobserved(modalFilled)).toEqual(
      expect.arrayContaining([
        `modal`,
        `modalLabel`,
        `shortTextInput`,
        `paragraphTextInput`,
        `modalSelect`,
        `fileUpload`,
        `modalError`
      ])
    );
  });

  it(`finds each field by its type, and an error only where Submit would show one`, () => {
    expect(sceneParts(radioGroupSheet).parts).toEqual(
      expect.arrayContaining([`radioGroup`, `modalError`])
    );
    expect(sceneParts(checkboxSheet).parts).toContain(`checkbox`);
    // A checkbox cannot be required, so its sheet shows no error even after Submit.
    expect(sceneParts(checkboxSheet).parts).not.toContain(`modalError`);
    expect(sceneParts(modalOpening).parts).not.toContain(`modalError`);
    expect(sceneParts(legacyTextInputSheet).parts).toEqual(
      expect.arrayContaining([`text`, `shortTextInput`, `paragraphTextInput`])
    );
  });

  it(`says so in the caption`, () => {
    expect(
      fidelitySummary(viewportFidelity(checkboxSheet, iphone), iphone)
    ).toMatch(/Not yet seen in the iOS app.*modal.*checkbox/);
  });
});

describe(`other viewports' reports`, () => {
  it(`lists every part of the scene on an iPad, which asks for the iOS layout but has never been captured`, () => {
    const found = viewportFidelity(iosQuestionCard, ipad);
    expect(found.unobserved.map(({ part }) => part)).toStrictEqual(
      sceneParts(iosQuestionCard).parts
    );
    expect(fidelitySummary(found, ipad)).toMatch(
      /Nothing has been captured on this device/
    );
  });

  it(`is empty on desktop, which draws every part from Discord's own stylesheet, and on Android, whose note already says it is not the app`, () => {
    for (const viewport of [desktop, android]) {
      expect(viewportFidelity(iosMixed, viewport)).toStrictEqual({
        unobserved: [],
        limits: []
      });
      expect(
        fidelitySummary(viewportFidelity(iosMixed, viewport), viewport)
      ).toBeNull();
    }
  });
});
