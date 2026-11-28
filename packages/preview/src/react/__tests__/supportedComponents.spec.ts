import { createElement } from "react";
import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import {
  componentsV2Flag,
  modalParents,
  supportedComponents,
  type ComponentParent
} from "../../components.js";
import { placementCodes } from "../../findings.js";
import { lint } from "../../lint/index.js";
import type {
  MessagePayload,
  Scene as SceneData,
  SceneModal
} from "../../scene.js";
import { Scene } from "../Scene.js";

const button = {
  type: ComponentType.Button,
  style: 2,
  label: `Go`,
  customId: `go`
};

/** A drawable example of each supported type; any other type needs nothing but its number, since the renderer refuses it before reading a field. */
const samples: Partial<Record<number, Record<string, unknown>>> = {
  [ComponentType.Container]: { type: ComponentType.Container, components: [] },
  [ComponentType.TextDisplay]: {
    type: ComponentType.TextDisplay,
    content: `x`
  },
  [ComponentType.Separator]: { type: ComponentType.Separator },
  [ComponentType.MediaGallery]: {
    type: ComponentType.MediaGallery,
    items: [{ media: { url: `https://cdn.example/a.png` } }]
  },
  [ComponentType.ActionRow]: {
    type: ComponentType.ActionRow,
    components: [button]
  },
  [ComponentType.Button]: button,
  [ComponentType.Section]: {
    type: ComponentType.Section,
    components: [{ type: ComponentType.TextDisplay, content: `x` }],
    accessory: button
  },
  [ComponentType.Thumbnail]: {
    type: ComponentType.Thumbnail,
    media: { url: `https://cdn.example/a.png` }
  },
  [ComponentType.File]: {
    type: ComponentType.File,
    file: { url: `attachment://a.txt` }
  },
  [ComponentType.StringSelect]: {
    type: ComponentType.StringSelect,
    customId: `s`,
    options: [{ label: `A`, value: `a` }]
  },
  [ComponentType.UserSelect]: { type: ComponentType.UserSelect, customId: `u` },
  [ComponentType.RoleSelect]: { type: ComponentType.RoleSelect, customId: `r` },
  [ComponentType.MentionableSelect]: {
    type: ComponentType.MentionableSelect,
    customId: `m`
  },
  [ComponentType.ChannelSelect]: {
    type: ComponentType.ChannelSelect,
    customId: `c`
  },
  [ComponentType.Label]: {
    type: ComponentType.Label,
    label: `Q`,
    component: { type: ComponentType.Checkbox, customId: `k` }
  },
  [ComponentType.TextInput]: {
    type: ComponentType.TextInput,
    customId: `t`,
    style: 1,
    label: `T`
  },
  [ComponentType.FileUpload]: { type: ComponentType.FileUpload, customId: `f` },
  [ComponentType.RadioGroup]: {
    type: ComponentType.RadioGroup,
    customId: `r`,
    options: [
      { label: `A`, value: `a` },
      { label: `B`, value: `b` }
    ]
  },
  [ComponentType.CheckboxGroup]: {
    type: ComponentType.CheckboxGroup,
    customId: `g`,
    options: [{ label: `A`, value: `a` }]
  },
  [ComponentType.Checkbox]: { type: ComponentType.Checkbox, customId: `k` }
};

const types = Object.values(ComponentType).filter(
  (value): value is ComponentType => typeof value === `number`
);

const text = { type: ComponentType.TextDisplay, content: `x` };

const placed = (
  parent: ComponentParent,
  component: Record<string, unknown>
): unknown[] => {
  switch (parent) {
    case `message`:
      return [component];
    case `container`:
      return [{ type: ComponentType.Container, components: [component] }];
    case `actionRow`:
      return [{ type: ComponentType.ActionRow, components: [component] }];
    case `section`:
      return [
        {
          type: ComponentType.Section,
          components: [component],
          accessory: button
        }
      ];
    case `accessory`:
      return [
        {
          type: ComponentType.Section,
          components: [text],
          accessory: component
        }
      ];
    case `modal`:
      return [component];
    case `label`:
      return [{ type: ComponentType.Label, label: `Q`, component }];
    case `modalActionRow`:
      return [{ type: ComponentType.ActionRow, components: [component] }];
  }
};

/** The scene that puts one component at one position: in a message, or in a modal over an empty channel. */
const sceneFor = (parent: ComponentParent, type: ComponentType): SceneData => {
  // Built from untyped parts on purpose: the point is to hand the renderer every type in every place, including ones the client's types forbid.
  const inModal = modalParents.includes(parent);
  // A row in a modal holds a text input, where a message's holds a button.
  const sample =
    inModal && type === ComponentType.ActionRow
      ? {
          type: ComponentType.ActionRow,
          components: [samples[ComponentType.TextInput]]
        }
      : (samples[type] ?? { type });
  const components = placed(parent, sample);
  return inModal
    ? {
        messages: [],
        modal: {
          payload: { customId: `m`, title: `M`, components }
        } as unknown as SceneModal
      }
    : {
        messages: [
          {
            payload: {
              flags: componentsV2Flag,
              components
            } as unknown as MessagePayload
          }
        ]
      };
};

/** Whether the renderer draws the component, or throws its "cannot draw" error. Any other exception fails the test. */
const draws = (scene: SceneData): boolean => {
  try {
    renderToStaticMarkup(createElement(Scene, scene));
    return true;
  } catch (error) {
    expect(String(error)).toMatch(/cannot draw/);
    return false;
  }
};

/** Lint reports a placement finding (`component-unsupported`, or where the component belongs) from `supportedComponents`, and the renderer decides with its own switch statements. If the two disagreed, lint would pass a payload the renderer then throws on, or warn about one it draws fine. */
describe(`supportedComponents agrees with the renderer and with lint`, () => {
  const parents = Object.keys(supportedComponents) as ComponentParent[];
  const cases = parents.flatMap((parent) =>
    types.map((type): [ComponentParent, ComponentType] => [parent, type])
  );

  it.each(cases)(`in %s, type %i`, (parent, type) => {
    const scene = sceneFor(parent, type);
    const supported = supportedComponents[parent].includes(type);
    expect(draws(scene)).toBe(supported);
    expect(
      lint(scene).findings.some((finding) => placementCodes.has(finding.code))
    ).toBe(!supported);
  });

  it(`covers every position, in messages and in modals`, () => {
    expect(parents).toStrictEqual([
      `message`,
      `container`,
      `actionRow`,
      `section`,
      `accessory`,
      `modal`,
      `label`,
      `modalActionRow`
    ]);
  });
});
