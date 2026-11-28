import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Select } from "@discordkit/client/components/types/Select";
import type { SelectOption } from "@discordkit/client/components/types/SelectOption";
import type { ActionRow } from "@discordkit/client/components/types/ActionRow";
import type { SceneProps } from "../Scene.js";
import controlStyles from "../SelectControl.module.css";
import popoutStyles from "../SelectPopout.module.css";
import {
  byClass,
  dark,
  expectColor,
  find,
  mountComponents,
  mountScene
} from "./mount.js";

/**
 * A select menu is how a card offers more choices than five buttons hold, and an author choosing its placeholder and option labels needs to see them. Values from Discord build 679963: the message select is up to 400px wide and at least 40px tall, padded 8px with 12px at the start, its placeholder in the subtle colour, 60% opacity when disabled; several chosen options are tags on the low background with 3px corners, and a member, role or channel select's are pills in a 1px muted border. Open, its list is 8px below it on the higher surface, in a 1px subtle border with 8px corners, each option padded 8px at 16px on a 20px line.
 */

/** A select in its action row, in the array Discord expects. The client's `ActionRow` type has a select as a bare object (a schema defect, fixed in #106), so the row is cast. */
const row = (select: Select): ActionRow =>
  ({
    type: ComponentType.ActionRow,
    components: [select]
  }) as unknown as ActionRow;

const options = (chosen: string[] = []): SelectOption[] =>
  [`N5`, `N4`, `N3`].map((label) => ({
    label,
    value: label.toLowerCase(),
    ...(chosen.includes(label) ? { default: true } : {})
  }));

const stringSelect = (overrides: Partial<Select> = {}): Select => ({
  type: ComponentType.StringSelect,
  customId: `level`,
  options: options(),
  ...overrides
});

const context: SceneProps[`context`] = {
  users: { "1": { name: `Emberwing` }, "2": { name: `quill` } },
  roles: { "10": { name: `N5 learners`, color: 0x34_98_db } },
  channels: { "20": { name: `study-hall` } },
  emoji: { "30": { name: `sprout`, url: `https://cdn.example/sprout.png` } }
};

/** Mounts one select in a container, as a card holds it, and returns its control. */
const mountSelect = (
  select: Select,
  scene: Omit<SceneProps, `messages`> = {}
): HTMLElement =>
  find(
    mountComponents(
      [{ type: ComponentType.Container, components: [row(select)] }],
      { context, ...scene }
    ),
    byClass(controlStyles.select)
  );

/** The text of each chosen value a closed select shows, without the initial of a drawn avatar beside it. */
const shown = (control: HTMLElement): string[] =>
  [
    ...control.querySelectorAll(
      [
        controlStyles.singleValueLabel,
        controlStyles.tagLabel,
        controlStyles.pillLabel
      ]
        .map(byClass)
        .join(`, `)
    )
  ].map((label) => label.textContent);

const box = (element: Element): DOMRect => element.getBoundingClientRect();
const style = (element: Element): CSSStyleDeclaration =>
  getComputedStyle(element);

