import { describe, expect, it } from "vite-plus/test";
import { modalScenes } from "../../__tests__/modalFixtures.js";
import type { LintCode } from "../../findings.js";
import { lint } from "../index.js";

/**
 * Lint on modals. Each rule is a limit or a placement Discord's component reference or its interaction-response documentation states (read live on 2026-11-27), and each test here fails if its rule is removed: it asserts the finding's code, severity and path on a payload that breaks exactly that rule, written in Discord's own snake_case.
 */

/** A label around a component, in the wire format. */
const label = (
  component: Record<string, unknown>,
  fields: Record<string, unknown> = {}
): Record<string, unknown> => ({
  type: 18,
  label: `Question`,
  component,
  ...fields
});

const textInput = (
  fields: Record<string, unknown> = {}
): Record<string, unknown> => ({
  type: 4,
  custom_id: `answer`,
  style: 1,
  ...fields
});

const modal = (...components: unknown[]): Record<string, unknown> => ({
  custom_id: `form`,
  title: `A form`,
  components
});

const options = (count: number): Record<string, unknown>[] =>
  Array.from({ length: count }, (_, index) => ({
    label: `Option ${String(index)}`,
    value: `o${String(index)}`
  }));

/** The findings with this code, as code, severity and path. */
const found = (input: unknown, code: LintCode) =>
  lint(input)
    .findings.filter((finding) => finding.code === code)
    .map(({ severity, path }) => ({ severity, path }));

const codes = (input: unknown): string[] =>
  lint(input).findings.map(({ code }) => code);

describe(`lint on the modal fixtures`, () => {
  /** What intake reports for shapes that are right for Discord but not for @discordkit/client's schemas (see `modalFixtures.ts`): a Text Input in a Label without the deprecated `label` the client requires, and a Text Input in an Action Row's array, which the client's `ActionRow` takes only bare. Lint's own warning about the deprecated row is expected too. */
  const clientDefects = new Set([`schema`, `schema-position`]);
  const expectedWarnings = new Set([`text-input-legacy-row`]);

  it.each(Object.entries(modalScenes))(
    `finds nothing wrong with %s beyond the client schema's known defects`,
    (_, scene) => {
      const result = lint(scene);
      const ours = result.findings.filter(
        (finding) =>
          !clientDefects.has(finding.code) &&
          !expectedWarnings.has(finding.code)
      );
      expect(ours).toStrictEqual([]);
      for (const finding of result.findings.filter((item) =>
        clientDefects.has(item.code)
      )) {
        // Tighten to "no findings" once the client's TextInput no longer requires `label` and its ActionRow takes an array.
        expect(
          finding.path.at(-1) === `label` ||
            finding.path.at(-1) === `components`
        ).toBe(true);
      }
    }
  );

  it(`reads a bare modal in Discord's snake_case as a modal, and points findings into it as written`, () => {
    const result = lint(modal(label(textInput({ max_length: 0 }))));
    expect(result.kind).toBe(`modal`);
    expect(
      found(
        modal(label(textInput({ max_length: 0 }))),
        `text-input-length-range`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`, `max_length`] }
    ]);
  });

  it(`counts the top-level components against 5`, () => {
    const result = lint(modal(label(textInput())));
    expect(result.counts).toContainEqual(
      expect.objectContaining({
        metric: `modalComponents`,
        used: 1,
        limit: 5,
        summary: `1 of 5 top-level modal components`
      })
    );
  });
});

describe(`the modal itself`, () => {
  it(`refuses a modal with no components or more than five, which Discord's interaction response rejects`, () => {
    expect(found(modal(), `modal-component-count`)).toStrictEqual([
      { severity: `error`, path: [`components`] }
    ]);
    const six = Array.from({ length: 6 }, (_, index) =>
      label(textInput({ custom_id: `a${String(index)}` }))
    );
    expect(found(modal(...six), `modal-component-count`)).toHaveLength(1);
    expect(
      found(modal(...six.slice(0, 5)), `modal-component-count`)
    ).toStrictEqual([]);
  });

  it(`refuses a title over 45 characters, and leaves one of 45 alone`, () => {
    const at = (title: string) =>
      found({ ...modal(label(textInput())), title }, `modal-title-length`);
    expect(at(`t`.repeat(46))).toStrictEqual([
      { severity: `error`, path: [`title`] }
    ]);
    expect(at(`t`.repeat(45))).toStrictEqual([]);
  });

  it(`refuses a modal custom_id over 100 characters`, () => {
    expect(
      found(
        { ...modal(label(textInput())), custom_id: `x`.repeat(101) },
        `custom-id-length`
      )
    ).toStrictEqual([{ severity: `error`, path: [`custom_id`] }]);
  });

  it(`refuses two fields sharing a custom_id, since the submission could not tell their answers apart`, () => {
    expect(
      found(
        modal(label(textInput()), label(textInput())),
        `custom-id-duplicate`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 1, `component`, `custom_id`] }
    ]);
  });

  it(`totals the modal's text displays against 4,000`, () => {
    const input = modal({ type: 10, content: `a`.repeat(4001) });
    expect(found(input, `text-display-length`)).toStrictEqual([
      { severity: `error`, path: [`components`] }
    ]);
  });
});

