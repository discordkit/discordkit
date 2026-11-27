import { describe, expect, it } from "vite-plus/test";
import { isObject } from "@discordkit/core/utils/isObject";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { inbouQuestion, tomeReveal } from "../../__tests__/fixtures.js";
import { supportedComponents } from "../../components.js";
import { lint } from "../../lint/index.js";
import type { Scene } from "../../scene.js";
import { colorToHexOrUndefined, hexToColor } from "../editor/color.js";
import {
  canMove,
  duplicateAt,
  insertChild,
  insertMessage,
  moveBy,
  newChild,
  removeAt
} from "../editor/edits.js";
import { switchKind } from "../editor/messageKind.js";
import { parsePathKey, pathKey, valueAt } from "../editor/paths.js";
import { optionalText, prune, pruneRecord } from "../editor/prune.js";
import { startingPoints } from "../editor/startingPoints.js";
import {
  buildTree,
  childSlots,
  firstLine,
  flatten,
  nodeFor,
  siblingSlots
} from "../editor/tree.js";

/**
 * The editor's logic that needs no browser: what the tree shows, what each parent may hold, how the tree's edits move things, and what a cleared field leaves behind. Each of these decides whether the payload Studio writes is one Discord accepts.
 */

const v2 = (components: unknown[]): Scene => ({
  messages: [
    {
      payload: {
        flags: 32768,
        components
      } as Scene[`messages`][number][`payload`]
    }
  ]
});

const button = (label: string, extra: Record<string, unknown> = {}) => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label,
  customId: label,
  ...extra
});

const available = (slots: ReturnType<typeof childSlots>): unknown[] =>
  slots
    .filter((slot) => slot.unavailable === undefined)
    .map((slot) => slot.type);

describe(`the component tree`, () => {
  it(`nests nodes as the payload nests components, with a summary a person recognises each by`, () => {
    const [message] = buildTree(inbouQuestion);
    expect(message.summary).toBe(`Components V2 · Inbou`);
    const [card, endRow] = message.children;
    expect(card.name).toBe(`Container`);
    expect(card.summary).toBe(`6 items · #2f4b6e`);
    expect(card.children.map((node) => node.name)).toEqual([
      `Text Display`,
      `Text Display`,
      `Text Display`,
      `Separator`,
      `Text Display`,
      `Action Row`
    ]);
    // Markdown markers are dropped: the first line is what the text says.
    expect(card.children[2].summary).toBe(`兄は 先生です。`);
    expect(card.children[3].summary).toBe(`divider, small`);
    expect(card.children[5].summary).toBe(`4 buttons`);
    expect(endRow.children[0].summary).toBe(`End test · Danger`);
  });

  it(`uses scene paths as node ids, so a finding's path finds its node`, () => {
    const nodes = buildTree(inbouQuestion);
    const path = [
      `messages`,
      0,
      `payload`,
      `components`,
      0,
      `components`,
      5,
      `components`,
      2,
      `customId`
    ];
    expect(nodeFor(nodes, path)?.id).toBe(
      `messages.0.payload.components.0.components.5.components.2`
    );
    expect(parsePathKey(pathKey(path))).toEqual(path);
  });

  it(`shows a section's accessory as a child of its own`, () => {
    const nodes = flatten(
      buildTree(
        v2([
          {
            type: ComponentType.Section,
            components: [{ type: ComponentType.TextDisplay, content: `Hi` }],
            accessory: {
              type: ComponentType.Thumbnail,
              media: { url: `attachment://a.png` }
            }
          }
        ])
      )
    );
    expect(nodes.map((node) => node.name)).toContain(`Thumbnail (accessory)`);
  });

  it(`summarises the first line that says something`, () => {
    expect(firstLine(`\n-# **Hello** there\nsecond`)).toBe(`Hello there`);
    expect(firstLine(``)).toBe(``);
  });
});

