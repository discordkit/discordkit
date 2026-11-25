import { fileURLToPath } from "node:url";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Button } from "@discordkit/client/components/types/Button";
import type { MediaGalleryItem } from "@discordkit/client/components/types/MediaGalleryItem";
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
