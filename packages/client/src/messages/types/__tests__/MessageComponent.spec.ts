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
});
