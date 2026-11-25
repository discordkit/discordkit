import { describe, it, expect, expectTypeOf } from "vite-plus/test";
import * as v from "valibot";
import { type ActionRow, actionRowSchema } from "../ActionRow.js";
import type { Button } from "../Button.js";
import { ButtonStyle } from "../ButtonStyle.js";
import { ComponentType } from "../ComponentType.js";
import type { Select } from "../Select.js";
import type { TextInput } from "../TextInput.js";
import { TextInputStyle } from "../TextInputStyle.js";

const button = (customId: string) => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label: customId,
  customId
});

const stringSelect = (customId: string) => ({
  type: ComponentType.StringSelect,
  customId,
  options: [{ label: `Anti-Mage`, value: `antimage` }]
});

describe(`actionRowSchema`, () => {
  it(`accepts a string select wrapped in the components array`, () => {
    // An action row is the only place a select menu can go in a message, and Discord always sends and expects `components` as an array. The schema used to accept a select only as a bare object, so no select menu could be sent, and any real message containing one failed to parse.
    expect(
      v.safeParse(actionRowSchema, {
        type: ComponentType.ActionRow,
        components: [stringSelect(`hero`)]
      }).success
    ).toBe(true);
  });

  it(`accepts the auto-populated selects too`, () => {
    // User, role, mentionable and channel selects share the action row rule with string selects; a fix that only covered one of them would leave the rest unsendable.
    expect(
      v.safeParse(actionRowSchema, {
        type: ComponentType.ActionRow,
        components: [{ type: ComponentType.UserSelect, customId: `who` }]
      }).success
    ).toBe(true);
  });

  it(`rejects the bare select object the old schema accepted`, () => {
    // Discord never sends this shape and rejects it on a request, so accepting it only hid the mistake until the API call failed.
    expect(
      v.safeParse(actionRowSchema, {
        type: ComponentType.ActionRow,
        components: stringSelect(`hero`)
      }).success
    ).toBe(false);
  });

  it(`rejects two selects in one row`, () => {
    // Discord allows exactly one select per action row; a second one needs its own row.
    const result = v.safeParse(actionRowSchema, {
      type: ComponentType.ActionRow,
      components: [stringSelect(`hero`), stringSelect(`item`)]
    });

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/exactly one select menu/);
  });

  it(`rejects a select mixed with buttons`, () => {
    // A row holds buttons or a single select, never both, so this has to fail here rather than at the API.
    expect(
      v.safeParse(actionRowSchema, {
        type: ComponentType.ActionRow,
        components: [button(`yes`), stringSelect(`hero`)]
      }).success
    ).toBe(false);
  });

  it(`still accepts up to five buttons and rejects a sixth`, () => {
    // The button rule was right before the fix and must survive it.
    const row = (count: number) => ({
      type: ComponentType.ActionRow,
      components: Array.from({ length: count }, (_, i) => button(`b${i}`))
    });

    expect(v.safeParse(actionRowSchema, row(5)).success).toBe(true);
    expect(v.safeParse(actionRowSchema, row(6)).success).toBe(false);
  });

  it(`types components as an array in every case`, () => {
    // Code that builds an action row is checked against this type, so it has to say what Discord accepts: an array of buttons, of selects, or of text inputs, never a bare component and never a mix.
    expectTypeOf<ActionRow[`components`]>().toEqualTypeOf<
      Button[] | Select[] | TextInput[]
    >();
  });

  it(`accepts a single text input for a legacy modal`, () => {
    // Discord deprecated text inputs in action rows in favour of Label, but existing modals still send them, so dropping the shape would break those apps.
    expect(
      v.safeParse(actionRowSchema, {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            customId: `reason`,
            style: TextInputStyle.Short,
            label: `Reason`
          }
        ]
      }).success
    ).toBe(true);
  });
});
