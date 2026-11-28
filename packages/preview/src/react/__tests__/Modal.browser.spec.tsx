import { describe, expect, it } from "vite-plus/test";
import {
  checkboxGroupSheet,
  checkboxSheet,
  fileUploadSheet,
  modalFilled,
  modalOpening,
  paragraphTextInputSheet,
  radioGroupSheet,
  shortTextInputSheet
} from "../../__tests__/modalFixtures.js";
import checkboxStyles from "../CheckboxMark.module.css";
import fieldStyles from "../FieldFrame.module.css";
import uploadStyles from "../FileUpload.module.css";
import modalStyles from "../Modal.module.css";
import radioStyles from "../RadioGroup.module.css";
import selectStyles from "../SelectControl.module.css";
import inputStyles from "../TextInput.module.css";
import { byClass, dark, expectColor, find, mountScene } from "./mount.js";

/**
 * A modal as the desktop client draws it, held to Discord build 679963's stylesheet where it has the value, and to Discord's own screenshots of the dialog in its component reference where the stylesheet leaves it to JavaScript (marked "screenshot" below). A designer reviewing a form reads these sizes: the dialog's width, the fields' heights, the space between them.
 */

const box = (element: Element): DOMRect => element.getBoundingClientRect();

/** The dark theme's values for the modal's own tokens, from tokens.module.css. */
const modalDark = {
  critical: [248, 126, 122],
  warning: [234, 152, 0],
  warningFill: [248, 163, 0, 0.078],
  placeholder: [143, 144, 151],
  scrim: [0, 0, 0, 0.722]
} as const;

describe(`the dialog`, () => {
  it(`is up to 480px wide on the surface-high fill, with a 1px subtle border and 12px corners, over a scrim that covers the whole scene`, () => {
    const root = mountScene({ ...modalOpening, width: 732 });
    const dialog = find(root, `dialog`);
    const style = getComputedStyle(dialog);
    expect(box(dialog).width).toBe(480);
    expect(style.borderTopWidth).toBe(`1px`);
    expect(style.borderRadius).toBe(`12px`);
    expectColor(style.backgroundColor, dark.backgroundSurfaceHigh);
    expectColor(style.borderTopColor, dark.borderSubtle);
    const scrim = find(root, byClass(modalStyles.backdrop));
    expectColor(getComputedStyle(scrim).backgroundColor, modalDark.scrim);
    expect(box(scrim).height).toBe(box(root).height);
    // Centred in the column.
    expect(box(dialog).left - box(root).left).toBe(126);
  });

  it(`narrows to a column narrower than 480px, 16px in from each side, rather than overflowing it`, () => {
    const root = mountScene({ ...modalFilled, width: 360 });
    expect(box(find(root, `dialog`)).width).toBe(328);
    expect(root.scrollWidth).toBe(360);
  });

  it(`sets the title at 24px semibold on a 32px line, 24px from the top, beside a 24px round app icon 12px before it (screenshot)`, () => {
    const root = mountScene(modalOpening);
    const dialog = find(root, `dialog`);
    const title = find(dialog, `h1`);
    const style = getComputedStyle(title);
    expect(style.fontSize).toBe(`24px`);
    expect(style.fontWeight).toBe(`600`);
    expect(style.lineHeight).toBe(`32px`);
    expect(title.textContent).toBe(`Report a bug`);
    expect(box(title).top - box(dialog).top).toBe(25);
    const icon = find(dialog, byClass(modalStyles.appIcon));
    expect(box(icon).width).toBe(24);
    expect(box(title).left - box(icon).right).toBe(12);
  });

  it(`warns that the form goes to the app, naming it, in a callout with the warning colours, padded 8px with 4px corners`, () => {
    const root = mountScene(modalOpening);
    const notice = find(root, byClass(modalStyles.notice));
    expect(notice.textContent).toBe(
      `This form will be submitted to Bug Catcher. Do not share passwords or other sensitive information.`
    );
    const style = getComputedStyle(notice);
    expect(style.padding).toBe(`8px`);
    expect(style.borderRadius).toBe(`4px`);
    expectColor(style.borderTopColor, modalDark.warning);
    expectColor(style.backgroundColor, modalDark.warningFill);
  });

  it(`ends with Cancel and Submit sharing the width 8px apart, 40px tall, 24px from the bottom`, () => {
    const root = mountScene(modalOpening);
    const dialog = find(root, `dialog`);
    const [cancel, submit] = dialog.querySelectorAll(`button`);
    expect(cancel.textContent).toBe(`Cancel`);
    expect(submit.textContent).toBe(`Submit`);
    expect(box(cancel).width).toBe(box(submit).width);
    expect(box(submit).left - box(cancel).right).toBe(8);
    expect(box(submit).height).toBe(40);
    expect(Math.round(box(dialog).bottom - box(submit).bottom)).toBe(25);
    expectColor(getComputedStyle(submit).backgroundColor, dark.brand);
    expectColor(getComputedStyle(cancel).backgroundColor, dark.secondaryButton);
  });

  it(`keeps the messages behind it at the bottom of the channel`, () => {
    const root = mountScene(modalOpening);
    const message =
      root.querySelector(`dialog`)?.parentElement?.previousElementSibling;
    if (!(message instanceof HTMLElement)) throw new Error(`No messages.`);
    expect(Math.round(box(message).bottom)).toBeGreaterThan(
      Math.round(box(find(root, `dialog`)).bottom)
    );
  });
});

