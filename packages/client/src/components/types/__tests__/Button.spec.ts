import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { buttonSchema } from "../Button.js";
import { ButtonStyle } from "../ButtonStyle.js";
import { ComponentType } from "../ComponentType.js";

const button = (emoji: unknown) => ({
  type: ComponentType.Button,
  style: ButtonStyle.Primary,
  label: `Hot take`,
  customId: `hot`,
  emoji
});

describe(`buttonSchema emoji`, () => {
  it(`accepts a Unicode emoji given only its name`, () => {
    // `{ name: "🔥" }` is how Discord's own examples write a Unicode emoji, and Discord accepts it. Requiring `id: null` on top made the commonest emoji button fail validation for a field that carries no information.
    expect(v.safeParse(buttonSchema, button({ name: `🔥` })).success).toBe(
      true
    );
  });

  it(`still reads a Unicode emoji that Discord returns with a null id`, () => {
    // Responses can carry `id: null` for a Unicode emoji; loosening the request side must not stop those from parsing.
    expect(
      v.safeParse(buttonSchema, button({ id: null, name: `🔥` })).success
    ).toBe(true);
  });

  it(`still accepts a custom emoji`, () => {
    expect(
      v.safeParse(
        buttonSchema,
        button({ id: `41771983429993937`, name: `LUL`, animated: false })
      ).success
    ).toBe(true);
  });
});
