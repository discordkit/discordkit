import { fileURLToPath } from "node:url";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { ActionRow } from "@discordkit/client/components/types/ActionRow";
import type { Button } from "@discordkit/client/components/types/Button";
import type { File } from "@discordkit/client/components/types/File";
import type { MediaGalleryItem } from "@discordkit/client/components/types/MediaGalleryItem";
import type { Section } from "@discordkit/client/components/types/Section";
import type { Select } from "@discordkit/client/components/types/Select";
import type { SelectOption } from "@discordkit/client/components/types/SelectOption";
import type { TextDisplay } from "@discordkit/client/components/types/TextDisplay";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import type { Scene, SceneAttachment } from "../scene.js";

/**
 * Scenes shaped like the cards the Inbou and Tome bots post, which are what this renderer is judged on. The shapes follow each bot's render functions (Inbou's `handlers/exam/render.ts` and `handlers/quiz/render.ts`, Tome's `handlers/trivia/render.ts`); the content, names and ids are invented. Pictures are small generated files in `./assets`, attached to the scene, so no fixture needs the network for anything but emoji.
 *
 * Both bots' users read Discord in US English, so the scenes use the en-US locale even where the text is Japanese.
 */

/** Inbou's and Tome's open-question accent: indigo. */
const indigo = 0x2f_4b_6e;
/** Inbou's and Tome's revealed accent: moss. */
const moss = 0x4a_6b_45;
/** A question that has closed: slate, muted so the green reveal below it stands out. */
const slate = 0x3a_3f_44;
/** Inbou's legacy quiz colour for a miss. */
const vermilion = 0xc8_49_2b;

const v2 = MessageFlag.IS_COMPONENTS_V2;

const inbou = `1311000000000000001`;
const tome = `1311000000000000002`;

const players = {
  ember: `1311000000000000101`,
  quill: `1311000000000000102`,
  rook: `1311000000000000103`
};

/** The clock every scene is drawn at. A question opened 15 seconds ago with a minute to run. */
const now = `2026-11-25T11:05:00Z`;
const endsAt = Date.parse(now) / 1000 + 45;

/** The test pictures, by file name, as scene attachments. */
const asset = (name: string): SceneAttachment => ({
  path: fileURLToPath(new URL(`./assets/${name}`, import.meta.url))
});

const assetNames = [
  `landscape-16x9.png`,
  `square-128.png`,
  `portrait-3x4.png`,
  `panorama-21x9.png`,
  `landscape-4x3.png`,
  `portrait-9x16.png`,
  `square-128-b.png`,
  `square-128-c.png`,
  `square-128-d.png`,
  `icon-32.png`,
  `banner-2x1.png`,
  `answer-card.png`
] as const;

const attachments: Record<string, SceneAttachment> = Object.fromEntries(
  assetNames.map((name) => [name, asset(name)])
);

const users = {
  [inbou]: { name: `Inbou`, bot: true },
  [tome]: { name: `Tome of Knowledge`, bot: true },
  [players.ember]: { name: `Emberwing` },
  [players.quill]: { name: `quill` },
  [players.rook]: { name: `Rook of Ages` }
};

const bar = (count: number, max: number, width: number): string => {
  const filled = max === 0 ? 0 : Math.round((count / max) * width);
  return `${`█`.repeat(filled)}${`░`.repeat(width - filled)}`;
};

const secondary = (label: string, disabled: boolean): Button => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label,
  customId: `vote:${label}`,
  ...(disabled ? { disabled: true } : {})
});

/**
 * Inbou's 言い換え (paraphrase) card, open or closed. One builder for both, as in Inbou, because the closed card is edited over the open one: the accent turns slate, the countdown becomes "closed", the buttons are disabled rather than removed, and the "End test" row outside the card goes.
 */
const inbouParaphrase = (closed: boolean): MessageComponent => [
  {
    type: ComponentType.Container,
    accentColor: closed ? slate : indigo,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `**もんだい4** · 18 / 24 · ${closed ? `closed` : `ends <t:${String(endsAt)}:R>`} · 3 answered`
      },
      {
        type: ComponentType.TextDisplay,
        content: `-# ＿＿の ぶんと だいたい おなじ いみの ぶんが あります。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。`
      },
      {
        type: ComponentType.TextDisplay,
        content: `## __兄は 先生です。__\n-# 兄 あに · 先生 せんせい`
      },
      { type: ComponentType.Separator, divider: true, spacing: 1 },
      {
        type: ComponentType.TextDisplay,
        content: [
          `### 1　兄は がっこうで おしえて います。`,
          `### 2　兄は びょういんで はたらいて います。`,
          `### 3　兄は がっこうで べんきょうして います。`,
          `### 4　兄は みせで やさいを うって います。`,
          `-# 兄 あに`
        ].join(`\n`)
      },
      {
        type: ComponentType.ActionRow,
        components: [`1`, `2`, `3`, `4`].map((label) =>
          secondary(label, closed)
        )
      }
    ]
  },
  ...(closed
    ? []
    : [
        {
          type: ComponentType.ActionRow as const,
          components: [
            {
              type: ComponentType.Button as const,
              style: ButtonStyle.Danger as const,
              label: `End test`,
              customId: `exam:end`
            }
          ]
        }
      ])
];