describe(`a field`, () => {
  it(`titles it at 16px semibold with a red asterisk 4px after when it is required, and its control 8px under (screenshot)`, () => {
    const root = mountScene(modalOpening);
    const [title] = root.querySelectorAll(byClass(fieldStyles.title));
    const style = getComputedStyle(title);
    expect(style.fontSize).toBe(`16px`);
    expect(style.fontWeight).toBe(`600`);
    const required = find(title, byClass(fieldStyles.required));
    expect(required.textContent).toBe(`*`);
    expect(getComputedStyle(required).marginLeft).toBe(`4px`);
    expectColor(getComputedStyle(required).color, modalDark.critical);
  });

  it(`draws no asterisk on an optional field`, () => {
    const root = mountScene(shortTextInputSheet);
    const [optional] = root.querySelectorAll(byClass(fieldStyles.title));
    expect(optional.querySelector(byClass(fieldStyles.required))).toBeNull();
  });

  it(`puts 24px between fields (screenshot)`, () => {
    const root = mountScene(shortTextInputSheet);
    const fields = root.querySelectorAll(byClass(fieldStyles.field));
    expect(box(fields[2]).top - box(fields[1]).bottom).toBe(24);
  });

  it(`after Submit, outlines an empty required field and says so under it in the error colour, and leaves optional and answered ones alone`, () => {
    const root = mountScene(shortTextInputSheet);
    const errors = [...root.querySelectorAll(byClass(fieldStyles.error))];
    expect(errors.map((error) => error.textContent)).toStrictEqual([
      `This field is required.`,
      `Must be at least 10 characters long.`
    ]);
    expectColor(getComputedStyle(errors[0]).color, modalDark.critical);
    const inputs = root.querySelectorAll(byClass(inputStyles.box));
    expectColor(getComputedStyle(inputs[2]).borderTopColor, modalDark.critical);
    expectColor(getComputedStyle(inputs[0]).borderTopColor, dark.inputBorder);
  });
});

describe(`text inputs`, () => {
  it(`draws a single line 44px tall with 16px text, the placeholder in its own colour`, () => {
    const root = mountScene(shortTextInputSheet);
    const [empty, filled] = root.querySelectorAll(byClass(inputStyles.box));
    expect(box(empty).height).toBe(44);
    expect(getComputedStyle(empty).borderRadius).toBe(`8px`);
    expectColor(getComputedStyle(empty).backgroundColor, dark.inputBackground);
    const placeholder = find(empty, byClass(inputStyles.placeholder));
    expectColor(getComputedStyle(placeholder).color, modalDark.placeholder);
    expect(filled.textContent).toBe(`Something typed in`);
    expect(getComputedStyle(filled).fontSize).toBe(`16px`);
  });

  it(`draws an empty paragraph with a counter 90px tall, padded 12px by 10px, the counter 12px mono 12px from the bottom and 14px from the end (stylesheet; height from the screenshot)`, () => {
    const root = mountScene(paragraphTextInputSheet);
    const [empty, filled] = root.querySelectorAll(byClass(inputStyles.box));
    expect(box(empty).height).toBe(90);
    const counter = find(empty, byClass(inputStyles.counter));
    expect(counter.textContent).toBe(`4000`);
    expect(getComputedStyle(counter).fontSize).toBe(`12px`);
    expect(Math.round(box(empty).bottom - box(counter).bottom)).toBe(13);
    expect(Math.round(box(empty).right - box(counter).right)).toBe(15);
    // The payload's own value (all ASCII, so its length is its character count), counted down from its maxLength of 200.
    const typed = find(filled, byClass(inputStyles.lines)).textContent ?? ``;
    expect(find(filled, byClass(inputStyles.counter)).textContent).toBe(
      String(200 - typed.length)
    );
  });
});

