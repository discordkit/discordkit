import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import type { ActionRow } from "@discordkit/client/components/types/ActionRow";
import type { Component } from "@discordkit/client/components/types/Component";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Label } from "@discordkit/client/components/types/Label";
import type { TextInput } from "@discordkit/client/components/types/TextInput";
import { TextInputStyle } from "@discordkit/client/components/types/TextInputStyle";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import type { Scene, SceneModal } from "../scene.js";

/**
 * Modals, written the way Discord's component reference has them, for the renderer's, lint's and codegen's specs and for review renders. The scenes are invented: an app that collects bug reports.
 *
 * Two shapes here are correct for Discord but not for @discordkit/client's types and schemas, and are cast through `unknown` where they are built, so intake reports `schema` findings for them that the specs expect:
 * - A Text Input inside a Label has no `label` of its own (the reference calls that field deprecated), but the client's `TextInput` requires one.
 * - The older form of a field, an Action Row holding a Text Input, holds it in an array, as Discord sends and expects; the client's `ActionRow` takes a text input only as a bare object (the same defect as a select in a row, fixed for selects by #106).
 * - A select's `required` is a modal-only field the client's select types do not have; it is not a schema finding, since the schema drops unknown keys.
 */

const app = `1311000000000000301`;

/** A file in `./assets`, relative to the package, where the specs and the command line run. Written as a plain path, not through `node:url`, so the browser specs can import these fixtures; nothing reads these files, since an upload's card shows only the name and the size given here. */
const asset = (name: string): string => `src/__tests__/assets/${name}`;

/** A field component as Discord expects it, which the client's types do not describe (see above). */
const field = (value: Record<string, unknown>): Label[`component`] =>
  value as unknown as Label[`component`];

const label = (
  text: string,
  component: Label[`component`],
  description?: string
): Label => ({
  type: ComponentType.Label,
  label: text,
  ...(description === undefined ? {} : { description }),
  component
});

/** The older form: an Action Row holding one Text Input with its own `label`, in an array (see above). */
const legacyRow = (input: TextInput): ActionRow =>
  ({
    type: ComponentType.ActionRow,
    components: [input]
  }) as unknown as ActionRow;

const context: Scene[`context`] = {
  users: { [app]: { name: `Bug Catcher`, bot: true, verified: true } },
  roles: { "1311000000000000401": { name: `Moderators`, color: 0x3b_a5_5d } },
  channels: { "1311000000000000501": { name: `bug-reports`, type: 0 } },
  // A File Upload's files are named by the scene's `values`; an entry here gives one its size.
  attachments: {
    "crash-log.txt": { path: asset(`answer-key.txt`), size: 18_204 },
    "screenshot-of-the-settings-page.png": {
      path: asset(`landscape-16x9.png`),
      size: 412_377
    }
  }
};

const modalScene = (modal: SceneModal): Scene => ({
  messages: [],
  modal: { author: app, ...modal },
  context
});

/** The modal the bot opens, as the reference's own example has it: a string select and a paragraph, each in a Label. */
const reportModal = {
  customId: `bug_report`,
  title: `Report a bug`,
  components: [
    {
      type: ComponentType.TextDisplay,
      content: `Tell us what went wrong. A moderator reads every report.`
    },
    label(
      `Where did it happen?`,
      field({
        type: ComponentType.StringSelect,
        customId: `bug_area`,
        placeholder: `Choose an area`,
        options: [
          { label: `Quiz cards`, value: `quiz` },
          { label: `Study packs`, value: `packs` },
          { label: `Settings`, value: `settings` }
        ]
      })
    ),
    label(
      `What happened?`,
      field({
        type: ComponentType.TextInput,
        customId: `bug_summary`,
        style: TextInputStyle.Short,
        maxLength: 80,
        placeholder: `One line, like "the timer never stops"`
      })
    ),
    label(
      `Steps to reproduce`,
      field({
        type: ComponentType.TextInput,
        customId: `bug_steps`,
        style: TextInputStyle.Paragraph,
        minLength: 20,
        maxLength: 1000,
        placeholder: `1. Open a quiz\n2. …`
      }),
      `The more detail, the faster we can fix it.`
    ),
    label(
      `Screenshots`,
      field({
        type: ComponentType.FileUpload,
        customId: `bug_files`,
        minValues: 0,
        maxValues: 3,
        required: false
      })
    )
  ] satisfies Component[]
};

