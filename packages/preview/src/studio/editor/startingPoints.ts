import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Button } from "@discordkit/client/components/types/Button";
import type { Separator } from "@discordkit/client/components/types/Separator";
import type { TextDisplay } from "@discordkit/client/components/types/TextDisplay";
import { componentsV2Flag } from "../../components.js";
import type { Scene } from "../../scene.js";

/**
 * What Studio offers on an empty scene instead of a blank page: an empty message of each kind, and two real cards to take apart. The cards are the package's own fixtures for Inbou's question and Tome's reveal (a spec holds them equal), with the clock and the bots they need to draw as they do in the render specs.
 */

export interface StartingPoint {
  id: string;
  name: string;
  description: string;
  scene: Scene;
}

const inbou = `1311000000000000001`;
const tome = `1311000000000000002`;
const players = {
  ember: `1311000000000000101`,
  quill: `1311000000000000102`,
  rook: `1311000000000000103`
};

const indigo = 0x2f_4b_6e;
const moss = 0x4a_6b_45;
const now = `2026-11-25T11:05:00Z`;

const vote = (label: string): Button => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label,
  customId: `vote:${label}`
});

const text = (content: string): TextDisplay => ({
  type: ComponentType.TextDisplay,
  content
});

const divider: Separator = {
  type: ComponentType.Separator,
  divider: true,
  spacing: 1
};

export const startingPoints: readonly StartingPoint[] = [
  {
    id: `v2`,
    name: `Empty Components V2 message`,
    description: `Containers, text, sections, pictures and buttons, laid out as you like.`,
    scene: {
      messages: [{ payload: { flags: componentsV2Flag, components: [] } }]
    }
  },
  {
    id: `classic`,
    name: `Classic message with an embed`,
    description: `Text, up to ten embeds with fields, and rows of buttons under them.`,
    scene: {
      messages: [
        {
          payload: {
            content: `Hello from Studio.`,
            embeds: [
              {
                title: `Embed title`,
                description: `The embed's description, with **markdown**.`,
                color: 0x58_65_f2
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: `inbou-question`,
    name: `Inbou's question card`,
    description: `A container with the question, a divider, the four answers and their buttons.`,
    scene: {
      now,
      timeZone: `Asia/Tokyo`,
      locale: `en-US`,
      context: { users: { [inbou]: { name: `Inbou`, bot: true } } },
      messages: [
        {
          author: inbou,
          payload: {
            flags: componentsV2Flag,
            components: [
              {
                type: ComponentType.Container,
                accentColor: indigo,
                components: [
                  text(
                    `**もんだい4** · 18 / 24 · ends <t:1795604745:R> · 3 answered`
                  ),
                  text(
                    `-# ＿＿の ぶんと だいたい おなじ いみの ぶんが あります。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。`
                  ),
                  text(`## __兄は 先生です。__\n-# 兄 あに · 先生 せんせい`),
                  divider,
                  text(
                    [
                      `### 1　兄は がっこうで おしえて います。`,
                      `### 2　兄は びょういんで はたらいて います。`,
                      `### 3　兄は がっこうで べんきょうして います。`,
                      `### 4　兄は みせで やさいを うって います。`,
                      `-# 兄 あに`
                    ].join(`\n`)
                  ),
                  {
                    type: ComponentType.ActionRow,
                    components: [`1`, `2`, `3`, `4`].map(vote)
                  }
                ]
              },
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Danger,
                    label: `End test`,
                    customId: `exam:end`
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: `tome-reveal`,
    name: `Tome's answer reveal`,
    description: `The answer, a quote, a bar per option between dividers, and the scorers.`,
    scene: {
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
            flags: componentsV2Flag,
            components: [
              {
                type: ComponentType.Container,
                accentColor: moss,
                components: [
                  text(`✅ **B — Fallen Sky**`),
                  text(
                    [
                      `> _The star fell for a hundred nights before it struck._`,
                      `> _Those who stood beneath it are said to stand there still._`
                    ].join(`\n`)
                  ),
                  divider,
                  text(
                    [
                      `A ███░░░░░░░░░ \`1\` Black Hole`,
                      `**B** ████████████ \`4\` **Fallen Sky** ✅`,
                      `C ██████░░░░░░ \`2\` Meteor Hammer`,
                      `D ░░░░░░░░░░░░ \`0\` Starstorm`
                    ].join(`\n`)
                  ),
                  divider,
                  text(
                    [
                      `<@${players.ember}> **+3**`,
                      `<@${players.quill}> **+3**`,
                      `<@${players.rook}> **+3**`
                    ].join(`  ·  `)
                  )
                ]
              }
            ]
          }
        }
      ]
    }
  }
];

/** Whether a scene has nothing in it to edit yet, so Studio offers the starting points. */
export const isEmptyScene = (scene: Scene | undefined): boolean =>
  scene === undefined || scene.messages.length === 0;