describe(`placement, which names where a misplaced component belongs`, () => {
  it(`refuses a modal's component in a message and says to move it into a modal`, () => {
    const message = { flags: 32768, components: [label(textInput())] };
    const result = lint(message);
    const finding = result.findings.find(
      ({ code }) => code === `component-modal-only`
    );
    expect(finding).toMatchObject({
      severity: `error`,
      path: [`components`, 0]
    });
    expect(finding?.message).toMatch(/scene's `modal`/);
    // Not also reported as a gap in the preview, and not for the text input inside it.
    expect(codes(message)).not.toContain(`component-unsupported`);
    expect(found(message, `component-modal-only`)).toHaveLength(1);
  });

  it(`refuses a text input in a message's action row`, () => {
    const message = { components: [{ type: 1, components: [textInput()] }] };
    expect(found(message, `component-modal-only`)).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `components`, 0] }
    ]);
  });

  it(`refuses a message's component in a modal and says what a modal holds instead`, () => {
    const input = modal({ type: 17, components: [] });
    const finding = lint(input).findings.find(
      ({ code }) => code === `component-message-only`
    );
    expect(finding).toMatchObject({
      severity: `error`,
      path: [`components`, 0]
    });
    expect(finding?.message).toMatch(/Labels and Text Displays/);
  });

  it(`refuses buttons in a modal's action row`, () => {
    const input = modal({
      type: 1,
      components: [{ type: 2, style: 1, label: `Go`, custom_id: `go` }]
    });
    expect(found(input, `component-message-only`)).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `components`, 0] }
    ]);
  });

  it(`refuses a select at a modal's top level and says to wrap it in a Label`, () => {
    const input = modal({ type: 3, custom_id: `s`, options: options(2) });
    const finding = lint(input).findings.find(
      ({ code }) => code === `modal-component-position`
    );
    expect(finding).toMatchObject({
      severity: `error`,
      path: [`components`, 0]
    });
    expect(finding?.message).toMatch(/Wrap it/);
  });

  it(`refuses a Label inside a Label`, () => {
    expect(
      found(modal(label(label(textInput()))), `modal-component-position`)
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`] }
    ]);
  });

  it(`warns that a text input in an action row is the deprecated form, and refuses a row of two`, () => {
    const row = (...inputs: unknown[]) => ({ type: 1, components: inputs });
    expect(
      found(modal(row(textInput({ label: `Name` }))), `text-input-legacy-row`)
    ).toStrictEqual([{ severity: `warning`, path: [`components`, 0] }]);
    expect(
      found(
        modal(
          row(
            textInput({ label: `A` }),
            textInput({ label: `B`, custom_id: `b` })
          )
        ),
        `modal-action-row`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `components`] }
    ]);
  });
});

describe(`labels and text inputs`, () => {
  it(`refuses a label over 45 characters and a description over 100`, () => {
    expect(
      found(
        modal(label(textInput(), { label: `l`.repeat(46) })),
        `label-length`
      )
    ).toStrictEqual([{ severity: `error`, path: [`components`, 0, `label`] }]);
    expect(
      found(
        modal(label(textInput(), { description: `d`.repeat(101) })),
        `label-description-length`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `description`] }
    ]);
    expect(
      codes(
        modal(
          label(textInput(), {
            label: `l`.repeat(45),
            description: `d`.repeat(100)
          })
        )
      )
    ).not.toContain(`label-length`);
  });

  it(`refuses min_length or max_length outside 0 to 4,000 and 1 to 4,000, and a minimum above the maximum`, () => {
    expect(
      found(
        modal(label(textInput({ min_length: 4001 }))),
        `text-input-length-range`
      )
    ).toHaveLength(1);
    expect(
      found(
        modal(label(textInput({ max_length: 0 }))),
        `text-input-length-range`
      )
    ).toHaveLength(1);
    expect(
      found(
        modal(label(textInput({ min_length: 50, max_length: 10 }))),
        `text-input-length-range`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`, `min_length`] }
    ]);
    expect(
      codes(modal(label(textInput({ min_length: 0, max_length: 4000 }))))
    ).not.toContain(`text-input-length-range`);
  });

  it(`refuses a pre-filled value over 4,000, and warns when it falls outside the input's own limits`, () => {
    expect(
      found(
        modal(label(textInput({ value: `v`.repeat(4001) }))),
        `text-input-value-length`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`, `value`] }
    ]);
    expect(
      found(
        modal(label(textInput({ value: `abc`, min_length: 5 }))),
        `text-input-value-range`
      )
    ).toStrictEqual([
      { severity: `warning`, path: [`components`, 0, `component`, `value`] }
    ]);
  });

  it(`refuses a placeholder over 100 characters`, () => {
    expect(
      found(
        modal(label(textInput({ placeholder: `p`.repeat(101) }))),
        `text-input-placeholder-length`
      )
    ).toHaveLength(1);
  });

  it(`warns about a text input's own label inside a Label, and requires one in the older action row`, () => {
    expect(
      found(modal(label(textInput({ label: `Old` }))), `text-input-label`)
    ).toStrictEqual([
      { severity: `warning`, path: [`components`, 0, `component`, `label`] }
    ]);
    expect(
      found(modal({ type: 1, components: [textInput()] }), `text-input-label`)
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `components`, 0, `label`] }
    ]);
  });
});