/** A message whose button opens the modal, with the modal open over it as it opens: empty. */
export const modalOpening: Scene = {
  messages: [
    {
      author: app,
      payload: {
        flags: MessageFlag.IS_COMPONENTS_V2,
        components: [
          {
            type: ComponentType.Container,
            accentColor: 0xd8_3c_3e,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `## Found a bug?\nReport it here and we'll take a look.`
              },
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Danger,
                    label: `Report a bug`,
                    customId: `open_bug_report`
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ],
  modal: { author: app, payload: reportModal },
  context
};

/** The same modal filled in, and the same after Submit with the steps too short. */
export const modalFilled: Scene = {
  ...modalOpening,
  modal: {
    author: app,
    payload: reportModal,
    values: {
      bug_area: [`quiz`],
      bug_summary: `The countdown keeps going after the card closes`,
      bug_steps: `Open a quiz.`,
      bug_files: [`screenshot-of-the-settings-page.png`, `crash-log.txt`]
    },
    submitted: true
  }
};

/** A short Text Input: empty and optional, filled, and required but left empty after Submit. */
export const shortTextInputSheet = modalScene({
  payload: {
    customId: `short_sheet`,
    title: `Short text input`,
    components: [
      label(
        `Empty`,
        field({
          type: ComponentType.TextInput,
          customId: `empty`,
          style: TextInputStyle.Short,
          required: false,
          placeholder: `A placeholder`
        }),
        `Optional, so no error after Submit.`
      ),
      label(
        `Filled`,
        field({
          type: ComponentType.TextInput,
          customId: `filled`,
          style: TextInputStyle.Short,
          placeholder: `A placeholder`
        })
      ),
      label(
        `Required`,
        field({
          type: ComponentType.TextInput,
          customId: `required`,
          style: TextInputStyle.Short,
          placeholder: `A placeholder`
        })
      ),
      label(
        `Too short`,
        field({
          type: ComponentType.TextInput,
          customId: `short`,
          style: TextInputStyle.Short,
          minLength: 10
        })
      )
    ]
  },
  values: { filled: `Something typed in`, short: `Too few` },
  submitted: true
});

/** A paragraph Text Input: empty with a counter, pre-filled by the payload, and required but left empty after Submit. */
export const paragraphTextInputSheet = modalScene({
  payload: {
    customId: `paragraph_sheet`,
    title: `Paragraph text input`,
    components: [
      label(
        `Empty`,
        field({
          type: ComponentType.TextInput,
          customId: `empty`,
          style: TextInputStyle.Paragraph,
          required: false,
          maxLength: 4000,
          placeholder: `Write your feedback here...`
        }),
        `Optional, with a counter.`
      ),
      label(
        `Filled`,
        field({
          type: ComponentType.TextInput,
          customId: `filled`,
          style: TextInputStyle.Paragraph,
          maxLength: 200,
          value: `Pre-filled by the bot.\nA second line, and a third that runs on long enough to wrap onto the next line of the box.`
        })
      ),
      label(
        `Required`,
        field({
          type: ComponentType.TextInput,
          customId: `required`,
          style: TextInputStyle.Paragraph
        })
      )
    ]
  },
  submitted: true
});

/** A String Select: empty and optional, chosen, and required but left empty after Submit. */
export const stringSelectModalSheet = modalScene({
  payload: {
    customId: `string_sheet`,
    title: `String select`,
    components: [1, 2, 3].map((index) =>
      label(
        [`Empty`, `Chosen`, `Required`][index - 1],
        field({
          type: ComponentType.StringSelect,
          customId: `select_${String(index)}`,
          placeholder: `Make a choice`,
          options: [
            {
              label: `Quiz cards`,
              value: `quiz`,
              emoji: { id: null, name: `🃏` }
            },
            { label: `Study packs`, value: `packs` }
          ],
          ...(index === 1 ? { required: false } : {})
        })
      )
    )
  },
  values: { select_2: [`quiz`] },
  submitted: true
});

/** The four selects the client fills: users and roles chosen, a mentionable required and empty after Submit, a channel empty and optional. */
export const otherSelectsModalSheet = modalScene({
  payload: {
    customId: `other_selects_sheet`,
    title: `User, role, mentionable, channel`,
    components: [
      label(
        `User select`,
        field({ type: ComponentType.UserSelect, customId: `user` })
      ),
      label(
        `Role select`,
        field({ type: ComponentType.RoleSelect, customId: `role` })
      ),
      label(
        `Mentionable select`,
        field({
          type: ComponentType.MentionableSelect,
          customId: `mentionable`
        })
      ),
      label(
        `Channel select`,
        field({
          type: ComponentType.ChannelSelect,
          customId: `channel`,
          required: false
        })
      )
    ]
  },
  values: { user: [app], role: [`1311000000000000401`] },
  submitted: true
});

/** A File Upload: empty and optional, with two files, and required but empty after Submit. */
export const fileUploadSheet = modalScene({
  payload: {
    customId: `upload_sheet`,
    title: `File upload`,
    components: [
      label(
        `Empty`,
        field({
          type: ComponentType.FileUpload,
          customId: `empty`,
          required: false,
          minValues: 0
        })
      ),
      label(
        `Two files`,
        field({
          type: ComponentType.FileUpload,
          customId: `files`,
          maxValues: 10
        })
      ),
      label(
        `Required`,
        field({ type: ComponentType.FileUpload, customId: `required` })
      )
    ]
  },
  values: {
    files: [`screenshot-of-the-settings-page.png`, `crash-log.txt`]
  },
  submitted: true
});

const classes = [
  { label: `Warrior`, value: `warrior`, description: `Strong and brave` },
  { label: `Rogue`, value: `rogue`, description: `Quick and quiet` },
  { label: `Wizard`, value: `wizard` }
];

/** A Radio Group: unchosen and optional, chosen, and required but unchosen after Submit. */
export const radioGroupSheet = modalScene({
  payload: {
    customId: `radio_sheet`,
    title: `Radio group`,
    components: [
      label(
        `Empty`,
        field({
          type: ComponentType.RadioGroup,
          customId: `empty`,
          required: false,
          options: classes
        })
      ),
      label(
        `Chosen`,
        field({
          type: ComponentType.RadioGroup,
          customId: `chosen`,
          options: classes
        }),
        `Your class decides how you play.`
      ),
      label(
        `Required`,
        field({
          type: ComponentType.RadioGroup,
          customId: `required`,
          options: classes.slice(0, 2)
        })
      )
    ]
  },
  values: { chosen: `rogue` },
  submitted: true
});

const days = [
  { label: `Monday`, value: `mon` },
  { label: `Wednesday`, value: `wed`, description: `Evenings only` },
  { label: `Saturday`, value: `sat` }
];

/** A Checkbox Group: nothing ticked and optional, two ticked, and fewer ticked than `minValues` after Submit. */
export const checkboxGroupSheet = modalScene({
  payload: {
    customId: `checkbox_group_sheet`,
    title: `Checkbox group`,
    components: [
      label(
        `Empty`,
        field({
          type: ComponentType.CheckboxGroup,
          customId: `empty`,
          required: false,
          minValues: 0,
          options: days
        })
      ),
      label(
        `Ticked`,
        field({
          type: ComponentType.CheckboxGroup,
          customId: `ticked`,
          options: days
        }),
        `Choose every day you are free.`
      ),
      label(
        `Too few`,
        field({
          type: ComponentType.CheckboxGroup,
          customId: `few`,
          minValues: 2,
          options: days
        })
      )
    ]
  },
  values: { ticked: [`mon`, `sat`], few: [`wed`] },
  submitted: true
});

/** A Checkbox: unticked, ticked by the scene, and ticked by its `default`. A checkbox cannot be required, so it has no error state. */
export const checkboxSheet = modalScene({
  payload: {
    customId: `checkbox_sheet`,
    title: `Checkbox`,
    components: [
      label(
        `Send me a copy`,
        field({ type: ComponentType.Checkbox, customId: `copy` }),
        `Unticked.`
      ),
      label(
        `I have read the rules`,
        field({ type: ComponentType.Checkbox, customId: `rules` })
      ),
      label(
        `Notify the moderators`,
        field({
          type: ComponentType.Checkbox,
          customId: `notify`,
          default: true
        }),
        `Ticked by its default.`
      )
    ]
  },
  values: { rules: true },
  submitted: true
});

/** The older form, Action Rows of one Text Input with its own label: empty and optional, filled, and required but empty after Submit; and a Text Display between them. */
export const legacyTextInputSheet = modalScene({
  payload: {
    customId: `legacy_sheet`,
    title: `Text inputs in Action Rows`,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `The older form, which Discord now calls deprecated.`
      },
      legacyRow({
        type: ComponentType.TextInput,
        customId: `empty`,
        label: `Empty`,
        style: TextInputStyle.Short,
        required: false
      }),
      legacyRow({
        type: ComponentType.TextInput,
        customId: `filled`,
        label: `Filled`,
        style: TextInputStyle.Short
      }),
      legacyRow({
        type: ComponentType.TextInput,
        customId: `required`,
        label: `Required`,
        style: TextInputStyle.Paragraph
      })
    ]
  },
  values: { filled: `Typed in` },
  submitted: true
});

/** Every modal scene, for the review renders and the specs that walk all fixtures. */
export const modalScenes = {
  modalOpening,
  modalFilled,
  shortTextInputSheet,
  paragraphTextInputSheet,
  stringSelectModalSheet,
  otherSelectsModalSheet,
  fileUploadSheet,
  radioGroupSheet,
  checkboxGroupSheet,
  checkboxSheet,
  legacyTextInputSheet
} as const;
