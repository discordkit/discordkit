import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { embedSchema } from "../Embed.js";
import { EmbedFlags } from "../EmbedFlags.js";
import { EmbedType } from "../EmbedType.js";
import { ComponentType } from "../../../components/types/ComponentType.js";

describe(`embedSchema`, () => {
  it(`keeps the content-scanning flags on an embed`, () => {
    // An app that reposts user media is expected to act on these flags. Before the field existed the schema dropped it, so a flagged embed looked clean.
    const flags =
      EmbedFlags.CONTAINS_EXPLICIT_CONTENT | EmbedFlags.CONTAINS_GORE_CONTENT;

    expect(
      v.parse(embedSchema, { type: EmbedType.IMAGE, flags })
    ).toMatchObject({ flags });
  });

  it(`parses a link preview built from components`, () => {
    // `components` embeds carry their content in `components` instead of the classic embed fields.
    const result = v.safeParse(embedSchema, {
      type: `components`,
      url: `https://example.com/article`,
      components: [{ type: ComponentType.TextDisplay, content: `Headline` }]
    });

    expect(result.success).toBe(true);
  });
});
