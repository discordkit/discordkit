import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { messageComponentSchema } from "../MessageComponent.js";
import { ComponentType } from "../../../components/types/ComponentType.js";

describe(`messageComponentSchema`, () => {
  it(`accepts a Container of TextDisplay, MediaGallery and ActionRow`, () => {
    // The shape a Components V2 message actually takes. Previously
    // unsendable: the top level accepted only ActionRow, so every layout
    // component was modelled and exported but unreachable.
    const result = v.safeParse(messageComponentSchema, [
      {
        type: ComponentType.Container,
        accentColor: 0x2f_4b_6e,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: `## Which hero is this?`
          },
          {
            type: ComponentType.MediaGallery,
            items: [
              {
                media: {
                  url: `https://cdn.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png`
                }
              }
            ]
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: 2,
                label: `Anti-Mage`,
                customId: `vote:0`
              }
            ]
          }
        ]
      }
    ]);

    expect(result.success).toBe(true);
  });

  it(`still accepts a plain V1 action row`, () => {
    // Widening the top level must not stop V1 messages from validating.
    expect(
      v.safeParse(messageComponentSchema, [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: 2,
              label: `Yes`,
              customId: `yes`
            }
          ]
        }
      ]).success
    ).toBe(true);
  });

  it(`accepts a V1 action row holding a select menu`, () => {
    // A select menu can only be sent inside an action row. This also guards response parsing: real messages with a select row failed to parse while the action row took a select only as a bare object.
    expect(
      v.safeParse(messageComponentSchema, [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.StringSelect,
              customId: `hero`,
              options: [{ label: `Anti-Mage`, value: `antimage` }]
            }
          ]
        }
      ]).success
    ).toBe(true);
  });
});

const text = (content: string) => ({
  type: ComponentType.TextDisplay,
  content
});

const container = (components: unknown[]) => ({
  type: ComponentType.Container,
  components
});

const button = (customId: string) => ({
  type: ComponentType.Button,
  style: 2,
  label: customId,
  customId
});

const texts = (count: number) =>
  Array.from({ length: count }, (_, i) => text(`Line ${i}`));

describe(`messageComponentSchema limits across the component tree`, () => {
  // Discord allows 40 components in a Components V2 message, counted across the whole tree, not just the top level. A payload over the limit used to validate here and then fail at the API, which is the failure this schema exists to catch early.

  it(`accepts 40 components counted with their nesting`, () => {
    // 1 container + 39 text displays = 40.
    expect(
      v.safeParse(messageComponentSchema, [container(texts(39))]).success
    ).toBe(true);
  });

  it(`rejects 41 components even when only one is at the top level`, () => {
    // 1 container + 40 text displays = 41. The old check counted 1.
    const result = v.safeParse(messageComponentSchema, [container(texts(40))]);

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/41 components/);
    expect(result.issues?.[0].message).toMatch(/at most 40/);
  });

  it(`counts the buttons inside action rows`, () => {
    // 1 container + 7 action rows + 35 buttons = 43. Counting rows but not their children would see 8.
    const rows = Array.from({ length: 7 }, (_, r) => ({
      type: ComponentType.ActionRow,
      components: Array.from({ length: 5 }, (_, b) => button(`r${r}b${b}`))
    }));

    expect(v.safeParse(messageComponentSchema, [container(rows)]).success).toBe(
      false
    );
  });

  it(`counts a section's accessory`, () => {
    // 1 container + 13 sections × (section + text + button accessory) + 1 text display = 41. Without the accessories it would be 28.
    const sections = Array.from({ length: 13 }, (_, i) => ({
      type: ComponentType.Section,
      components: [text(`Item ${i}`)],
      accessory: button(`open:${i}`)
    }));

    expect(
      v.safeParse(messageComponentSchema, [
        container([...sections, text(`Footer`)])
      ]).success
    ).toBe(false);
  });

  it(`accepts text displays totalling 4000 characters`, () => {
    expect(
      v.safeParse(messageComponentSchema, [
        text(`a`.repeat(2000)),
        text(`b`.repeat(2000))
      ]).success
    ).toBe(true);
  });

  it(`rejects text displays totalling more than 4000 characters, wherever they are nested`, () => {
    // Discord caps the combined length of every text display in a message at 4000 characters. Text inside containers and sections counts the same as text at the top level.
    const result = v.safeParse(messageComponentSchema, [
      text(`a`.repeat(1000)),
      container([
        text(`b`.repeat(1000)),
        {
          type: ComponentType.Section,
          components: [text(`c`.repeat(2001))],
          accessory: button(`more`)
        }
      ])
    ]);

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/4001 characters/);
    expect(result.issues?.[0].message).toMatch(/at most 4000/);
  });
});
