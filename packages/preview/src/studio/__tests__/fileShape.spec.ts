import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { readScene } from "../../scene/intake.js";
import type { Scene } from "../../scene.js";
import {
  readFileShape,
  toFilePath,
  toFileText,
  toSceneText,
  withViewSettings,
  type FileShape
} from "../document/fileShape.js";

/**
 * Studio's form holds the normalised camelCase scene, but the file belongs to whoever wrote it: an agent's snake_case component array, a bot spec's camelCase payload. These specs hold Studio to saving the file in the shape and key style it found it in, because a save that rewrote every key or wrapped a payload in a scene would break whatever else reads the file, and would turn one changed field into a diff of the whole file.
 */

const open = (text: string): { scene: Scene; shape: FileShape } => {
  const { kind, scene } = readScene(text);
  if (scene === undefined || kind === `unknown`) {
    throw new Error(`The fixture should read as a scene.`);
  }
  return { scene, shape: readFileShape(text, kind) };
};

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const snakeComponents = json([
  {
    type: 17,
    accent_color: 3099502,
    components: [{ type: 10, content: `## Question 4` }]
  },
  {
    type: 1,
    components: [{ type: 2, style: 2, label: `End`, custom_id: `end` }]
  }
]);

describe(`saving a file in its own shape`, () => {
  it(`writes an untouched file back byte for byte`, () => {
    for (const text of [
      snakeComponents,
      json({ flags: 32768, components: [{ type: 10, content: `Hi` }] }),
      json({
        messages: [{ payload: { content: `Hi` }, author: `1` }],
        context: { users: { "1": { name: `Inbou`, bot: true } } },
        theme: `light`
      })
    ]) {
      const { scene, shape } = open(text);
      expect(toFileText(scene, shape)).toBe(text);
    }
  });

  it(`keeps a snake_case component array a snake_case component array, with no scene or flags around it`, () => {
    const { scene, shape } = open(snakeComponents);
    const [container] = scene.messages[0].payload.components ?? [];
    if (container.type !== ComponentType.Container)
      throw new Error(`Expected a container.`);
    container.accentColor = 0x5865f2;
    const saved: unknown = JSON.parse(toFileText(scene, shape));
    expect(saved).toEqual([
      {
        type: 17,
        accent_color: 0x5865f2,
        components: [{ type: 10, content: `## Question 4` }]
      },
      {
        type: 1,
        components: [{ type: 2, style: 2, label: `End`, custom_id: `end` }]
      }
    ]);
  });

  it(`spells a key the file did not have yet in the file's style`, () => {
    const { scene, shape } = open(
      json({
        messages: [{ payload: { content: `Hi` }, open_select: `pick` }],
        time_zone: `UTC`
      })
    );
    const saved: unknown = JSON.parse(
      toFileText({ ...scene, revealSpoilers: true, theme: `light` }, shape)
    );
    expect(saved).toEqual({
      messages: [{ payload: { content: `Hi` }, open_select: `pick` }],
      time_zone: `UTC`,
      reveal_spoilers: true,
      theme: `light`
    });
  });

  it(`keeps camelCase as camelCase`, () => {
    const { scene, shape } = open(
      json({ messages: [{ payload: { content: `Hi` } }], timeZone: `UTC` })
    );
    expect(
      JSON.parse(toFileText({ ...scene, revealSpoilers: true }, shape))
    ).toEqual({
      messages: [{ payload: { content: `Hi` } }],
      timeZone: `UTC`,
      revealSpoilers: true
    });
  });

  it(`keeps each key of a mixed file in the spelling it already had`, () => {
    const mixed = json([
      { type: 17, accent_color: 1, components: [] },
      {
        type: 1,
        components: [{ type: 2, style: 2, label: `Go`, customId: `go` }]
      }
    ]);
    const { scene, shape } = open(mixed);
    expect(toFileText(scene, shape)).toBe(mixed);
  });

  it(`never respells keys that are data: ids and file names in the context`, () => {
    const { scene, shape } = open(
      json({
        messages: [{ payload: { content: `Hi` }, author: `user_1` }],
        context: {
          users: { user_1: { name: `Inbou` } },
          attachments: { "my_card.png": { path: `./my_card.png` } }
        }
      })
    );
    const saved = toFileText({ ...scene, theme: `ash` }, shape);
    expect(saved).toContain(`"user_1": {`);
    expect(saved).toContain(`"my_card.png": {`);
    expect(saved).not.toContain(`user1`);
    expect(saved).not.toContain(`myCard`);
  });

  it(`leaves the view settings out of a file that has no place for them`, () => {
    const { scene, shape } = open(snakeComponents);
    const saved = toFileText(
      { ...scene, theme: `light`, width: 390, revealSpoilers: true },
      shape
    );
    expect(saved).toBe(snakeComponents);
  });

  it(`keeps the file's indentation, or none for a file on one line`, () => {
    const tabs = `{\n\t"messages": [\n\t\t{\n\t\t\t"payload": {\n\t\t\t\t"content": "Hi"\n\t\t\t}\n\t\t}\n\t]\n}`;
    const tabbed = open(tabs);
    expect(toFileText(tabbed.scene, tabbed.shape)).toBe(tabs);
    const compact = `{"flags":32768,"components":[{"type":10,"content":"Hi"}]}`;
    const oneLine = open(compact);
    expect(toFileText(oneLine.scene, oneLine.shape)).toBe(compact);
  });
});