describe(`what each parent may hold`, () => {
  it(`offers exactly the renderer's list for a Components V2 message and a container`, () => {
    const scene = v2([{ type: ComponentType.Container, components: [] }]);
    expect(available(childSlots(scene, [`messages`, 0]))).toEqual(
      supportedComponents.message
    );
    expect(
      available(childSlots(scene, [`messages`, 0, `payload`, `components`, 0]))
    ).toEqual(supportedComponents.container);
  });

  it(`lets a classic message take only action rows and embeds, since anything else would make it Components V2`, () => {
    const scene: Scene = { messages: [{ payload: { content: `Hi` } }] };
    expect(available(childSlots(scene, [`messages`, 0]))).toEqual([
      ComponentType.ActionRow,
      `embed`
    ]);
  });

  it(`stops at five buttons to a row, and keeps a select menu on a row of its own`, () => {
    const row = (children: unknown[]) =>
      childSlots(
        v2([{ type: ComponentType.ActionRow, components: children }]),
        [`messages`, 0, `payload`, `components`, 0]
      );
    expect(available(row([]))).toEqual(supportedComponents.actionRow);
    expect(available(row([button(`a`)]))).toEqual([ComponentType.Button]);
    expect(
      available(row([`a`, `b`, `c`, `d`, `e`].map((label) => button(label))))
    ).toEqual([]);
    expect(
      available(row([{ type: ComponentType.UserSelect, customId: `u` }]))
    ).toEqual([]);
  });

  it(`offers siblings from the parent's list: a container's children beside a text display in it`, () => {
    const scene = v2([
      {
        type: ComponentType.Container,
        components: [{ type: ComponentType.TextDisplay, content: `x` }]
      }
    ]);
    expect(
      available(
        siblingSlots(scene, [
          `messages`,
          0,
          `payload`,
          `components`,
          0,
          `components`,
          0
        ])
      )
    ).toEqual(supportedComponents.container);
    // A top-level component's siblings are the message's.
    expect(
      available(
        siblingSlots(scene, [`messages`, 0, `payload`, `components`, 0])
      )
    ).toEqual(supportedComponents.message);
  });
});

