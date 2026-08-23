import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { sectionSchema } from "../Section.js";
import { ComponentType } from "../ComponentType.js";

describe(`sectionSchema`, () => {
  it(`names the accessory as Discord does`, () => {
    // Discord names this field `accessory`; the misspelling serialised to a
    // field Discord drops, so a Section could never render its accessory.
    const result = v.safeParse(sectionSchema, {
      type: ComponentType.Section,
      components: [{ type: ComponentType.TextDisplay, content: `Hello` }],
      accessory: {
        type: ComponentType.Button,
        style: 2,
        label: `Go`,
        customId: `go`
      }
    });

    expect(result.success).toBe(true);
  });
});