describe(`pointing a finding into the file`, () => {
  it(`spells a scene path as the file spells it, without the scene around a bare payload`, () => {
    const { shape } = open(snakeComponents);
    expect(
      toFilePath(
        [
          `messages`,
          0,
          `payload`,
          `components`,
          1,
          `components`,
          0,
          `customId`
        ],
        shape
      )
    ).toEqual([1, `components`, 0, `custom_id`]);
  });

  it(`has no file path for a view setting the file does not hold`, () => {
    const { shape } = open(snakeComponents);
    expect(toFilePath([`locale`], shape)).toBeUndefined();
  });
});

describe(`keeping the person's view settings`, () => {
  /** A message holding one String Select, read the way Studio reads a file. */
  const card = (customId: string): Scene =>
    open(
      json([
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: customId,
              options: [{ label: `A`, value: `a` }]
            }
          ]
        }
      ])
    ).scene;

  it(`carries them over an agent's change to a bare payload, which could not hold them`, () => {
    const previous: Scene = {
      ...card(`pick`),
      theme: `light`,
      width: 390,
      messages: [{ ...card(`pick`).messages[0], openSelect: `pick` }]
    };
    const next = withViewSettings(card(`pick`), previous, `components`);
    expect(next).toMatchObject({
      theme: `light`,
      width: 390,
      messages: [{ openSelect: `pick` }]
    });
  });

  it(`drops an open select the agent has since removed, rather than carry a scene that cannot be drawn`, () => {
    const previous: Scene = {
      messages: [{ ...card(`pick`).messages[0], openSelect: `pick` }]
    };
    const next = withViewSettings(card(`renamed`), previous, `components`);
    expect(next.messages[0].openSelect).toBeUndefined();
  });

  it(`turns a bare payload into a scene that holds it, keeping its key spelling and the settings chosen in Studio, so they finally have somewhere to be saved`, () => {
    const { scene, shape } = open(snakeComponents);
    const kept = withViewSettings(
      scene,
      { ...scene, theme: `light`, viewports: [{ device: `iphone-14-pro` }] },
      shape.kind
    );
    const text = toSceneText(kept, shape);
    const converted = JSON.parse(text) as {
      messages: [{ payload: { flags: number; components: unknown[] } }];
      theme: string;
      viewports: unknown[];
    };
    // The components are now the one message's, spelled as the agent spelled them.
    expect(converted.messages[0].payload.components[0]).toEqual({
      type: 17,
      accent_color: 3099502,
      components: [{ type: 10, content: `## Question 4` }]
    });
    expect(converted.messages[0].payload.components[1]).toMatchObject({
      components: [{ custom_id: `end` }]
    });
    expect(converted).toMatchObject({
      theme: `light`,
      viewports: [{ device: `iphone-14-pro` }]
    });
    // It reads back as a scene that draws the same message, in the file's indentation.
    const reread = open(text);
    expect(reread.shape.kind).toBe(`scene`);
    expect(reread.shape.style).toBe(`snake`);
    expect(reread.scene.messages[0].payload).toEqual(scene.messages[0].payload);
    expect(text).toMatch(/^\{\n {2}"messages"/);
  });

  it(`takes a scene file's own settings, since the file is where they live`, () => {
    const next = withViewSettings(
      { ...card(`pick`), theme: `dark` },
      { ...card(`pick`), theme: `light` },
      `scene`
    );
    expect(next.theme).toBe(`dark`);
  });
});