describe(`the tree's edits`, () => {
  const scene = v2([
    {
      type: ComponentType.ActionRow,
      components: [button(`a`), button(`b`), button(`c`)]
    }
  ]);
  const row = [`messages`, 0, `payload`, `components`, 0, `components`];

  it(`moves a component and keeps it selected, so the person's selection follows what they moved`, () => {
    const moved = moveBy(scene, [...row, 0], 1);
    expect(
      (valueAt(moved.scene, row) as { label: string }[]).map(
        (item) => item.label
      )
    ).toEqual([`b`, `a`, `c`]);
    expect(moved.selected).toEqual([...row, 1]);
    // Whatever was at the place it moved into moved the other way.
    expect(moved.remap([...row, 1, `label`])).toEqual([...row, 0, `label`]);
    expect(canMove(scene, [...row, 0], -1)).toBe(false);
    expect(canMove(scene, [...row, 2], 1)).toBe(false);
  });

  it(`duplicates a button with its customId, which lint reports at once`, () => {
    const copied = duplicateAt(scene, [...row, 1]);
    expect(copied.selected).toEqual([...row, 2]);
    expect(valueAt(copied.scene, [...row, 2])).toEqual(button(`b`));
    expect(copied.remap([...row, 2])).toEqual([...row, 3]);
    expect(
      lint(copied.scene).findings.map((finding) => finding.code)
    ).toContain(`custom-id-duplicate`);
  });

  it(`selects the next component after a remove, then the previous, then the parent`, () => {
    expect(removeAt(scene, [...row, 1]).selected).toEqual([...row, 1]);
    expect(removeAt(scene, [...row, 2]).selected).toEqual([...row, 1]);
    const lone = v2([
      { type: ComponentType.ActionRow, components: [button(`a`)] }
    ]);
    expect(removeAt(lone, [...row, 0]).selected).toEqual([
      `messages`,
      0,
      `payload`,
      `components`,
      0
    ]);
    expect(removeAt(scene, [...row, 1]).remap([...row, 1])).toBeUndefined();
  });

  it(`gives a new interactive component a customId no other component has`, () => {
    const added = insertChild(
      scene,
      row,
      newChild(scene, ComponentType.Button)
    );
    expect(valueAt(added.scene, [...added.selected, `customId`])).toBe(
      `button-1`
    );
    const again = newChild(added.scene, ComponentType.Button);
    expect(again.customId).toBe(`button-2`);
  });

  it(`adds a message after the selected one, sent by the same author, so a sequence keeps its sender`, () => {
    const pair: Scene = {
      messages: [
        { author: `1`, payload: { content: `Question` } },
        { author: `2`, payload: { content: `Answer` } }
      ]
    };
    const added = insertMessage(pair, `v2`, 0);
    expect(added.selected).toEqual([`messages`, 1]);
    expect(added.scene.messages.map((message) => message.author)).toEqual([
      `1`,
      `1`,
      `2`
    ]);
    // Empty but already Components V2, so the add menu offers containers at once.
    expect(added.scene.messages[1].payload).toEqual({
      flags: 32768,
      components: []
    });
    // What was the second message is now the third, and the selection and folds follow it.
    expect(added.remap([`messages`, 1, `payload`])).toEqual([
      `messages`,
      2,
      `payload`
    ]);
    expect(insertMessage(pair, `classic`).scene.messages[2]).toEqual({
      author: `2`,
      payload: { content: `` }
    });
  });

  it(`duplicates, moves and removes whole messages as it does components, so "before and after" is one duplicate and one change`, () => {
    const one: Scene = {
      messages: [
        { payload: { content: `Open` } },
        { payload: { content: `B` } }
      ]
    };
    const copied = duplicateAt(one, [`messages`, 0]);
    expect(copied.selected).toEqual([`messages`, 1]);
    expect(copied.scene.messages[1]).toEqual(one.messages[0]);
    // A copy is a copy, not the same object, so editing it leaves the original alone.
    expect(copied.scene.messages[1]).not.toBe(one.messages[0]);
    expect(
      moveBy(one, [`messages`, 1], -1).scene.messages.map(
        (message) => message.payload.content
      )
    ).toEqual([`B`, `Open`]);
    const removed = removeAt(one, [`messages`, 0]);
    expect(removed.scene.messages).toHaveLength(1);
    expect(removed.selected).toEqual([`messages`, 0]);
    // The last one removed leaves an empty scene, which offers the starting points.
    expect(removeAt(removed.scene, [`messages`, 0]).scene.messages).toEqual([]);
  });

  it(`summarises each message by what tells it from the next in a sequence`, () => {
    const [first, second] = buildTree({
      messages: [
        { author: `1`, payload: { content: `Open` } },
        {
          author: `1`,
          edited: true,
          ephemeral: true,
          payload: { content: `x` }
        }
      ],
      context: { users: { "1": { name: `Inbou` } } }
    });
    expect([first.name, first.summary]).toEqual([
      `Message 1`,
      `Classic · Inbou`
    ]);
    expect(second.summary).toBe(`Classic · Inbou · edited · ephemeral`);
  });

  it(`turns an action row's lone select, held as a bare object, into the array Discord expects once edited`, () => {
    const bare = v2([
      {
        type: ComponentType.ActionRow,
        components: { type: ComponentType.UserSelect, customId: `u` }
      }
    ]);
    const added = duplicateAt(bare, [...row, 0]);
    expect(Array.isArray(valueAt(added.scene, row))).toBe(true);
  });
});