describe(`a closed select menu`, () => {
  it(`is 400px wide and 40px tall, with 8px corners, padded 8px and 12px at the start`, () => {
    const control = mountSelect(stringSelect());
    expect(box(control).width).toBe(400);
    expect(box(control).height).toBe(40);
    expect(style(control).borderTopLeftRadius).toBe(`8px`);
    expect([
      style(control).paddingTop,
      style(control).paddingRight,
      style(control).paddingLeft
    ]).toStrictEqual([`8px`, `8px`, `12px`]);
  });

  it(`fills a phone-width column instead of its 400px`, () => {
    const control = mountSelect(stringSelect(), { width: 360 });
    expect(box(control).width).toBeLessThan(400);
    expect(box(control).right).toBeLessThanOrEqual(360);
  });

  it(`is filled and outlined like Discord's input fields`, () => {
    const control = mountSelect(stringSelect());
    expectColor(style(control).backgroundColor, dark.inputBackground);
    expect(style(control).borderTopWidth).toBe(`1px`);
    expectColor(style(control).borderTopColor, dark.inputBorder);
  });

  it(`shows the payload's placeholder in the subtle colour`, () => {
    const control = mountSelect(
      stringSelect({ placeholder: `Choose your level` })
    );
    const placeholder = find(control, byClass(controlStyles.placeholder));
    expect(placeholder.textContent).toBe(`Choose your level`);
    expectColor(style(placeholder).color, dark.textSubtle);
  });

  it(`says "Make a selection" when the payload sets no placeholder`, () => {
    const control = mountSelect(stringSelect());
    expect(control.textContent).toBe(`Make a selection`);
  });

  it(`shows the option marked default instead of the placeholder, with its emoji at 16px 8px before it`, () => {
    const control = mountSelect(
      stringSelect({
        placeholder: `Choose your level`,
        options: [
          { label: `N5`, value: `n5` },
          {
            label: `N4`,
            value: `n4`,
            default: true,
            emoji: { id: `30`, name: `sprout` }
          }
        ]
      })
    );
    expect(control.textContent).toBe(`N4`);
    const image = control.querySelector(`img`);
    const holder = image?.parentElement;
    if (!image || !holder) throw new Error(`No emoji was drawn.`);
    expect([box(image).width, box(image).height]).toStrictEqual([16, 16]);
    expect(style(holder).marginRight).toBe(`8px`);
  });

  it(`shows several defaults of a multi-select as tags 4px apart, on the low background with 3px corners`, () => {
    const control = mountSelect(
      stringSelect({ maxValues: 3, options: options([`N5`, `N3`]) })
    );
    const tags = [
      ...control.querySelectorAll(byClass(controlStyles.optionTag))
    ];
    expect(tags.map((tag) => tag.textContent)).toStrictEqual([`N5`, `N3`]);
    expect(box(tags[1]).left - box(tags[0]).right).toBe(4);
    const tag = style(tags[0]);
    expectColor(tag.backgroundColor, dark.backgroundBaseLow);
    expectColor(tag.color, dark.interactiveTextActive);
    expect(tag.borderTopLeftRadius).toBe(`3px`);
    expect([tag.paddingTop, tag.paddingLeft]).toStrictEqual([`6px`, `8px`]);
  });

  it(`shows only the first default of a single-choice select, since it holds one value`, () => {
    const control = mountSelect(
      stringSelect({ options: options([`N5`, `N3`]) })
    );
    expect(control.textContent).toBe(`N5`);
  });

  it(`draws a disabled select at 60% opacity`, () => {
    const control = mountSelect(stringSelect({ disabled: true }));
    expect(style(control).opacity).toBe(`0.6`);
  });

  it(`shows a user select's default user by their name from the scene, as a mention would`, () => {
    const control = mountSelect({
      type: ComponentType.UserSelect,
      customId: `buddy`,
      defaultValues: [{ id: `1`, type: `user` }]
    });
    expect(shown(control)).toStrictEqual([`Emberwing`]);
  });

  it(`shows a user the scene does not list as unknown-user`, () => {
    const control = mountSelect({
      type: ComponentType.UserSelect,
      customId: `buddy`,
      defaultValues: [{ id: `99`, type: `user` }]
    });
    expect(shown(control)).toStrictEqual([`unknown-user`]);
  });

  it(`shows a multi-select's default members, roles and channels as pills in a 1px muted border`, () => {
    const control = mountSelect({
      type: ComponentType.MentionableSelect,
      customId: `ping`,
      maxValues: 3,
      defaultValues: [
        { id: `2`, type: `user` },
        { id: `10`, type: `role` }
      ]
    });
    const pills = [...control.querySelectorAll(byClass(controlStyles.pill))];
    expect(pills).toHaveLength(2);
    expect(shown(control)).toStrictEqual([`quill`, `N5 learners`]);
    const pill = style(pills[0]);
    expect(pill.borderTopWidth).toBe(`1px`);
    expectColor(pill.borderTopColor, dark.borderMuted);
    expectColor(pill.backgroundColor, dark.backgroundBaseLow);
    expect(pill.borderTopLeftRadius).toBe(`4px`);
    expect(pill.fontSize).toBe(`14px`);
  });

  it(`shows a role select's default role and a channel select's default channel by name`, () => {
    expect(
      mountSelect({
        type: ComponentType.RoleSelect,
        customId: `role`,
        defaultValues: [{ id: `10`, type: `role` }]
      }).textContent
    ).toBe(`N5 learners`);
    expect(
      mountSelect({
        type: ComponentType.ChannelSelect,
        customId: `channel`,
        defaultValues: [{ id: `20`, type: `channel` }]
      }).textContent
    ).toBe(`study-hall`);
  });
});