/** Inbou's paraphrase question while it is open, with its four numbered buttons in the card and the red "End test" button under it. */
export const inbouQuestion: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: { users },
  messages: [
    {
      author: inbou,
      payload: { flags: v2, components: inbouParaphrase(false) }
    }
  ]
};

/** Inbou's reveal for a single question: the sentence with the answer underlined inside the heading, the bold result with an italic translation, the teaching note with a subtext line of review links, a divider, and a bar per option. */
const inbouRevealCard: MessageComponent = [
  {
    type: ComponentType.Container,
    accentColor: moss,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `## 兄は __がっこうで おしえて__ います。\n-# 兄 あに`
      },
      {
        type: ComponentType.TextDisplay,
        content: `✅ **1 兄は がっこうで おしえて います。** · 2 of 3 correct\n_My older brother teaches at a school._`
      },
      {
        type: ComponentType.TextDisplay,
        content: `先生 is someone who teaches, so a 先生 is someone who おしえて います at a school.\n-# Review on Tofugu: [先生](<https://www.tofugu.com/japanese/sensei/>) · [ている](<https://www.tofugu.com/japanese-grammar/teiru/>)`
      },
      { type: ComponentType.Separator, divider: true, spacing: 1 },
      {
        type: ComponentType.TextDisplay,
        content: [
          `**1** ${bar(2, 2, 10)} \`2\` **兄は がっこうで おしえて います。** ✅`,
          `2 ${bar(1, 2, 10)} \`1\` 兄は びょういんで はたらいて います。`,
          `3 ${bar(0, 2, 10)} \`0\` 兄は がっこうで べんきょうして います。`,
          `4 ${bar(0, 2, 10)} \`0\` 兄は みせで やさいを うって います。`
        ].join(`\n`)
      }
    ]
  }
];

export const inbouReveal: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: { users },
  messages: [
    { author: inbou, payload: { flags: v2, components: inbouRevealCard } }
  ]
};

/** The same question once its timer has run out, as the channel sees it: the card edited closed, then the reveal under it. */
export const inbouClosed: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: { users },
  messages: [
    {
      author: inbou,
      edited: true,
      timestamp: `2026-11-25T11:04:00Z`,
      payload: { flags: v2, components: inbouParaphrase(true) }
    },
    {
      author: inbou,
      timestamp: `2026-11-25T11:05:00Z`,
      payload: { flags: v2, components: inbouRevealCard }
    }
  ]
};

/** Inbou's older conjugation quiz, built from classic embeds: the question with its inline From, Target and Class fields and a footer, under it a Hint and an End session button, then the reveal with its fields. */
export const inbouLegacy: Scene = {
  now,
  timeZone: `America/Los_Angeles`,
  locale: `en-US`,
  context: { users },
  messages: [
    {
      author: inbou,
      timestamp: `2026-11-25T11:04:20Z`,
      payload: {
        embeds: [
          {
            title: `Question 3 of 10`,
            description: `## 食べます`,
            color: indigo,
            fields: [
              { name: `From`, value: `Non-past (polite)`, inline: true },
              { name: `Target`, value: `Past negative (plain)`, inline: true },
              { name: `Class`, value: `Ichidan (る-verb)`, inline: true }
            ],
            footer: { text: `Type your answer in the channel` }
          }
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                label: `Hint`,
                customId: `quiz:hint`
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                label: `End session`,
                customId: `quiz:end`
              }
            ]
          }
        ]
      }
    },
    {
      author: inbou,
      timestamp: `2026-11-25T11:05:00Z`,
      payload: {
        embeds: [
          {
            title: `Correct`,
            description: `<@${players.quill}> got it — **+3** (12 total)`,
            color: moss,
            fields: [
              { name: `Answer`, value: `食べなかった（たべなかった）` },
              { name: `Dictionary`, value: `食べる（たべる）`, inline: true },
              { name: `Class`, value: `Ichidan (る-verb)`, inline: true },
              { name: `Meaning`, value: `to eat` },
              {
                name: `Example`,
                value: `きのうは 何も 食べなかった。\nI didn't eat anything yesterday.`
              },
              {
                name: `Attempts`,
                value: `❌ <@${players.ember}> たべない\n⭕ <@${players.quill}> 食べなかった`
              }
            ]
          }
        ]
      }
    }
  ]
};

/** Tome's reveal: the answer, a block quote of italic lore, a bar per option between dividers, and the scorers as mentions with bold points. */
export const tomeReveal: Scene = {
  now,
  timeZone: `America/New_York`,
  locale: `en-US`,
  context: { users },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: moss,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `✅ **B — Fallen Sky**`
              },
              {
                type: ComponentType.TextDisplay,
                content: [
                  `> _The star fell for a hundred nights before it struck._`,
                  `> _Those who stood beneath it are said to stand there still._`
                ].join(`\n`)
              },
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              {
                type: ComponentType.TextDisplay,
                content: [
                  `A ${bar(1, 4, 12)} \`1\` Black Hole`,
                  `**B** ${bar(4, 4, 12)} \`4\` **Fallen Sky** ✅`,
                  `C ${bar(2, 4, 12)} \`2\` Meteor Hammer`,
                  `D ${bar(0, 4, 12)} \`0\` Starstorm`
                ].join(`\n`)
              },
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              {
                type: ComponentType.TextDisplay,
                content: [
                  `<@${players.ember}> **+3**`,
                  `<@${players.quill}> **+3**`,
                  `<@${players.rook}> **+3**`
                ].join(`  ·  `)
              }
            ]
          }
        ]
      }
    }
  ]
};

