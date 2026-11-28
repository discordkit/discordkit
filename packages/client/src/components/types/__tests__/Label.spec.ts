import { describe, it, expect, expectTypeOf } from "vite-plus/test";
import * as v from "valibot";
import { labelSchema } from "../Label.js";
import { ComponentType } from "../ComponentType.js";
import { TextInputStyle } from "../TextInputStyle.js";
import type { StringSelect } from "../StringSelect.js";
import type { UserSelect } from "../UserSelect.js";
import type { RoleSelect } from "../RoleSelect.js";
import type { MentionableSelect } from "../MentionableSelect.js";
import type { ChannelSelect } from "../ChannelSelect.js";

const label = (component: unknown) => ({
  type: ComponentType.Label,
  label: `What did you find interesting about the game?`,
  component
});

describe(`labelSchema with a text input`, () => {
  it(`accepts a text input that has no label of its own`, () => {
    // A modal with a text field is the commonest modal there is, and Discord now wants every text input wrapped in a Label, which carries the label. The text input's own `label` is deprecated, so the modal must validate without it.
    expect(
      v.safeParse(
        labelSchema,
        label({
          type: ComponentType.TextInput,
          customId: `game_feedback`,
          style: TextInputStyle.Paragraph,
          maxLength: 4000
        })
      ).success
    ).toBe(true);
  });

  it(`still requires the text input's style`, () => {
    // Discord still documents `style` as required, so dropping `label` must not loosen it too.
    expect(
      v.safeParse(
        labelSchema,
        label({ type: ComponentType.TextInput, customId: `game_feedback` })
      ).success
    ).toBe(false);
  });
});

describe(`labelSchema with a select menu`, () => {
  // Discord documents `required` on all five select menus for use in modals. Without it in the schema, a select the developer marked optional was stripped back to Discord's default of required, so the modal behaved differently from what was sent.
  const selects = [
    {
      type: ComponentType.StringSelect,
      customId: `bug`,
      options: [{ label: `Ant`, value: `ant` }]
    },
    { type: ComponentType.UserSelect, customId: `user` },
    { type: ComponentType.RoleSelect, customId: `role` },
    { type: ComponentType.MentionableSelect, customId: `mentionable` },
    { type: ComponentType.ChannelSelect, customId: `channel` }
  ];

  it.each(selects)(`keeps \`required\` on select type $type`, (select) => {
    const result = v.safeParse(
      labelSchema,
      label({ ...select, required: false })
    );

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({ component: { required: false } });
  });

  it(`types \`required\` on every select`, () => {
    expectTypeOf<StringSelect[`required`]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<UserSelect[`required`]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<RoleSelect[`required`]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<MentionableSelect[`required`]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<ChannelSelect[`required`]>().toEqualTypeOf<
      boolean | undefined
    >();
  });
});
