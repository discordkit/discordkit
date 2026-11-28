import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { messageComponentData } from "../MessageComponentData.js";
import { ComponentType } from "../../../components/types/ComponentType.js";

describe(`messageComponentData`, () => {
  it(`parses the selected values of a select menu as strings`, () => {
    // When a user picks from a select menu in a message, Discord sends the chosen option values as plain strings (`["butterfly"]`), not option objects. Expecting objects made every select menu interaction fail to parse.
    const result = v.safeParse(messageComponentData, {
      customId: `favorite_bug`,
      componentType: ComponentType.StringSelect,
      values: [`butterfly`]
    });

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({ values: [`butterfly`] });
  });
});