/** Tome's picture question: the heading with its countdown, the prompt, the answer card (one picture pairing each letter with its art, since a button cannot hold an image), a divider, and four buttons labelled only with their letters. */
export const tomeQuestion: Scene = {
  now,
  timeZone: `America/New_York`,
  locale: `en-US`,
  context: { users, attachments },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: indigo,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `**Question 4 of 10** · ends <t:${String(endsAt)}:R> · 2 answered`
              },
              {
                type: ComponentType.TextDisplay,
                content: `## Which hero calls down Starfall?`
              },
              {
                type: ComponentType.MediaGallery,
                items: [
                  {
                    media: { url: `attachment://answer-card.png` },
                    description: `A: Ember Knight, B: Tidecaller, C: Ashen Seer, D: Grove Warden`
                  }
                ]
              },
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              {
                type: ComponentType.ActionRow,
                components: [`A`, `B`, `C`, `D`].map((letter) =>
                  secondary(letter, false)
                )
              }
            ]
          }
        ]
      }
    }
  ]
};

/** The bots' cards, each rendered in all four themes by the Node spec. */
export const fixtures = {
  inbouQuestion,
  inbouClosed,
  inbouReveal,
  inbouLegacy,
  tomeQuestion,
  tomeReveal
} as const;

/** Gallery items for a count, cycling through pictures of every shape: wide, square, tall, panoramic and a tiny icon. */
const galleryItems = (count: number): MediaGalleryItem[] =>
  Array.from({ length: count }, (_, index) => ({
    media: { url: `attachment://${assetNames[index % 10]}` },
    description: `Picture ${String(index + 1)}`
  }));

/** One message per gallery size from 1 to 10, each in a container as both bots post them, for looking at every arrangement at once. */
export const gallerySheet: Scene = {
  now,
  context: { users, attachments },
  messages: Array.from({ length: 10 }, (_, index) => ({
    author: tome,
    payload: {
      flags: v2,
      components: [
        {
          type: ComponentType.Container,
          components: [
            {
              type: ComponentType.TextDisplay,
              content: `**${String(index + 1)} item${index === 0 ? `` : `s`}**`
            },
            {
              type: ComponentType.MediaGallery,
              items: galleryItems(index + 1)
            }
          ]
        }
      ]
    }
  }))
};

const button = (
  style: ButtonStyle,
  label: string | undefined,
  extra: Partial<Button> = {}
): Button => ({
  type: ComponentType.Button,
  style,
  ...(label === undefined ? {} : { label }),
  ...(style === ButtonStyle.Link
    ? { url: `https://example.com` }
    : style === ButtonStyle.Premium
      ? { skuId: `1311000000000000900` }
      : { customId: `c:${label ?? `x`}` }),
  ...extra
});

const customEmoji = `1311000000000000800`;

/** Every button style, enabled and disabled, with and without emoji, and a row of five that has to wrap in a narrow column. Not a bot's card: a sheet for checking the buttons by eye. */
export const buttonSheet: Scene = {
  now,
  context: {
    users,
    attachments,
    emoji: {
      [customEmoji]: { name: `gem`, url: `attachment://icon-32.png` }
    },
    skus: { "1311000000000000900": { name: `Hint pack`, price: `$0.99` } }
  },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              button(ButtonStyle.Primary, `Primary`),
              button(ButtonStyle.Secondary, `Secondary`),
              button(ButtonStyle.Success, `Success`),
              button(ButtonStyle.Danger, `Danger`),
              button(ButtonStyle.Link, `Link`)
            ]
          },
          {
            type: ComponentType.ActionRow,
            components: [
              button(ButtonStyle.Primary, `Primary`, { disabled: true }),
              button(ButtonStyle.Secondary, `Secondary`, { disabled: true }),
              button(ButtonStyle.Success, `Success`, { disabled: true }),
              button(ButtonStyle.Danger, `Danger`, { disabled: true }),
              button(ButtonStyle.Link, `Link`, { disabled: true })
            ]
          },
          {
            type: ComponentType.ActionRow,
            components: [
              button(ButtonStyle.Secondary, `Hot take`, {
                emoji: { id: null, name: `🔥` }
              }),
              button(ButtonStyle.Primary, `Gem`, {
                emoji: { id: customEmoji, name: `gem` }
              }),
              button(ButtonStyle.Secondary, undefined, {
                emoji: { id: null, name: `🔁` }
              }),
              button(ButtonStyle.Success, undefined, {
                emoji: { id: customEmoji, name: `gem` }
              }),
              button(ButtonStyle.Premium, undefined)
            ]
          },
          {
            type: ComponentType.Container,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `Five answers in one row, in a container:`
              },
              {
                type: ComponentType.ActionRow,
                components: [
                  `A. Fallen Sky`,
                  `B. Black Hole`,
                  `C. Meteor Hammer`,
                  `D. Starstorm`,
                  `E. Moonfall`
                ].map((label) => secondary(label, false))
              }
            ]
          }
        ]
      }
    }
  ]
};

