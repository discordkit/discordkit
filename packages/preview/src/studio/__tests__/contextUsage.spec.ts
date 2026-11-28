import { describe, expect, it } from "vite-plus/test";
import { readScene } from "../../scene/intake.js";
import type { Scene } from "../../scene.js";
import {
  contextUsage,
  newEntry,
  unknownAt,
  usesOf,
  withEntry,
  withField
} from "../editor/contextUsage.js";

/**
 * Studio's surroundings editor shows where each user, role, channel, emoji and file is used, marks the ones nothing uses, and offers to define what is used but missing. A mention with no entry is drawn as unknown and a missing file as a placeholder, which is how a person usually finds out; these specs hold the report to finding exactly what the preview draws from the context, no more and no less.
 */

const scene = (value: unknown): Scene => {
  const read = readScene(value);
  if (read.scene === undefined) throw new Error(`Not a scene.`);
  return read.scene;
};

const card = scene({
  messages: [
    {
      author: `100`,
      payload: {
        flags: 32768,
        components: [
          {
            type: 17,
            components: [
              {
                type: 10,
                content: `<@200> asked <@&300> in <#400> <:wave:500> \`<@999>\``
              },
              {
                type: 12,
                items: [{ media: { url: `attachment://chart.png` } }]
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 2,
                    label: `Go`,
                    custom_id: `go`,
                    emoji: { id: `600`, name: `go` }
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      author: `100`,
      payload: {
        components: [
          {
            type: 1,
            components: [
              {
                type: 5,
                custom_id: `who`,
                default_values: [{ id: `200`, type: `user` }]
              }
            ]
          }
        ]
      }
    }
  ],
  context: {
    users: {
      "100": { name: `Inbou`, avatar: `attachment://inbou.png` },
      "777": { name: `Nobody uses me` }
    },
    attachments: { "inbou.png": { path: `inbou.png` } }
  }
});

const text = [`messages`, 0, `payload`, `components`, 0, `components`, 0];

describe(`where a scene uses its surroundings`, () => {
  it(`finds every mention, author, emoji, default value and file, where the preview draws it from the context`, () => {
    const report = contextUsage(card);
    expect(usesOf(report, `users`, `100`)).toEqual([
      { path: [`messages`, 0, `author`], how: `author` },
      { path: [`messages`, 1, `author`], how: `author` }
    ]);
    expect(usesOf(report, `users`, `200`)).toEqual([
      { path: [...text, `content`], how: `mention` },
      {
        path: [
          `messages`,
          1,
          `payload`,
          `components`,
          0,
          `components`,
          0,
          `defaultValues`,
          0
        ],
        how: `default value`
      }
    ]);
    expect(usesOf(report, `roles`, `300`)).toHaveLength(1);
    expect(usesOf(report, `channels`, `400`)).toHaveLength(1);
    expect(usesOf(report, `emoji`, `500`)).toHaveLength(1);
    expect(usesOf(report, `emoji`, `600`)).toEqual([
      {
        path: [
          `messages`,
          0,
          `payload`,
          `components`,
          0,
          `components`,
          2,
          `components`,
          0,
          `emoji`
        ],
        how: `emoji`
      }
    ]);
    // A user's avatar file is a use of that file.
    expect(usesOf(report, `attachments`, `inbou.png`)).toEqual([
      { path: [`context`, `users`, `100`, `avatar`], how: `avatar` }
    ]);
  });

  it(`does not count a mention inside a code span, which Discord shows as text`, () => {
    expect(usesOf(contextUsage(card), `users`, `999`)).toEqual([]);
  });

  it(`marks an entry nothing uses by its empty list of uses`, () => {
    expect(usesOf(contextUsage(card), `users`, `777`)).toEqual([]);
  });

  it(`lists what is used but not defined, in the order it is first used, so each can be defined from where it appears`, () => {
    const { unknown } = contextUsage(card);
    expect(
      unknown.map((reference) => `${reference.kind}:${reference.key}`)
    ).toEqual([
      `users:200`,
      `roles:300`,
      `channels:400`,
      `emoji:500`,
      `emoji:600`,
      `attachments:chart.png`
    ]);
    // An emoji's entry starts with the name the text already gives it.
    expect(unknown.find((reference) => reference.key === `500`)?.name).toBe(
      `wave`
    );
    expect(
      unknownAt(contextUsage(card), `${text.join(`.`)}.content`).map(
        (reference) => reference.key
      )
    ).toEqual([`200`, `300`, `400`, `500`]);
  });

  it(`starts a new entry with only what is known: the key, and an emoji's name`, () => {
    expect(newEntry({ kind: `users` })).toEqual({ name: `` });
    expect(newEntry({ kind: `emoji`, name: `wave` })).toEqual({
      name: `wave`,
      url: ``
    });
    expect(newEntry({ kind: `attachments` })).toEqual({ path: `` });
  });

  it(`changes one entry in its place, so a change to one field is a change to one line of the file`, () => {
    const context = {
      users: { "1": { name: `A` }, "2": { name: `B` } },
      roles: { "3": { name: `R` } }
    };
    const renamed = withEntry(context, `users`, `1`, { name: `Ann` });
    expect(Object.keys(renamed?.users ?? {})).toEqual([`1`, `2`]);
    expect(Object.keys(renamed ?? {})).toEqual([`users`, `roles`]);
    expect(withEntry(context, `channels`, `4`, { name: `c` })).toMatchObject({
      channels: { "4": { name: `c` } }
    });
    // Removing the last entry of a group removes the group, and an emptied context goes too, so no `{}` is left in the file.
    expect(withEntry(context, `roles`, `3`, undefined)).toEqual({
      users: context.users
    });
    expect(
      withEntry({ roles: { "3": { name: `R` } } }, `roles`, `3`, undefined)
    ).toBeUndefined();
    // A file name is a key like any other, whatever it spells.
    expect(
      Object.keys(
        withEntry(undefined, `attachments`, `__proto__`, { path: `x.png` })
          ?.attachments ?? {}
      )
    ).toEqual([`__proto__`]);
    expect(withField({ name: `A`, bot: true }, `name`, `B`)).toEqual({
      name: `B`,
      bot: true
    });
    expect(withField({ name: `A`, bot: true }, `bot`, undefined)).toEqual({
      name: `A`
    });
  });

  it(`sees nothing unknown once every reference is defined`, () => {
    const defined = scene({
      messages: [{ author: `1`, payload: { content: `<@2>` } }],
      context: { users: { "1": { name: `A` }, "2": { name: `B` } } }
    });
    expect(contextUsage(defined).unknown).toEqual([]);
  });
});
