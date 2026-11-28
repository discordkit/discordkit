import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { textDisplaySchema } from "../TextDisplay.js";
import { ComponentType } from "../ComponentType.js";

const text = (content: string) => ({
  type: ComponentType.TextDisplay,
  content
});

describe(`textDisplaySchema content`, () => {
  it(`accepts content of 4000 characters`, () => {
    expect(v.safeParse(textDisplaySchema, text(`a`.repeat(4000))).success).toBe(
      true
    );
  });

  it(`rejects content longer than 4000 characters`, () => {
    // Discord documents a single text display's content as up to 4000 characters, and the schema accepted any length. Validating the text display on its own, as a previewer does while it is being edited, let an over-long one through.
    const result = v.safeParse(textDisplaySchema, text(`a`.repeat(4001)));

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/4001 characters/);
  });
});