/** Every part of a classic embed, two embeds on one message, plain content above them and a row of buttons below. A sheet for checking embeds by eye. */
export const embedSheet: Scene = {
  now,
  timeZone: `UTC`,
  context: { users, attachments },
  messages: [
    {
      author: inbou,
      payload: {
        content: `Here is **everything** an embed can show, <@${players.ember}>:`,
        embeds: [
          {
            author: {
              name: `Inbou Study Hall`,
              iconUrl: `attachment://icon-32.png`,
              url: `https://example.com/hall`
            },
            title: `Weekly review — <@${players.quill}>`,
            url: `https://example.com/review`,
            description: `Three verbs to revisit this week.\n# Not a heading in a title, but here it is one`,
            color: vermilion,
            thumbnail: { url: `attachment://square-128.png` },
            fields: [
              { name: `食べる`, value: `to eat`, inline: true },
              { name: `飲む`, value: `to drink`, inline: true },
              { name: `見る`, value: `to see`, inline: true },
              {
                name: `Notes`,
                value: `# Field values drop headings\n_ichidan_ verbs are the easy ones.`
              }
            ],
            image: { url: `attachment://banner-2x1.png` },
            footer: { text: `Inbou`, iconUrl: `attachment://icon-32.png` },
            timestamp: `2026-11-25T10:30:00Z`
          },
          {
            title: `A second embed, no colour`,
            description: `It sits 4px under the first.`,
            fields: [
              { name: `Inline`, value: `one`, inline: true },
              { name: `Inline`, value: `two`, inline: true },
              { name: `Inline`, value: `three`, inline: true },
              { name: `Inline`, value: `four`, inline: true }
            ],
            footer: { text: `Footer without an icon` }
          }
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              button(ButtonStyle.Primary, `Start`),
              button(ButtonStyle.Link, `Open the guide`)
            ]
          }
        ]
      }
    }
  ]
};

/*
 * Sections, thumbnails, files, select menus and spoilered containers. Neither bot posts these yet, so the cards below are shaped like ones they plausibly would: a hero card, a study pack, a settings panel and a spoilered answer. Each is followed by a review sheet that puts one component through its cases.
 *
 * Two schema defects in @discordkit/client affect these, both fixed in #106: the client's `ActionRow` type holds a select as a bare object where Discord expects an array, and its `File` type requires `name` and `size`, which only Discord's responses carry. The payloads here are written the way Discord expects, so they are cast past the client's types, and intake reports `schema` errors for every select row and every File without `name` and `size` until #106 lands. Tighten the specs that note this once it has.
 */

const text = (content: string): TextDisplay => ({
  type: ComponentType.TextDisplay,
  content
});

/** A select menu in its action row, in the array Discord expects. Cast past the client's `ActionRow` type, which holds a select as a bare object (#106). */
const selectRow = (select: Select): ActionRow =>
  ({
    type: ComponentType.ActionRow,
    components: [select]
  }) as unknown as ActionRow;

/** A File component as a request sends it, naming an uploaded file. Discord fills in `name` and `size` on the message it returns; the client's `File` type requires them (#106), so this is cast. */
const fileComponent = (name: string, spoiler = false): File =>
  ({
    type: ComponentType.File,
    file: { url: `attachment://${name}` },
    ...(spoiler ? { spoiler } : {})
  }) as unknown as File;

/** A section of text beside a thumbnail of one of the test pictures. */
const thumbnailSection = (
  content: readonly string[],
  picture: string,
  extra: { spoiler?: boolean; description?: string } = {}
): Section => ({
  type: ComponentType.Section,
  components: content.map(text),
  accessory: {
    type: ComponentType.Thumbnail,
    media: { url: `attachment://${picture}` },
    description: extra.description ?? `Portrait`,
    ...(extra.spoiler === undefined ? {} : { spoiler: extra.spoiler })
  }
});

/** A section of text beside a button. */
const buttonSection = (
  content: readonly string[],
  accessory: Button
): Section => ({
  type: ComponentType.Section,
  components: content.map(text),
  accessory
});

const roles = {
  n5: `1311000000000000201`,
  n4: `1311000000000000202`,
  leads: `1311000000000000203`,
  lurkers: `1311000000000000204`
};

const channels = {
  studyHall: `1311000000000000301`,
  dailyQuiz: `1311000000000000302`,
  voiceLounge: `1311000000000000303`
};

/** Custom emoji drawn from the test pictures, so an option's emoji needs no network. */
const emoji = {
  sprout: `1311000000000000801`,
  bamboo: `1311000000000000802`,
  blossom: `1311000000000000803`,
  torii: `1311000000000000804`
};

/** The files a File component names, with their sizes in bytes as Discord would report them. */
const files: Record<string, SceneAttachment> = {
  "n5-vocabulary.csv": { ...asset(`n5-vocabulary.csv`), size: 160 },
  "n5-kanji.txt": { ...asset(`n5-kanji.txt`), size: 1594 },
  "answer-key.txt": { ...asset(`answer-key.txt`), size: 84 }
};