describe(`selects, groups, uploads and checkboxes`, () => {
  it(`draws a select across the field's width at 44px (screenshot)`, () => {
    const root = mountScene({ ...modalOpening, width: 732 });
    const select = find(root, byClass(selectStyles.select));
    expect(box(select).width).toBe(430);
    expect(box(select).height).toBe(44);
  });

  it(`draws radios as 20px rings, the chosen one blurple with an 8px white dot, labels 12px after`, () => {
    const root = mountScene(radioGroupSheet);
    const rings = [...root.querySelectorAll(byClass(radioStyles.ring))];
    expect(box(rings[0]).width).toBe(20);
    const chosen = rings.filter((ring) =>
      ring.classList.contains(radioStyles.chosen ?? ``)
    );
    expect(chosen).toHaveLength(1);
    expectColor(getComputedStyle(chosen[0]).backgroundColor, dark.brand);
    expect(box(find(chosen[0], byClass(radioStyles.dot))).width).toBe(8);
    const label = rings[0].nextElementSibling;
    if (!label) throw new Error(`No label.`);
    expect(box(label).left - box(rings[0]).right).toBe(12);
  });

  it(`draws checkboxes as 20px boxes with 4px corners, ticked ones blurple with a tick, in a group 16px apart`, () => {
    const root = mountScene(checkboxGroupSheet);
    const boxes = [...root.querySelectorAll(byClass(checkboxStyles.box))];
    expect(box(boxes[0]).width).toBe(20);
    expect(getComputedStyle(boxes[0]).borderRadius).toBe(`4px`);
    const ticked = boxes.filter((element) =>
      element.classList.contains(checkboxStyles.ticked ?? ``)
    );
    // Monday and Saturday in the second group, Wednesday in the third.
    expect(ticked).toHaveLength(3);
    expectColor(getComputedStyle(ticked[0]).backgroundColor, dark.brand);
    expect(ticked[0].querySelector(`svg`)).not.toBeNull();
  });

  it(`draws a lone checkbox with its Label's text beside it and no asterisk, ticked by the scene or its default`, () => {
    const root = mountScene(checkboxSheet);
    const boxes = [...root.querySelectorAll(byClass(checkboxStyles.box))];
    expect(
      boxes.map((element) =>
        element.classList.contains(checkboxStyles.ticked ?? ``)
      )
    ).toStrictEqual([false, true, true]);
    expect(root.querySelector(byClass(fieldStyles.required))).toBeNull();
  });

  it(`draws an upload's drop area with a solid 1px border and 8px corners, and a card per added file with its size`, () => {
    const root = mountScene(fileUploadSheet);
    const [empty, withFiles] = root.querySelectorAll(
      byClass(uploadStyles.container)
    );
    const style = getComputedStyle(empty);
    expect(style.borderTopStyle).toBe(`solid`);
    expect(style.borderRadius).toBe(`8px`);
    expect(empty.textContent).toContain(`Drop files here or browse`);
    const cards = withFiles.querySelectorAll(byClass(uploadStyles.file));
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain(`402.71 KB`);
  });
});

describe(`the iOS layout`, () => {
  it(`draws the modal as a sheet across the screen with rounded top corners, and puts a Label's description under its field`, () => {
    const root = mountScene({
      ...modalFilled,
      width: 393,
      layout: `ios`
    });
    const dialog = find(root, `dialog`);
    expect(box(dialog).width).toBe(393);
    expect(getComputedStyle(dialog).borderTopLeftRadius).toBe(`16px`);
    expect(getComputedStyle(dialog).borderBottomLeftRadius).toBe(`0px`);
    const field = [...root.querySelectorAll(byClass(fieldStyles.field))].find(
      (element) => element.querySelector(byClass(fieldStyles.description))
    );
    if (!field) throw new Error(`No field with a description.`);
    const description = find(field, byClass(fieldStyles.description));
    const control = find(field, byClass(fieldStyles.control));
    expect(box(description).top).toBeGreaterThanOrEqual(box(control).bottom);
  });
});
