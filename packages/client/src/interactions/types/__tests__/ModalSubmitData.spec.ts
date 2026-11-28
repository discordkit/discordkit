import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { modalSubmitData } from "../ModalSubmitData.js";
import { ComponentType } from "../../../components/types/ComponentType.js";

// The payloads below follow the "Modal Submit Interaction Data" examples in Discord's component reference, camel-cased the way the client receives them.

const label = (id: number, component: unknown) => ({
  type: ComponentType.Label,
  id,
  component
});

const textInput = {
  type: ComponentType.TextInput,
  id: 2,
  customId: `game_feedback`,
  value: `The recent changes to acceleration feel much better, but shadows still need help`
};

describe(`modalSubmitData`, () => {
  it(`parses a text input submitted from a Label`, () => {
    // A modal with a text field is the commonest modal there is. What Discord sends back is the response shape: the Label carries only `type`, `id` and `component`, and the text input carries its `value`, not the `style` and `label` it was created with. Parsing it with the request schema rejected every real submission.
    const result = v.safeParse(modalSubmitData, {
      customId: `game_feedback_modal`,
      components: [label(1, textInput)]
    });

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({
      components: [{ component: { value: textInput.value } }]
    });
  });

  it(`parses a legacy submission of action rows holding text inputs`, () => {
    // Modals built before Labels existed put each text input in an action row, and their submissions still arrive that way.
    expect(
      v.safeParse(modalSubmitData, {
        customId: `legacy_modal`,
        components: [
          {
            type: ComponentType.ActionRow,
            id: 1,
            components: [textInput]
          }
        ]
      }).success
    ).toBe(true);
  });

  it.each([
    [
      `string select`,
      {
        type: ComponentType.StringSelect,
        id: 2,
        customId: `favorite_bug`,
        values: [`butterfly`]
      }
    ],
    [
      `user select`,
      {
        type: ComponentType.UserSelect,
        id: 2,
        customId: `user_selected`,
        values: [`11111111111111111`]
      }
    ],
    [
      `role select`,
      {
        type: ComponentType.RoleSelect,
        id: 2,
        customId: `role_selected`,
        values: [`11111111111111111`]
      }
    ],
    [
      `mentionable select`,
      {
        type: ComponentType.MentionableSelect,
        id: 2,
        customId: `mentioned`,
        values: [`11111111111111111`]
      }
    ],
    [
      `channel select`,
      {
        type: ComponentType.ChannelSelect,
        id: 2,
        customId: `channel_selected`,
        values: [`11111111111111111`]
      }
    ],
    [
      `file upload`,
      {
        type: ComponentType.FileUpload,
        id: 2,
        customId: `file_upload`,
        values: [`111111111111111111111`]
      }
    ],
    [
      `radio group with a choice`,
      {
        type: ComponentType.RadioGroup,
        id: 2,
        customId: `class`,
        value: `wizard`
      }
    ],
    [
      `radio group left unanswered`,
      { type: ComponentType.RadioGroup, id: 2, customId: `class`, value: null }
    ],
    [
      `checkbox group`,
      {
        type: ComponentType.CheckboxGroup,
        id: 2,
        customId: `days`,
        values: [`march-4`, `march-9`]
      }
    ],
    [
      `checkbox group left empty`,
      { type: ComponentType.CheckboxGroup, id: 2, customId: `days`, values: [] }
    ],
    [
      `checkbox`,
      { type: ComponentType.Checkbox, id: 2, customId: `secret`, value: true }
    ]
  ])(`parses a submitted %s`, (_, component) => {
    // Each interactive modal component has its own response shape; a submission containing any of them must parse, or the app cannot read what the user entered.
    const result = v.safeParse(modalSubmitData, {
      customId: `modal`,
      components: [label(1, component)]
    });

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({ components: [{ component }] });
  });

  it(`parses a text display alongside the answers`, () => {
    // A text display in a modal comes back as just its `type` and `id`.
    expect(
      v.safeParse(modalSubmitData, {
        customId: `jail_modal`,
        components: [
          { type: ComponentType.TextDisplay, id: 1 },
          label(2, {
            type: ComponentType.UserSelect,
            id: 3,
            customId: `user_selected`,
            values: [`11111111111111111`]
          })
        ]
      }).success
    ).toBe(true);
  });

  it(`keeps the resolved data for uploaded files`, () => {
    // A file upload's `values` are only attachment ids; the files themselves are in `resolved`, so dropping it would leave the upload unusable.
    const result = v.safeParse(modalSubmitData, {
      customId: `bug_submit_modal`,
      components: [
        label(1, {
          type: ComponentType.FileUpload,
          id: 2,
          customId: `file_upload`,
          values: [`111111111111111111111`]
        })
      ],
      resolved: {
        attachments: {
          "111111111111111111111": {
            id: `111111111111111111111`,
            filename: `bug.png`,
            size: 241394,
            url: `https://cdn.discordapp.com/ephemeral-attachments/2222222222222222222/111111111111111111111/bug.png`,
            proxyUrl: `https://media.discordapp.net/ephemeral-attachments/2222222222222222222/111111111111111111111/bug.png`
          }
        }
      }
    });

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({
      resolved: {
        attachments: { "111111111111111111111": { filename: `bug.png` } }
      }
    });
  });

  it(`rejects a text input in its request shape`, () => {
    // A submission always carries the user's `value`. A text input with `style` and `label` instead is a modal definition, not a submission, and accepting it would hide a mix-up between the two.
    expect(
      v.safeParse(modalSubmitData, {
        customId: `game_feedback_modal`,
        components: [
          label(1, {
            type: ComponentType.TextInput,
            id: 2,
            customId: `game_feedback`,
            style: 2,
            label: `Feedback`
          })
        ]
      }).success
    ).toBe(false);
  });

  it(`rejects a doubly nested components array`, () => {
    // Pins an earlier fix: the components field is already an array, so an extra array around it must not come back.
    expect(
      v.safeParse(modalSubmitData, {
        customId: `game_feedback_modal`,
        components: [[label(1, textInput)]]
      }).success
    ).toBe(false);
  });
});