/** Everything the new cards resolve: the players plus one with a picture, the server's roles and channels, the option emoji, and the pictures and files. */
const componentContext: Scene[`context`] = {
  users: {
    ...users,
    [players.rook]: {
      name: `Rook of Ages`,
      avatar: `attachment://square-128-c.png`
    }
  },
  roles: {
    [roles.n5]: { name: `N5 learners`, color: 0x34_98_db },
    [roles.n4]: { name: `N4 learners`, color: 0x2e_cc_71 },
    [roles.leads]: { name: `Study leads`, color: 0xe6_7e_22 },
    [roles.lurkers]: { name: `Lurkers` }
  },
  channels: {
    [channels.studyHall]: { name: `study-hall`, type: 0 },
    [channels.dailyQuiz]: { name: `daily-quiz`, type: 0 },
    [channels.voiceLounge]: { name: `voice-lounge`, type: 2 }
  },
  emoji: {
    [emoji.sprout]: { name: `sprout`, url: `attachment://square-128-b.png` },
    [emoji.bamboo]: { name: `bamboo`, url: `attachment://square-128-c.png` },
    [emoji.blossom]: { name: `blossom`, url: `attachment://square-128-d.png` },
    [emoji.torii]: { name: `torii`, url: `attachment://icon-32.png` }
  },
  attachments: { ...attachments, ...files },
  skus: { "1311000000000000900": { name: `Hint pack`, price: `$0.99` } }
};

/** The JLPT levels as string select options, each with an emoji and a description. */
const levels: readonly [string, string, string | undefined][] = [
  [`N5`, `Basic phrases, hiragana and katakana, about 100 kanji`, emoji.sprout],
  [`N4`, `Everyday conversation at a slow pace, about 300 kanji`, emoji.bamboo],
  [
    `N3`,
    `Everyday topics at near-natural speed, about 650 kanji`,
    emoji.blossom
  ],
  [`N2`, `Newspapers and the news, about 1,000 kanji`, emoji.torii],
  [`N1`, `Abstract and logical writing, about 2,000 kanji`, undefined]
];

const levelOptions = (chosen: readonly string[] = []): SelectOption[] =>
  levels.map(([label, description, id]) => ({
    label,
    value: label.toLowerCase(),
    description,
    ...(id === undefined ? {} : { emoji: { id, name: `level` } }),
    ...(chosen.includes(label) ? { default: true } : {})
  }));

const levelSelect = (
  chosen: readonly string[] = [],
  extra: Partial<Select> = {}
): Select => ({
  type: ComponentType.StringSelect,
  customId: `settings:level`,
  placeholder: `Choose your level`,
  options: levelOptions(chosen),
  ...extra
});

/** Tome's hero card: the hero's portrait beside their name and role, what their ability does, then this week's standouts, each beside a button to read more. */
export const tomeHeroCard: Scene = {
  now,
  timeZone: `America/New_York`,
  locale: `en-US`,
  context: componentContext,
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: indigo,
            components: [
              thumbnailSection(
                [`## Ember Knight`, `-# Vanguard · Fire · Since season 2`],
                `square-128.png`,
                {
                  description: `Ember Knight, in red armour, holding a burning sword`
                }
              ),
              text(
                `Calls down **Starfall**: a burning star strikes every enemy in a line after a one-second delay. Pairs well with heroes who hold enemies in place.`
              ),
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              buttonSection(
                [
                  `**Tidecaller** was the most picked hero this week, in 41% of games.`
                ],
                button(ButtonStyle.Secondary, `Compare`)
              ),
              buttonSection(
                [`**Ashen Seer** had the lowest win rate, at 44%.`],
                button(ButtonStyle.Link, `Patch notes`)
              )
            ]
          }
        ]
      }
    }
  ]
};

/** Inbou's weekly study pack: two files to review, and the mock test's answer key as a spoiler. */
export const inbouStudyPack: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: componentContext,
  messages: [
    {
      author: inbou,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: moss,
            components: [
              text(`## Week 3 study pack`),
              text(
                `Everything from this week's sessions, for review before Friday's mock test.`
              ),
              fileComponent(`n5-vocabulary.csv`),
              fileComponent(`n5-kanji.txt`),
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              text(
                `-# The answer key stays hidden until you have tried the test.`
              ),
              fileComponent(`answer-key.txt`, true)
            ]
          }
        ]
      }
    }
  ]
};

/** Inbou's settings panel: a level picker with its current level chosen, a study buddy, the roles to ping, and where quizzes are posted. */
export const inbouSettings: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: componentContext,
  messages: [
    {
      author: inbou,
      ephemeral: true,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              text(`## Study settings\n-# Only you can change these.`),
              text(`**Level**`),
              selectRow(levelSelect([`N4`])),
              text(`**Study buddy**`),
              selectRow({
                type: ComponentType.UserSelect,
                customId: `settings:buddy`,
                placeholder: `Pick someone to study with`,
                defaultValues: [{ id: players.rook, type: `user` }]
              }),
              text(`**Ping these roles for new quizzes**`),
              selectRow({
                type: ComponentType.RoleSelect,
                customId: `settings:roles`,
                maxValues: 3,
                defaultValues: [
                  { id: roles.n5, type: `role` },
                  { id: roles.n4, type: `role` }
                ]
              }),
              text(`**Post quizzes in**`),
              selectRow({
                type: ComponentType.ChannelSelect,
                customId: `settings:channel`,
                channelTypes: [0],
                defaultValues: [{ id: channels.dailyQuiz, type: `channel` }]
              })
            ]
          }
        ]
      }
    }
  ]
};

/** The same level picker as it looks once clicked, before a level is chosen: the list open under it, each level with its emoji and description. */
export const inbouLevelPicker: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: componentContext,
  messages: [
    {
      author: inbou,
      openSelect: `settings:level`,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: indigo,
            components: [
              text(
                `## Welcome to Inbou\nWhich JLPT level are you studying for?`
              ),
              selectRow(levelSelect())
            ]
          }
        ]
      }
    }
  ]
};

