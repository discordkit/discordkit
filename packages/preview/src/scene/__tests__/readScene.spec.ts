import { describe, expect, it } from "vite-plus/test";
import { toSnakeKeys } from "@discordkit/core/utils/toSnakeKeys";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import {
  buttonSheet,
  embedSheet,
  fixtures,
  gallerySheet
} from "../../__tests__/fixtures.js";
import inbouQuestionWire from "../../__tests__/wire/inbou-question.json" with { type: "json" };
import { readScene } from "../intake.js";

const scenes = { ...fixtures, buttonSheet, embedSheet, gallerySheet };

describe(`readScene: what the input is`, () => {
  it(`reads Inbou's question card as the snake_case JSON a logged request shows, and gives back the same payload Inbou builds in camelCase`, () => {
    // The usual way an agent meets a payload is as Discord's wire format, copied from a log or the docs. It must come out as the object the bot's own code would build.
    const result = readScene(JSON.stringify(inbouQuestionWire));
    expect(result.kind).toBe(`message`);
    expect(result.findings).toStrictEqual([]);
    expect(result.scene?.messages[0]?.payload).toStrictEqual(
      fixtures.inbouQuestion.messages[0]?.payload
    );
  });

  it.each(Object.entries(scenes))(
    `reads the %s fixture from snake_case JSON back into the scene it came from, with no findings`,
    (_, scene) => {
      const result = readScene(JSON.stringify(toSnakeKeys(scene)));
      expect(result.kind).toBe(`scene`);
      expect(result.findings).toStrictEqual([]);
      expect(result.scene).toStrictEqual(scene);
    }
  );

  it(`accepts a bare array of layout components and adds the Components V2 flag they need, so the renderer and lint treat them as the V2 message they must be`, () => {
    const result = readScene([{ type: 10, content: `Round 3` }]);
    expect(result.kind).toBe(`components`);
    expect(result.scene?.messages[0]?.payload).toStrictEqual({
      flags: MessageFlag.IS_COMPONENTS_V2,
      components: [{ type: ComponentType.TextDisplay, content: `Round 3` }]
    });
  });

  it(`does not add the flag to bare action rows, which a classic message can send`, () => {
    const row = {
      type: 1,
      components: [{ type: 2, style: 2, label: `Hint`, custom_id: `hint` }]
    };
    const result = readScene([row]);
    expect(result.scene?.messages[0]?.payload.flags).toBeUndefined();
  });

  it(`accepts one component on its own, as an agent might paste it`, () => {
    const result = readScene({
      type: 17,
      accent_color: 0x2f4b6e,
      components: []
    });
    expect(result.kind).toBe(`component`);
    expect(result.scene?.messages[0]?.payload.components).toStrictEqual([
      { type: ComponentType.Container, accentColor: 0x2f4b6e, components: [] }
    ]);
  });

  it(`says what it got when the input is none of the shapes it reads, instead of throwing`, () => {
    for (const input of [42, null, undefined, { hello: `world` }]) {
      const result = readScene(input);
      expect(result.kind).toBe(`unknown`);
      expect(result.scene).toBeUndefined();
      expect(result.findings.map(({ code }) => code)).toStrictEqual([
        `input-unrecognised`
      ]);
    }
  });

  it(`reports a string that is not JSON as a finding rather than an exception`, () => {
    const result = readScene(`{"components": [`);
    expect(result.findings.map(({ code }) => code)).toStrictEqual([
      `input-json`
    ]);
  });
});

