import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Scene } from "../scene.js";

/**
 * Scenes shaped like the cards the Inbou and Tome bots post, which are what this renderer is judged on. The shapes and the kinds of text follow each bot's render functions; the content, names and ids are invented.
 *
 * Only the components the renderer draws so far are included. Where a real card has a separator, a media gallery or a row of buttons, it is left out, and a comment marks the place.
 */

/** Inbou's open-question accent: indigo. */
const indigo = 0x2f_4b_6e;
/** Inbou's and Tome's revealed accent: moss. */
const moss = 0x4a_6b_45;

const inbou = `1311000000000000001`;
const tome = `1311000000000000002`;

/** The clock both bots' scenes are drawn at. A question opened 15 seconds ago with a minute to run. */
const now = `2026-11-25T11:05:00Z`;
const endsAt = Date.parse(now) / 1000 + 45;

/** Inbou's 言い換え (paraphrase) question card: the bold heading line with a live countdown, the instruction line as subtext, the sentence as a heading with its readings below, and the options as smaller headings. */
export const inbouQuestion: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: { users: { [inbou]: { name: `Inbou`, bot: true } } },
  messages: [
    {
      author: inbou,
      payload: {
        components: [
          {
            type: ComponentType.Container,
            accentColor: indigo,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `**もんだい4** · 18 / 24 · ends <t:${String(endsAt)}:R> · 3 answered`
              },
              {
                type: ComponentType.TextDisplay,
                content: `-# ＿＿の ぶんと だいたい おなじ いみの ぶんが あります。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。`
              },
              {
                type: ComponentType.TextDisplay,
                content: `## __兄は 先生です。__\n-# 兄 あに · 先生 せんせい`
              },
              // Separator (divider, small spacing): not drawn yet.
              {
                type: ComponentType.TextDisplay,
                content: [
                  `### 1　兄は がっこうで おしえて います。`,
                  `### 2　兄は びょういんで はたらいて います。`,
                  `### 3　兄は がっこうで べんきょうして います。`,
                  `### 4　兄は みせで やさいを うって います。`,
                  `-# 兄 あに`
                ].join(`\n`)
              }
              // Action row of four numbered buttons: not drawn yet.
            ]
          }
          // Action row with the red "End test" button, outside the card: not drawn yet.
        ]
      }
    }
  ]
};

const bar = (count: number, max: number, width: number): string => {
  const filled = max === 0 ? 0 : Math.round((count / max) * width);
  return `${`█`.repeat(filled)}${`░`.repeat(width - filled)}`;
};

/** Inbou's reveal for a single question: the sentence with the answer underlined inside the heading, the bold result with an italic translation, the teaching note with a subtext line of review links, and a bar per option. */
export const inbouReveal: Scene = {
  now,
  timeZone: `Asia/Tokyo`,
  locale: `en-US`,
  context: { users: { [inbou]: { name: `Inbou`, bot: true } } },
  messages: [
    {
      author: inbou,
      payload: {
        components: [
          {
            type: ComponentType.Container,
            accentColor: moss,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `## まいあさ __七時__に おきます。\n-# 七時 しちじ`
              },
              {
                type: ComponentType.TextDisplay,
                content: `✅ **2 しちじ** · 3 of 5 correct\n_I get up at seven every morning._`
              },
              {
                type: ComponentType.TextDisplay,
                content: `After a number, 時 is read じ, and seven is しち here: 七時 is しちじ, never ななじ.\n-# Review on Tofugu: [時](<https://www.tofugu.com/japanese/kanji-ji-time/>) · [七](<https://www.tofugu.com/japanese/counting-to-ten/>)`
              },
              // Separator (divider, small spacing): not drawn yet.
              {
                type: ComponentType.TextDisplay,
                content: [
                  `1 ${bar(1, 3, 10)} \`1\` ななじ`,
                  `**2** ${bar(3, 3, 10)} \`3\` **しちじ** ✅`,
                  `3 ${bar(1, 3, 10)} \`1\` しつじ`,
                  `4 ${bar(0, 3, 10)} \`0\` ななとき`
                ].join(`\n`)
              }
            ]
          }
        ]
      }
    }
  ]
};

const players = {
  ember: `1311000000000000101`,
  quill: `1311000000000000102`,
  rook: `1311000000000000103`
};

/** Tome's reveal: the answer, a block quote of italic lore, a bar per option, and the scorers as mentions with bold points. */
export const tomeReveal: Scene = {
  now,
  timeZone: `America/New_York`,
  locale: `en-US`,
  context: {
    users: {
      [tome]: { name: `Tome of Knowledge`, bot: true },
      [players.ember]: { name: `Emberwing` },
      [players.quill]: { name: `quill` },
      [players.rook]: { name: `Rook of Ages` }
    }
  },
  messages: [
    {
      author: tome,
      payload: {
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
              // Separator (divider, small spacing): not drawn yet.
              {
                type: ComponentType.TextDisplay,
                content: [
                  `A ${bar(1, 4, 12)} \`1\` Black Hole`,
                  `**B** ${bar(4, 4, 12)} \`4\` **Fallen Sky** ✅`,
                  `C ${bar(2, 4, 12)} \`2\` Meteor Hammer`,
                  `D ${bar(0, 4, 12)} \`0\` Starstorm`
                ].join(`\n`)
              },
              // Separator (divider, small spacing): not drawn yet.
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

export const fixtures = { inbouQuestion, inbouReveal, tomeReveal } as const;