/** Tome's question, then the answer in a spoilered card under it, so the channel can try before it looks. */
export const tomeSpoilerAnswer: Scene = {
  now,
  timeZone: `America/New_York`,
  locale: `en-US`,
  context: componentContext,
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: indigo,
            components: [
              text(`**Bonus question** · Who forged the Moonblade?`),
              text(`-# The answer is below. Try it before you click.`)
            ]
          },
          {
            type: ComponentType.Container,
            accentColor: moss,
            spoiler: true,
            components: [
              thumbnailSection(
                [
                  `## Grove Warden`,
                  `Forged it from a fallen star in the age before the tides.`
                ],
                `square-128-d.png`,
                { description: `Grove Warden at an anvil` }
              )
            ]
          }
        ]
      }
    }
  ]
};

/** The cards for the components added after the bots' own, each rendered in all four themes by the Node spec. */
export const componentFixtures = {
  tomeHeroCard,
  inbouStudyPack,
  inbouSettings,
  inbouLevelPicker,
  tomeSpoilerAnswer
} as const;

/** Every way a section lays out: one to three text displays, long text, a thumbnail or a button of each kind, top level and in a container. Rendered at 600px and at a phone's 360px. */
export const sectionSheet: Scene = {
  now,
  context: componentContext,
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          thumbnailSection(
            [
              `A section at the top level, with one text display and a thumbnail.`
            ],
            `square-128.png`
          ),
          {
            type: ComponentType.Container,
            components: [
              thumbnailSection(
                [
                  `## Two text displays`,
                  `4px apart, beside an 85px thumbnail.`
                ],
                `square-128-b.png`
              ),
              thumbnailSection(
                [
                  `## Three text displays`,
                  `The most a section takes.`,
                  `-# The third one is subtext.`
                ],
                `square-128-c.png`
              ),
              thumbnailSection(
                [
                  `A long paragraph beside a thumbnail wraps in the space the thumbnail leaves, 12px from it, and the thumbnail stays at the top: the section does not centre the text against it. Discord's longest text display is 4,000 characters, so this can go on for a while, and on a phone the column is narrow enough that every line breaks early.`
                ],
                `landscape-16x9.png`
              )
            ]
          }
        ]
      }
    },
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              buttonSection(
                [`A short button.`],
                button(ButtonStyle.Primary, `Join`)
              ),
              buttonSection(
                [
                  `A long label is cut at half the section's width, less the 12px gap.`
                ],
                button(
                  ButtonStyle.Secondary,
                  `Register for the Saturday mock test session`
                )
              ),
              buttonSection(
                [`A link button, and two lines of text`, `-# beside it.`],
                button(ButtonStyle.Link, `Guide`)
              ),
              buttonSection(
                [`A disabled button with an emoji.`],
                button(ButtonStyle.Danger, `Closed`, {
                  disabled: true,
                  emoji: { id: emoji.torii, name: `torii` }
                })
              ),
              buttonSection(
                [`A premium button.`],
                button(ButtonStyle.Premium, undefined)
              )
            ]
          }
        ]
      }
    }
  ]
};

/** Thumbnails of every shape the test pictures have, cropped to the square; one whose picture is missing, drawn as the empty loading box; and one spoilered. */
export const thumbnailSheet: Scene = {
  now,
  context: componentContext,
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              thumbnailSection([`**Square**, drawn whole.`], `square-128.png`),
              thumbnailSection(
                [`**Wide** (16:9), cropped to its middle.`],
                `landscape-16x9.png`
              ),
              thumbnailSection(
                [`**Tall** (9:16), cropped to its middle.`],
                `portrait-9x16.png`
              ),
              thumbnailSection(
                [`**Tiny** (32px), scaled up to fill the box.`],
                `icon-32.png`
              ),
              thumbnailSection(
                [
                  `**Missing**: the scene has no such file, so the empty loading box is drawn.`
                ],
                `not-uploaded.png`
              ),
              thumbnailSection(
                [`**Spoiler**: blurred, with the pill over it.`],
                `square-128-d.png`,
                { spoiler: true }
              )
            ]
          }
        ]
      }
    }
  ]
};

/** File rows: at the top level and in a container, sizes in bytes and kilobytes, one whose size the scene does not know, one whose name is too long for the row, one as Discord returns it with `name` and `size`, and one spoilered. */
export const fileSheet: Scene = {
  now,
  context: {
    ...componentContext,
    attachments: {
      ...componentContext.attachments,
      "size-unknown.csv": asset(`n5-vocabulary.csv`),
      "an-extremely-long-file-name-for-the-week-three-vocabulary-review-session.csv":
        { ...asset(`n5-vocabulary.csv`), size: 160 }
    }
  },
  messages: [
    {
      author: inbou,
      payload: {
        flags: v2,
        components: [
          fileComponent(`n5-vocabulary.csv`),
          {
            type: ComponentType.Container,
            components: [
              text(`In a container:`),
              fileComponent(`n5-kanji.txt`),
              fileComponent(`size-unknown.csv`),
              fileComponent(
                `an-extremely-long-file-name-for-the-week-three-vocabulary-review-session.csv`
              ),
              {
                type: ComponentType.File,
                file: { url: `attachment://n5-kanji.txt` },
                name: `n5-kanji.txt`,
                size: 1594
              },
              fileComponent(`answer-key.txt`, true)
            ]
          }
        ]
      }
    }
  ]
};