describe(`an open string select`, () => {
  /** Mounts a message whose `openSelect` names the select, and returns its control and list. */
  const mountOpen = (
    select: Select
  ): { control: HTMLElement; list: HTMLElement; options: HTMLElement[] } => {
    const root = mountScene({
      context,
      messages: [
        {
          openSelect: `level`,
          payload: {
            components: [
              { type: ComponentType.Container, components: [row(select)] }
            ]
          }
        }
      ]
    });
    const list = find(root, byClass(popoutStyles.popout));
    return {
      control: find(root, byClass(controlStyles.select)),
      list,
      options: [
        ...list.querySelectorAll<HTMLElement>(byClass(popoutStyles.option))
      ]
    };
  };

  it(`hangs its list 8px below the control, as wide as it`, () => {
    const { control, list } = mountOpen(stringSelect());
    expect(box(list).top - box(control).bottom).toBe(8);
    expect(box(list).left).toBe(box(control).left);
    expect(box(list).width).toBe(box(control).width);
  });

  it(`draws the list on the higher surface in a 1px subtle border with 8px corners`, () => {
    const { list } = mountOpen(stringSelect());
    expectColor(style(list).backgroundColor, dark.backgroundSurfaceHigher);
    expect(style(list).borderTopWidth).toBe(`1px`);
    expectColor(style(list).borderTopColor, dark.borderSubtle);
    expect(style(list).borderTopLeftRadius).toBe(`8px`);
  });

  it(`lists every option, padded 8px, at 16px on a 20px line in the subtle colour`, () => {
    const { options: drawn } = mountOpen(stringSelect());
    expect(drawn.map((option) => option.textContent)).toStrictEqual([
      `N5`,
      `N4`,
      `N3`
    ]);
    const option = style(drawn[0]);
    expect(option.paddingTop).toBe(`8px`);
    expect(option.fontSize).toBe(`16px`);
    expect(option.lineHeight).toBe(`20px`);
    expectColor(option.color, dark.textSubtle);
    expect(box(drawn[0]).height).toBe(36);
  });

  it(`highlights the default option of a single-choice select and marks it in blurple`, () => {
    const { options: drawn } = mountOpen(
      stringSelect({ options: options([`N4`]) })
    );
    const chosen = style(drawn[1]);
    expectColor(chosen.backgroundColor, dark.interactiveBackgroundSelected);
    expectColor(chosen.color, dark.interactiveTextActive);
    expect(chosen.fontWeight).toBe(`500`);
    const mark = drawn[1].querySelector(`svg`);
    if (!mark) throw new Error(`No selected mark.`);
    expectColor(style(mark).color, dark.brand);
    expect(drawn[0].querySelector(`svg`)).toBeNull();
  });

  it(`gives every option of a multi-select a 20px box with 6px corners, filled blurple where chosen`, () => {
    const { options: drawn } = mountOpen(
      stringSelect({ maxValues: 3, options: options([`N5`]) })
    );
    const boxes = drawn.map((option) =>
      find(option, byClass(popoutStyles.checkbox))
    );
    expect([box(boxes[0]).width, box(boxes[0]).height]).toStrictEqual([20, 20]);
    expect(style(boxes[0]).borderTopLeftRadius).toBe(`6px`);
    expectColor(style(boxes[0]).backgroundColor, dark.brand);
    expectColor(style(boxes[1]).borderTopColor, dark.borderStrong);
    // A chosen option in a multi-select is not highlighted; its box says it is chosen.
    expectColor(style(drawn[0]).backgroundColor, [0, 0, 0, 0]);
  });

  it(`puts a description under the label at 14px, lined up with the label's text past an emoji`, () => {
    const { options: drawn } = mountOpen(
      stringSelect({
        options: [
          {
            label: `N5`,
            value: `n5`,
            description: `About 100 kanji`,
            emoji: { id: `30`, name: `sprout` }
          }
        ]
      })
    );
    const label = find(drawn[0], byClass(popoutStyles.label));
    const description = find(drawn[0], byClass(popoutStyles.description));
    expect(description.textContent).toBe(`About 100 kanji`);
    expect(style(description).fontSize).toBe(`14px`);
    expectColor(style(description).color, dark.interactiveTextDefault);
    expectColor(style(label).color, dark.textStrong);
    expect(box(description).top - box(label).bottom).toBe(4);
    // The emoji's 1.375em at 14px plus its 8px margin is the 27px the description is indented by.
    expect(box(description).left - box(label).left).toBe(27);
  });
});