describe(`switching a message between classic and Components V2`, () => {
  it(`says what going to Components V2 discards: the text and the embeds`, () => {
    const result = switchKind(
      {
        content: `Hello`,
        embeds: [{ title: `a` }, { title: `b` }],
        components: []
      },
      `v2`
    );
    expect(result.discarded).toEqual([
      `The message's text (5 characters)`,
      `2 embeds`
    ]);
    expect(result.payload).toEqual({ components: [], flags: 32768 });
  });

  it(`keeps the action rows going to classic, says what else goes, and drops the flag`, () => {
    const result = switchKind(
      {
        flags: 32768 | 4096,
        components: [
          { type: ComponentType.Container, components: [] },
          { type: ComponentType.ActionRow, components: [] },
          { type: ComponentType.TextDisplay, content: `x` }
        ] as never
      },
      `classic`
    );
    expect(result.discarded).toEqual([
      `1 Container, and everything in it`,
      `1 Text Display`
    ]);
    expect(result.payload).toEqual({
      flags: 4096,
      components: [{ type: ComponentType.ActionRow, components: [] }]
    });
  });

  it(`discards nothing when there is nothing the other kind cannot hold`, () => {
    expect(switchKind({ components: [] }, `v2`).discarded).toEqual([]);
  });
});

/** A value with every object as its list of entries, so a key that is present but `undefined` shows. */
const entries = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(entries)
    : isObject(value)
      ? Object.entries(value).map(([key, item]) => [key, entries(item)])
      : value;

describe(`cleared fields`, () => {
  it(`leave no key behind: not an empty string, not undefined, not an emptied object`, () => {
    const pruned = pruneRecord({
      title: optionalText(``),
      author: { name: undefined, url: undefined },
      footer: {},
      color: Number.NaN,
      fields: [{ name: `a`, value: `b`, inline: undefined }]
    });
    // Compared as key lists, since `toEqual` treats an `undefined` key as absent and these keys must really be gone.
    expect(entries(pruned)).toEqual([
      [`footer`, []],
      [
        `fields`,
        [
          [
            [`name`, `a`],
            [`value`, `b`]
          ]
        ]
      ]
    ]);
  });

  it(`keeps a scene's messages, so pruning never takes away what the tree is built from`, () => {
    const scene: Scene = {
      messages: [{ payload: { content: `Hi` }, author: undefined }]
    };
    expect(prune(scene)).toEqual({
      messages: [{ payload: { content: `Hi` } }]
    });
    expect(`author` in prune(scene).messages[0]).toBe(false);
  });
});

describe(`colours`, () => {
  it(`reads the hex a person types as the integer Discord stores`, () => {
    expect(hexToColor(`#2F4B6E`)).toBe(3099502);
    expect(hexToColor(`2f4b6e`)).toBe(3099502);
    expect(hexToColor(`#fff`)).toBe(0xffffff);
    expect(hexToColor(``)).toBeUndefined();
    expect(hexToColor(`#12345`)).toBeUndefined();
    expect(colorToHexOrUndefined(3099502)).toBe(`#2f4b6e`);
    expect(colorToHexOrUndefined(0)).toBe(`#000000`);
    expect(colorToHexOrUndefined(null)).toBeUndefined();
  });
});

describe(`starting points`, () => {
  it(`are the package's own fixtures for the two bot cards, so they cannot drift from what the renderer is judged on`, () => {
    const byId = Object.fromEntries(
      startingPoints.map((point) => [point.id, point.scene])
    );
    for (const [id, fixture] of [
      [`inbou-question`, inbouQuestion],
      [`tome-reveal`, tomeReveal]
    ] as const) {
      const { context, ...rest } = byId[id];
      const { context: fixtureContext, ...fixtureRest } = fixture;
      expect(rest).toEqual(fixtureRest);
      // Only the people the card names, so the context a person starts from is not padded with strangers.
      for (const [user, entry] of Object.entries(context?.users ?? {})) {
        expect(fixtureContext?.users?.[user]).toEqual(entry);
      }
    }
  });

  it(`are all valid, so the first thing a person sees is not a list of errors (save the empty one)`, () => {
    for (const point of startingPoints) {
      const errors = lint(point.scene).findings.filter(
        (finding) => finding.severity === `error`
      );
      if (point.id === `v2`) continue;
      expect({ point: point.id, errors }).toEqual({
        point: point.id,
        errors: []
      });
    }
  });
});