/** All five select menus, closed: with a placeholder and without, with one default and several, disabled, and with ids the scene does not know. Rendered at 600px and at a phone's 360px. */
export const selectSheet: Scene = {
  now,
  context: componentContext,
  messages: [
    {
      author: inbou,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              text(
                `**String select**: placeholder, one default with its emoji, several as tags, disabled`
              ),
              selectRow(levelSelect([], { customId: `s:1` })),
              selectRow(levelSelect([`N3`], { customId: `s:2` })),
              selectRow(
                levelSelect([`N5`, `N4`, `N1`], {
                  customId: `s:3`,
                  maxValues: 5
                })
              ),
              selectRow(
                levelSelect([`N2`], { customId: `s:4`, disabled: true })
              ),
              selectRow({
                type: ComponentType.StringSelect,
                customId: `s:5`,
                options: [{ label: `Only option`, value: `only` }]
              })
            ]
          }
        ]
      }
    },
    {
      author: inbou,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              text(`**User, role, mentionable and channel selects**`),
              selectRow({
                type: ComponentType.UserSelect,
                customId: `u:1`,
                placeholder: `Pick a study buddy`
              }),
              selectRow({
                type: ComponentType.UserSelect,
                customId: `u:2`,
                defaultValues: [{ id: players.rook, type: `user` }]
              }),
              selectRow({
                type: ComponentType.UserSelect,
                customId: `u:3`,
                maxValues: 4,
                defaultValues: [
                  { id: players.ember, type: `user` },
                  { id: players.quill, type: `user` },
                  { id: `1311000000000000199`, type: `user` }
                ]
              }),
              selectRow({
                type: ComponentType.RoleSelect,
                customId: `r:1`,
                maxValues: 4,
                defaultValues: [
                  { id: roles.leads, type: `role` },
                  { id: roles.lurkers, type: `role` }
                ]
              }),
              selectRow({
                type: ComponentType.MentionableSelect,
                customId: `m:1`,
                maxValues: 2,
                defaultValues: [
                  { id: players.quill, type: `user` },
                  { id: roles.n5, type: `role` }
                ]
              }),
              selectRow({
                type: ComponentType.ChannelSelect,
                customId: `c:1`,
                defaultValues: [{ id: channels.studyHall, type: `channel` }],
                disabled: true
              })
            ]
          }
        ]
      }
    }
  ]
};

/** A single-choice string select drawn open, with N4 chosen: the chosen option highlighted and marked. */
export const openSelectSheet: Scene = {
  now,
  context: componentContext,
  messages: [
    {
      author: inbou,
      openSelect: `settings:level`,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              text(`**Open, one choice**`),
              selectRow(levelSelect([`N4`]))
            ]
          }
        ]
      }
    }
  ]
};

/** A string select that takes several values, drawn open, with two chosen: a box per option, ticked for the chosen ones, and options without descriptions. */
export const openMultiSelectSheet: Scene = {
  now,
  context: componentContext,
  messages: [
    {
      author: inbou,
      openSelect: `quiz:topics`,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              text(`**Open, several choices**`),
              selectRow({
                type: ComponentType.StringSelect,
                customId: `quiz:topics`,
                placeholder: `Topics to quiz`,
                minValues: 1,
                maxValues: 4,
                options: [
                  { label: `Vocabulary`, value: `vocab`, default: true },
                  {
                    label: `Kanji`,
                    value: `kanji`,
                    emoji: { id: emoji.blossom, name: `blossom` }
                  },
                  { label: `Grammar`, value: `grammar`, default: true },
                  { label: `Listening`, value: `listening` }
                ]
              })
            ]
          }
        ]
      }
    }
  ]
};

/** A spoilered container, thumbnail and file, hidden as a posted message shows them. */
export const spoilerSheet: Scene = {
  now,
  context: componentContext,
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: vermilion,
            spoiler: true,
            components: [
              text(`## A spoilered container`),
              text(
                `Its text, its accent bar and everything in it are blurred together.`
              ),
              {
                type: ComponentType.ActionRow,
                components: [button(ButtonStyle.Primary, `Even buttons`)]
              }
            ]
          },
          {
            type: ComponentType.Container,
            components: [
              thumbnailSection([`A spoilered thumbnail.`], `square-128-b.png`, {
                spoiler: true
              }),
              fileComponent(`answer-key.txt`, true)
            ]
          }
        ]
      }
    }
  ]
};

/** The same, as they look once clicked. */
export const spoilerSheetRevealed: Scene = {
  ...spoilerSheet,
  revealSpoilers: true
};

/** The review sheets for the components added after the bots' own. */
export const componentSheets = {
  sectionSheet,
  thumbnailSheet,
  fileSheet,
  selectSheet,
  openSelectSheet,
  openMultiSelectSheet,
  spoilerSheet,
  spoilerSheetRevealed
} as const;

/*
 * Scenes holding the kinds of content the captures of the iOS app show (spec §7b), with our own words and our own generated pictures, so the iOS layout can be compared with the app part by part. Each says which capture it stands beside. None holds anything from the captures themselves.
 */

/** Two days before the scenes' clock, as a relative timestamp says it: "2 days ago". */
const twoDaysAgo = Date.parse(now) / 1000 - 2 * 24 * 60 * 60;

const row = (labels: readonly string[]): ActionRow => ({
  type: ComponentType.ActionRow,
  components: labels.map((label) => secondary(label, false))
});