describe(`selects, groups, uploads and checkboxes`, () => {
  const select = (fields: Record<string, unknown> = {}) => ({
    type: 3,
    custom_id: `s`,
    options: options(3),
    ...fields
  });

  it(`refuses a disabled select in a modal, which Discord's reference calls an error`, () => {
    expect(
      found(modal(label(select({ disabled: true }))), `modal-disabled`)
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`, `disabled`] }
    ]);
  });

  it(`warns that required does nothing on a select in a message`, () => {
    const message = {
      components: [{ type: 1, components: [select({ required: true })] }]
    };
    expect(found(message, `select-required-in-message`)).toStrictEqual([
      {
        severity: `warning`,
        path: [`components`, 0, `components`, 0, `required`]
      }
    ]);
  });

  it.each([
    [`a select`, select({ min_values: 0 })],
    [`a file upload`, { type: 19, custom_id: `f`, min_values: 0 }],
    [
      `a checkbox group`,
      { type: 22, custom_id: `c`, options: options(2), min_values: 0 }
    ]
  ])(
    `refuses min_values of 0 on %s that is required, and allows it once required is false`,
    (_, component) => {
      expect(
        found(modal(label(component)), `min-values-required`)
      ).toStrictEqual([
        {
          severity: `error`,
          path: [`components`, 0, `component`, `min_values`]
        }
      ]);
      expect(
        codes(modal(label({ ...component, required: false })))
      ).not.toContain(`min-values-required`);
    }
  );

  it(`refuses a radio group of fewer than 2 or more than 10 options, and a checkbox group of none or more than 10`, () => {
    const radio = (count: number) => ({
      type: 21,
      custom_id: `r`,
      options: options(count)
    });
    const group = (count: number) => ({
      type: 22,
      custom_id: `c`,
      options: options(count)
    });
    expect(found(modal(label(radio(1))), `group-option-count`)).toHaveLength(1);
    expect(found(modal(label(radio(11))), `group-option-count`)).toHaveLength(
      1
    );
    expect(found(modal(label(radio(2))), `group-option-count`)).toHaveLength(0);
    expect(found(modal(label(group(0))), `group-option-count`)).toHaveLength(1);
    expect(found(modal(label(group(1))), `group-option-count`)).toHaveLength(0);
  });

  it(`refuses a radio or checkbox option's label, value or description over 100 characters`, () => {
    const radio = {
      type: 21,
      custom_id: `r`,
      options: [
        { label: `l`.repeat(101), value: `a` },
        { label: `b`, value: `b`, description: `d`.repeat(101) }
      ]
    };
    expect(found(modal(label(radio)), `group-option-length`)).toStrictEqual([
      {
        severity: `error`,
        path: [`components`, 0, `component`, `options`, 0, `label`]
      },
      {
        severity: `error`,
        path: [`components`, 0, `component`, `options`, 1, `description`]
      }
    ]);
  });

  it(`warns about a radio group with more than one default, since it chooses exactly one`, () => {
    const radio = {
      type: 21,
      custom_id: `r`,
      options: [
        { label: `a`, value: `a`, default: true },
        { label: `b`, value: `b`, default: true }
      ]
    };
    expect(found(modal(label(radio)), `radio-default-count`)).toStrictEqual([
      { severity: `warning`, path: [`components`, 0, `component`, `options`] }
    ]);
  });

  it(`refuses min_values and max_values outside 0 to 10 and 1 to 10, a minimum above the maximum, and a minimum a group's options cannot reach`, () => {
    const upload = (fields: Record<string, unknown>) => ({
      type: 19,
      custom_id: `f`,
      ...fields
    });
    expect(
      found(modal(label(upload({ max_values: 11 }))), `values-range`)
    ).toHaveLength(1);
    expect(
      found(
        modal(label(upload({ min_values: 4, max_values: 2 }))),
        `values-range`
      )
    ).toHaveLength(1);
    expect(
      found(
        modal(
          label({
            type: 22,
            custom_id: `c`,
            options: options(2),
            min_values: 3
          })
        ),
        `values-range`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`, `min_values`] }
    ]);
    expect(
      codes(modal(label(upload({ min_values: 1, max_values: 10 }))))
    ).not.toContain(`values-range`);
  });

  it(`refuses more than 10 file types, and warns about one that is neither a category nor a dotted extension`, () => {
    const upload = (fileTypes: unknown[]) => ({
      type: 19,
      custom_id: `f`,
      file_types: fileTypes
    });
    expect(
      found(
        modal(
          label(
            upload(
              Array.from({ length: 11 }, (_, index) => `.e${String(index)}`)
            )
          )
        ),
        `file-types`
      )
    ).toStrictEqual([
      { severity: `error`, path: [`components`, 0, `component`, `file_types`] }
    ]);
    expect(
      found(modal(label(upload([`image`, `.pdf`, `pdf`]))), `file-types`)
    ).toStrictEqual([
      {
        severity: `warning`,
        path: [`components`, 0, `component`, `file_types`, 2]
      }
    ]);
    expect(
      lint(modal(label(upload([`pdf`])))).findings.find(
        ({ code }) => code === `file-types`
      )?.message
    ).toMatch(/`\.pdf`/);
  });

  it(`warns that required does not make a checkbox one a person must tick`, () => {
    expect(
      found(
        modal(label({ type: 23, custom_id: `c`, required: true })),
        `checkbox-required`
      )
    ).toStrictEqual([
      { severity: `warning`, path: [`components`, 0, `component`, `required`] }
    ]);
  });
});

describe(`what the scene says is filled in`, () => {
  const scene = (values: Record<string, unknown>) => ({
    messages: [],
    modal: {
      payload: modal(
        label(textInput()),
        label({ type: 23, custom_id: `tick` })
      ),
      values
    }
  });

  it(`warns about a value for a field the modal does not have, naming the fields it does`, () => {
    const finding = lint(scene({ nope: `x` })).findings.find(
      ({ code }) => code === `modal-value-invalid`
    );
    expect(finding).toMatchObject({
      severity: `warning`,
      path: [`modal`, `values`, `nope`]
    });
    expect(finding?.message).toMatch(/"answer", "tick"/);
  });

  it(`warns about a value of the wrong kind, and keeps a snake_case field id as written`, () => {
    expect(found(scene({ tick: `yes` }), `modal-value-invalid`)).toStrictEqual([
      { severity: `warning`, path: [`modal`, `values`, `tick`] }
    ]);
    expect(codes(scene({ answer: `typed`, tick: true }))).not.toContain(
      `modal-value-invalid`
    );
  });

  it(`accepts a scene of only a modal, and refuses one with neither messages nor a modal`, () => {
    expect(
      lint(scene({})).findings.filter(({ code }) => code === `scene`)
    ).toStrictEqual([]);
    expect(lint({ messages: [] }).findings).toMatchObject([
      { code: `scene`, severity: `error`, path: [`messages`] }
    ]);
  });

  it(`says to pass the data of a whole interaction response rather than read type 9 as a Section`, () => {
    const result = lint({ type: 9, data: modal(label(textInput())) });
    expect(result.kind).toBe(`unknown`);
    expect(result.findings[0]?.message).toMatch(/Pass the `data` object/);
  });
});
