import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import {
  messagesCallbackDataSchema,
  modalCallbackDataSchema
} from "../InteractionCallbackData.js";
import { ComponentType } from "../../../components/types/ComponentType.js";
import { TextInputStyle } from "../../../components/types/TextInputStyle.js";
import { MessageFlag } from "../../../messages/types/MessageFlag.js";

const text = (content: string) => ({
  type: ComponentType.TextDisplay,
  content
});

const modal = (components: unknown[]) => ({
  customId: `rules_modal`,
  title: `Server rules`,
  components
});

const feedback = {
  type: ComponentType.Label,
  label: `Do you agree?`,
  component: {
    type: ComponentType.TextInput,
    customId: `agree`,
    style: TextInputStyle.Short
  }
};

describe(`modalCallbackDataSchema text display limit`, () => {
  // Discord limits the text displays in a modal, as in a message, to 4000 characters between them. A modal over the limit used to validate here and then fail when the interaction was answered, which the user sees as a modal that never opens.

  it(`accepts text displays totalling 4000 characters`, () => {
    expect(
      v.safeParse(
        modalCallbackDataSchema,
        modal([text(`a`.repeat(2000)), text(`b`.repeat(2000)), feedback])
      ).success
    ).toBe(true);
  });

  it(`rejects text displays totalling more than 4000 characters`, () => {
    const result = v.safeParse(
      modalCallbackDataSchema,
      modal([text(`a`.repeat(2000)), text(`b`.repeat(2001)), feedback])
    );

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/4001 characters/);
    expect(result.issues?.[0].message).toMatch(/at most 4000/);
  });
});

describe(`modalCallbackDataSchema error messages`, () => {
  it(`names the missing field deep in the modal, not the array's length`, () => {
    // A text input without its `style` is a mistake inside the modal's components. The error used to read "Expected an array with a length >= 1 && <= 5", sending the developer to count components that were fine.
    const result = v.safeParse(
      modalCallbackDataSchema,
      modal([
        {
          type: ComponentType.Label,
          label: `Feedback`,
          component: { type: ComponentType.TextInput, customId: `feedback` }
        }
      ])
    );

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/style/);
    expect(result.issues?.[0].message).not.toMatch(
      /Expected an array with a length/
    );
  });
});

describe(`messagesCallbackDataSchema flags`, () => {
  it(`accepts the flags Discord allows on an interaction response`, () => {
    // An ephemeral Components V2 reply is a common response; it must validate.
    expect(
      v.safeParse(messagesCallbackDataSchema, {
        flags: MessageFlag.EPHEMERAL | MessageFlag.IS_COMPONENTS_V2,
        components: [text(`Only you can see this`)]
      }).success
    ).toBe(true);
  });

  it(`rejects a flag Discord does not allow on an interaction response`, () => {
    // Only SUPPRESS_EMBEDS, EPHEMERAL, IS_COMPONENTS_V2, IS_VOICE_MESSAGE and SUPPRESS_NOTIFICATIONS can be set here. Any integer was accepted, so a flag such as CROSSPOSTED passed validation and only failed at the API.
    const result = v.safeParse(messagesCallbackDataSchema, {
      content: `Hello`,
      flags: MessageFlag.EPHEMERAL | MessageFlag.CROSSPOSTED
    });

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toMatch(/EPHEMERAL/);
  });
});
