import { createElement } from "react";
import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import {
  componentsV2Flag,
  supportedComponents,
  type ComponentParent
} from "../../components.js";
import type { MessagePayload } from "../../scene.js";
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
  }
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
  }
};

/** Whether the renderer draws the component, or throws its "cannot draw" error. Any other exception fails the test. */
const draws = (parent: ComponentParent, type: ComponentType): boolean => {
  // Built from untyped parts on purpose: the point is to hand the renderer every type in every place, including ones the client's types forbid.
  const payload = {
    flags: componentsV2Flag,
    components: placed(parent, samples[type] ?? { type })
  } as unknown as MessagePayload;
  try {
    renderToStaticMarkup(createElement(Scene, { messages: [{ payload }] }));
    return true;
  } catch (error) {
    expect(String(error)).toMatch(/cannot draw/);
    return false;
  }
};

/** Lint reports `component-unsupported` from `supportedComponents`, and the renderer decides with its own switch statements. If the two disagreed, lint would pass a payload the renderer then throws on, or warn about one it draws fine. */
describe(`supportedComponents agrees with the renderer`, () => {
  const parents: ComponentParent[] = [
    `message`,
    `container`,
    `actionRow`,
    `section`,
    `accessory`
  ];
  const cases = parents.flatMap((parent) =>
    types.map((type): [ComponentParent, ComponentType] => [parent, type])
  );

  it.each(cases)(`in %s, type %i`, (parent, type) => {
    expect(draws(parent, type)).toBe(
      supportedComponents[parent].includes(type)
    );
  });
});