const described = (name: string, description: string): MediaGalleryItem => ({
  media: { url: `attachment://${name}` },
  description
});

/** Beside `tome-019`: a question card with a countdown, a heading, a bold line, four described pictures, a divider and four answers that wrap onto a second row. */
export const iosQuestionCard: Scene = {
  now,
  context: { users, attachments },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `**Question 1 of 5** · ends <t:${String(twoDaysAgo)}:R>`
              },
              {
                type: ComponentType.TextDisplay,
                content: `## Which planet has rings?`
              },
              {
                type: ComponentType.TextDisplay,
                content: `**Hint: not Mars**`
              },
              {
                type: ComponentType.MediaGallery,
                items: [
                  described(`landscape-16x9.png`, `Planet one`),
                  described(`landscape-4x3.png`, `Planet two`),
                  described(`panorama-21x9.png`, `Planet three`),
                  described(`banner-2x1.png`, `Planet four`)
                ]
              },
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              row([`A. Neptune`, `B. Mars`, `C. Venus`, `D. Saturn`])
            ]
          }
        ]
      }
    }
  ]
};

const galleryCards: readonly [string, readonly string[]][] = [
  [`One wide picture (256x144)`, [`landscape-16x9.png`]],
  [
    `Three pictures`,
    [`square-128.png`, `square-128-b.png`, `square-128-c.png`]
  ],
  [`Two wide pictures`, [`landscape-16x9.png`, `panorama-21x9.png`]],
  [
    `Four 4:3 pictures`,
    [
      `landscape-4x3.png`,
      `landscape-4x3.png`,
      `landscape-4x3.png`,
      `landscape-4x3.png`
    ]
  ],
  [
    `Four squares (128x128)`,
    [
      `square-128.png`,
      `square-128-b.png`,
      `square-128-c.png`,
      `square-128-d.png`
    ]
  ]
];

/** Beside `tome-020`, `tome-023`, `tome-024` and `tome-025`: one card per gallery the app was seen drawing, a lone 256×144 picture, three pictures, two wide pictures, and four pictures of 4:3 and of square files. */
export const iosGalleries: Scene = {
  now,
  context: { users, attachments },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: galleryCards.map(([label, names]) => ({
          type: ComponentType.Container,
          components: [
            { type: ComponentType.TextDisplay, content: label },
            {
              type: ComponentType.MediaGallery,
              items: names.map((name) => ({
                media: { url: `attachment://${name}` }
              }))
            }
          ]
        }))
      }
    }
  ]
};

/** Beside `tome-028` and `tome-029`: a heading over four sections, each a bold label with a square thumbnail, then four one-letter buttons. */
export const iosSections: Scene = {
  now,
  context: { users, attachments },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `Square pictures as thumbnails`
              },
              ...[`A. Saturn`, `B. Jupiter`, `C. Uranus`, `D. Neptune`].map(
                (label, index): Section => ({
                  type: ComponentType.Section,
                  components: [
                    {
                      type: ComponentType.TextDisplay,
                      content: `**${label}**`
                    }
                  ],
                  accessory: {
                    type: ComponentType.Thumbnail,
                    media: {
                      url: `attachment://${assetNames[[1, 6, 7, 8][index]]}`
                    }
                  }
                })
              ),
              row([`A`, `B`, `C`, `D`])
            ]
          }
        ]
      }
    }
  ]
};

/** Beside `tome-054`, `tome-055` and `tome-056`: a card with an accent, a line whose timestamp wraps mid-phrase, one picture larger than the column with a description, a divider and four one-letter buttons. */
export const iosAnswerCard: Scene = {
  now,
  timeZone: `America/New_York`,
  context: { users, attachments },
  messages: [
    {
      author: tome,
      timestamp: `2026-11-22T07:01:00Z`,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: indigo,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `**Answer card — four portraits** · 11 ms · ends <t:${String(twoDaysAgo)}:R>`
              },
              {
                type: ComponentType.MediaGallery,
                items: [
                  described(
                    `answer-card.png`,
                    `A: first, B: second, C: third, D: fourth`
                  )
                ]
              },
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              row([`A`, `B`, `C`, `D`])
            ]
          }
        ]
      }
    }
  ]
};

/** A card holding parts the iOS app has been seen drawing beside parts it has not (subtext, a danger button, an emoji, a classic embed), so the per-viewport report has something to list. */
export const iosMixed: Scene = {
  now,
  context: { users, attachments },
  messages: [
    {
      author: tome,
      payload: {
        flags: v2,
        components: [
          {
            type: ComponentType.Container,
            components: [
              { type: ComponentType.TextDisplay, content: `## Round over 🎉` },
              {
                type: ComponentType.TextDisplay,
                content: `**3 of 5** answered correctly.\n-# Scores reset at midnight.`
              },
              { type: ComponentType.Separator, divider: true, spacing: 1 },
              {
                type: ComponentType.ActionRow,
                components: [
                  secondary(`Play again`, false),
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Danger,
                    label: `Quit`,
                    customId: `quit`
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      author: inbou,
      payload: {
        embeds: [
          {
            title: `Daily summary`,
            description: `Five questions, three right.`,
            color: indigo
          }
        ]
      }
    }
  ]
};

/** The iOS comparison scenes, all drawn for the iPhone 14 Pro. */
export const iosScenes = {
  iosQuestionCard,
  iosGalleries,
  iosSections,
  iosAnswerCard,
  iosMixed
} as const;
