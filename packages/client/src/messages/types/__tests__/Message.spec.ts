import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { messageSchema } from "../Message.js";
import { ComponentType } from "../../../components/types/ComponentType.js";

describe(`messageSchema`, () => {
  it(`accepts the flat components array Discord sends`, () => {
    // `messageComponentSchema` is itself an array, so wrapping it in
    // `v.array()` produced `ActionRow[][]` — a shape Discord never sends,
    // which meant parsing a real message with components failed.
    const result = v.safeParse(messageSchema, {
      id: `1234567890123456789`,
      channelId: `1234567890123456789`,
      author: {
        id: `1234567890123456789`,
        username: `someone`,
        discriminator: `0001`,
        globalName: null,
        avatar: null
      },
      content: ``,
      timestamp: new Date().toISOString(),
      editedTimestamp: null,
      tts: false,
      mentionEveryone: false,
      mentions: [],
      mentionRoles: [],
      attachments: [],
      embeds: [],
      pinned: false,
      type: 0,
      flags: 0,
      components: [
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
      ]
    });

    expect(result.success).toBe(true);
  });
});