describe(`readScene: key conversion`, () => {
  it(`normalises a payload that mixes snake_case and camelCase, as a half-converted payload does`, () => {
    const result = readScene({
      flags: 32768,
      components: [
        {
          type: 17,
          accent_color: 1,
          components: [
            {
              type: 1,
              components: [
                { type: 2, style: 1, label: `Go`, customId: `go` },
                { type: 2, style: 1, label: `Stop`, custom_id: `stop` }
              ]
            }
          ]
        }
      ]
    });
    expect(result.findings).toStrictEqual([]);
    expect(result.scene?.messages[0]?.payload.components).toStrictEqual([
      {
        type: 17,
        accentColor: 1,
        components: [
          {
            type: 1,
            components: [
              { type: 2, style: 1, label: `Go`, customId: `go` },
              { type: 2, style: 1, label: `Stop`, customId: `stop` }
            ]
          }
        ]
      }
    ]);
  });

  it(`keeps the keys of a scene's context as written, because they are ids and file names, not field names`, () => {
    // `my_card.webp` converted to `myCard.webp` would no longer match the `attachment://my_card.webp` the payload names.
    const result = readScene({
      time_zone: `Asia/Tokyo`,
      context: {
        users: {
          "80351110224678912": {
            name: `Nelly`,
            avatar: `attachment://nelly_avatar.png`
          }
        },
        attachments: {
          "my_card.webp": { path: `./my_card.webp` },
          "nelly_avatar.png": { path: `./nelly_avatar.png` }
        }
      },
      messages: [
        {
          payload: {
            flags: 32768,
            components: [
              {
                type: 12,
                items: [{ media: { url: `attachment://my_card.webp` } }]
              }
            ]
          }
        }
      ]
    });
    expect(result.findings).toStrictEqual([]);
    expect(result.scene?.timeZone).toBe(`Asia/Tokyo`);
    expect(Object.keys(result.scene?.context?.attachments ?? {})).toStrictEqual(
      [`my_card.webp`, `nelly_avatar.png`]
    );
    expect(Object.keys(result.scene?.context?.users ?? {})).toStrictEqual([
      `80351110224678912`
    ]);
  });

  it(`warns when one field is given in both spellings, and keeps the camelCase one, since only one can be sent`, () => {
    const result = readScene({
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              label: `Hint`,
              custom_id: `old`,
              customId: `new`
            }
          ]
        }
      ]
    });
    expect(result.findings).toMatchObject([
      {
        code: `duplicate-key`,
        severity: `warning`,
        path: [`components`, 0, `components`, 0, `custom_id`]
      }
    ]);
    expect(result.scene?.messages[0]?.payload.components?.[0]).toMatchObject({
      components: [{ customId: `new` }]
    });
  });
});

describe(`readScene: validation against the client's schemas`, () => {
  it(`points a finding at the field as the caller spelled it, so an agent editing snake_case JSON can find it`, () => {
    const result = readScene({
      flags: 32768,
      components: [{ type: 17, accent_color: `blue`, components: [] }]
    });
    expect(result.findings).toMatchObject([
      {
        code: `schema`,
        severity: `error`,
        path: [`components`, 0, `accent_color`]
      }
    ]);
  });

  it(`reports only what is wrong with a component, not every shape a union in the schema tried`, () => {
    // Valibot reports a failed union with every branch's issues mixed together; a text display missing its content inside a container would otherwise come back as dozens of findings about action rows and sections.
    const result = readScene({
      flags: 32768,
      components: [{ type: 17, components: [{ type: 10 }] }]
    });
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      code: `schema`,
      path: [`components`, 0, `components`, 0, `content`]
    });
    expect(result.findings[0]?.message).toMatch(/`content` is missing/);
  });

  it(`reports a valid component in a place that does not allow it as a position error`, () => {
    const result = readScene({
      flags: 32768,
      components: [{ type: 17, components: [{ type: 17, components: [] }] }]
    });
    expect(result.findings).toMatchObject([
      { code: `schema-position`, path: [`components`, 0, `components`, 0] }
    ]);
  });

  it(`uses the schema's verdict on a length limit it does enforce`, () => {
    const result = readScene({
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 2, label: `x`.repeat(81), custom_id: `a` }
          ]
        }
      ]
    });
    expect(result.findings).toMatchObject([
      { code: `schema`, path: [`components`, 0, `components`, 0, `label`] }
    ]);
    expect(result.findings[0]?.message).toMatch(/81 characters long/);
  });

  it(`points findings about a bare components array at the array itself`, () => {
    const result = readScene([{ type: 10, content: 5 }]);
    expect(result.findings).toMatchObject([{ path: [0, `content`] }]);
  });
});

describe(`readScene: the scene around the payloads`, () => {
  it(`reports a clock, zone or theme the renderer cannot use, with the renderer's own explanation`, () => {
    // These would otherwise surface as an exception from deep inside a render.
    const result = readScene({
      now: `soon`,
      time_zone: `Mars/Olympus`,
      theme: `midnight`,
      messages: [{ payload: { content: `hi` } }]
    });
    expect(result.findings.map(({ code, path }) => [code, path])).toStrictEqual(
      [
        [`scene`, [`now`]],
        [`scene`, [`time_zone`]],
        [`scene`, [`theme`]]
      ]
    );
    expect(result.findings[1]?.message).toMatch(/IANA time zone/);
  });

  it(`reports a message timestamp the header could not show`, () => {
    const result = readScene({
      messages: [{ payload: { content: `hi` }, timestamp: `yesterday` }]
    });
    expect(result.findings).toMatchObject([
      { code: `scene`, path: [`messages`, 0, `timestamp`] }
    ]);
  });

  it(`reports a scene message with no payload, which is the mistake of putting the body straight into \`messages\``, () => {
    const result = readScene({ messages: [{ content: `hi` }] });
    expect(result.findings).toMatchObject([
      { code: `scene`, path: [`messages`, 0, `payload`] }
    ]);
  });
});
