import { describe, expect, it } from "vite-plus/test";
import { componentFixtures, fixtures } from "../../__tests__/fixtures.js";
import type { LintCode } from "../../findings.js";
import { lint } from "../index.js";

/** The lint codes a payload produces, in order. */
const codes = (input: unknown): string[] =>
  lint(input).findings.map(({ code }) => code);

const v2 = 32768;
const text = (content: string): Record<string, unknown> => ({
  type: 10,
  content
});
const button = (
  fields: Record<string, unknown> = {}
): Record<string, unknown> => ({
  type: 2,
  style: 2,
  label: `Go`,
  custom_id: `go`,
  ...fields
});
const row = (...children: unknown[]): Record<string, unknown> => ({
  type: 1,
  components: children
});
/** A V2 message with one container around the given children, as both bots post. */
const card = (...children: unknown[]): Record<string, unknown> => ({
  flags: v2,
  components: [{ type: 17, components: children }]
});

const findingFor = (input: unknown, code: LintCode) =>
  lint(input).findings.find((finding) => finding.code === code);

describe(`lint on the bots' real cards`, () => {
  it.each(Object.entries(fixtures))(
    `finds nothing wrong with %s, which both bots send today`,
    (_, scene) => {
      const result = lint(scene);
      expect(result.findings).toStrictEqual([]);
      expect(result.valid).toBe(true);
    }
  );

  it(`reports the headroom on Inbou's question card even though nothing is over a limit`, () => {
    expect(
      lint(fixtures.inbouQuestion).counts.map(({ summary }) => summary)
    ).toStrictEqual([
      `13 of 40 components`,
      `272 of 4,000 text display characters`
    ]);
  });
});

describe(`message-wide limits`, () => {
  it(`counts every nested component and a section's accessory toward 40, not only the top level`, () => {
    // Inbou's largest card uses about 32 of the 40, almost all of them nested in its container; the client schema checks only the top level, where this card has one component.
    const sections = Array.from({ length: 13 }, (_, index) => ({
      type: 9,
      components: [text(`a`)],
      accessory: button({ custom_id: `s${String(index)}` })
    }));
    const result = lint(card(...sections));
    // 1 container + 13 sections + 13 text displays + 13 accessories.
    expect(result.counts[0]).toMatchObject({ metric: `components`, used: 40 });
    expect(codes(card(...sections, text(`one too many`)))).toContain(
      `components-total`
    );
  });

  it(`totals text display characters across the whole message against 4,000`, () => {
    const result = lint(card(text(`a`.repeat(2000)), text(`b`.repeat(2001))));
    expect(result.counts).toContainEqual(
      expect.objectContaining({ metric: `textDisplayCharacters`, used: 4001 })
    );
    expect(
      findingFor(
        card(text(`a`.repeat(2000)), text(`b`.repeat(2001))),
        `text-display-length`
      )
    ).toMatchObject({
      severity: `error`,
      path: [`components`]
    });
    expect(codes(card(text(`a`.repeat(4000))))).not.toContain(
      `text-display-length`
    );
  });

  it(`catches content over 2,000 characters, as Inbou's results message once was at 2,393`, () => {
    // @discordkit/client's createMessage bounds content at 20,000, so the schema lets this through.
    // 10 characters of heading, counting the flag as one, then the table.
    const results = { content: `🏁 Results\n${`x`.repeat(2383)}` };
    expect(findingFor(results, `content-length`)).toMatchObject({
      severity: `error`,
      path: [`content`]
    });
    expect(lint(results).counts).toContainEqual(
      expect.objectContaining({ metric: `contentCharacters`, used: 2393 })
    );
  });

  it(`counts an emoji as one character, not two UTF-16 units`, () => {
    expect(lint({ content: `👍`.repeat(2000) }).counts).toContainEqual(
      expect.objectContaining({ metric: `contentCharacters`, used: 2000 })
    );
  });

  it(`catches a classic message with more than five action rows, which the schema accepts because V2 allows more`, () => {
    const rows = Array.from({ length: 6 }, (_, index) =>
      row(button({ custom_id: `b${String(index)}` }))
    );
    expect(
      findingFor({ components: rows }, `classic-action-rows`)
    ).toMatchObject({ severity: `error`, path: [`components`] });
  });

  it(`catches more than ten embeds on a message`, () => {
    const embeds = Array.from({ length: 11 }, () => ({ title: `x` }));
    expect(codes({ embeds })).toContain(`embed-count`);
  });

  it(`totals embed text across every embed against 6,000, ignoring the whitespace Discord trims`, () => {
    const long = { description: `${`d`.repeat(2000)}   ` };
    expect(codes({ embeds: [long, long, long] })).not.toContain(
      `embed-total-length`
    );
    expect(
      findingFor(
        { embeds: [long, long, long, { title: `!` }] },
        `embed-total-length`
      )
    ).toMatchObject({ path: [`embeds`] });
  });

  it(`refuses a message with nothing in it`, () => {
    // The client schema accepts an empty `embeds` array, so only lint catches this.
    expect(codes({ embeds: [] })).toStrictEqual([`message-empty`]);
  });
});

describe(`components V2 and the flag`, () => {
  it(`warns, not errors, when layout components arrive without the flag, since an edit to a V2 message may leave flags out`, () => {
    const finding = findingFor(
      { components: [text(`Round 3`)] },
      `components-v2-flag-missing`
    );
    expect(finding).toMatchObject({ severity: `warning`, path: [`flags`] });
    expect(lint({ components: [text(`Round 3`)] }).valid).toBe(true);
  });

  it(`refuses content or embeds on a V2 message, which Discord rejects`, () => {
    const result = lint({
      flags: v2,
      content: `Question 4`,
      embeds: [{ title: `x` }],
      components: [text(`x`)]
    });
    expect(
      result.findings
        .filter(({ code }) => code === `components-v2-content`)
        .map(({ path }) => path)
    ).toStrictEqual([[`content`], [`embeds`]]);
    expect(result.valid).toBe(false);
  });
});

describe(`components`, () => {
  it(`catches a link button carrying a custom_id and no url, the usual mistake when restyling a button`, () => {
    const finding = findingFor(
      { components: [row(button({ style: 5 }))] },
      `button-style-fields`
    );
    expect(finding).toMatchObject({
      severity: `error`,
      path: [`components`, 0, `components`, 0]
    });
    expect(finding?.message).toMatch(
      /needs a `url` and cannot have a `customId`/
    );
  });

  it(`catches a secondary button with no custom_id, and a premium button with a label`, () => {
    expect(
      codes({ components: [row({ type: 2, style: 2, label: `Hint` })] })
    ).toContain(`button-style-fields`);
    expect(
      codes({
        components: [
          row({
            type: 2,
            style: 6,
            sku_id: `1311000000000000900`,
            label: `Buy`
          })
        ]
      })
    ).toContain(`button-style-fields`);
  });

  it(`catches a sixth button in a row, and reports it once rather than again as a schema error`, () => {
    const buttons = Array.from({ length: 6 }, (_, index) =>
      button({ custom_id: `b${String(index)}` })
    );
    const result = lint({ components: [row(...buttons)] });
    expect(result.findings.map(({ code }) => code)).toStrictEqual([
      `action-row-size`
    ]);
  });

  it(`catches buttons and a select menu sharing a row`, () => {
    const select = {
      type: 3,
      custom_id: `pick`,
      options: [{ label: `A`, value: `a` }]
    };
    // The client schema on this branch also rejects any select in a row (fixed separately), so only lint's finding is asserted here.
    expect(codes({ components: [row(button(), select)] })).toContain(
      `action-row-mixed`
    );
  });

  it(`catches a custom_id used twice, which Discord refuses and which would make the two buttons indistinguishable`, () => {
    const finding = findingFor(
      { components: [row(button(), button({ label: `Again` }))] },
      `custom-id-duplicate`
    );
    expect(finding?.path).toStrictEqual([
      `components`,
      0,
      `components`,
      1,
      `custom_id`
    ]);
  });

  it(`catches a button label over 80, a custom_id over 100 and a URL over 512 characters`, () => {
    expect(
      codes({ components: [row(button({ label: `x`.repeat(81) }))] })
    ).toStrictEqual([`button-label-length`]);
    expect(
      codes({ components: [row(button({ custom_id: `x`.repeat(101) }))] })
    ).toStrictEqual([`custom-id-length`]);
    expect(
      codes({
        components: [
          row({
            type: 2,
            style: 5,
            label: `Docs`,
            url: `https://example.com/${`x`.repeat(493)}`
          })
        ]
      })
    ).toStrictEqual([`button-url-length`]);
  });

  it(`catches alt text over 1,024 characters on a gallery item`, () => {
    const gallery = {
      type: 12,
      items: [
        {
          media: { url: `https://example.com/a.png` },
          description: `x`.repeat(1025)
        }
      ]
    };
    expect(findingFor(card(gallery), `alt-text-length`)?.path).toStrictEqual([
      `components`,
      0,
      `components`,
      0,
      `items`,
      0,
      `description`
    ]);
  });

  it(`reports a component the renderer cannot draw yet before a render throws, and only the outermost one`, () => {
    // An action row inside an action row: the inner row cannot be drawn, and its button is not reported again.
    const nested = {
      type: 1,
      components: [{ type: 1, components: [button()] }]
    };
    const result = lint(card(nested));
    expect(
      result.findings.filter(({ code }) => code === `component-unsupported`)
    ).toMatchObject([
      {
        severity: `warning`,
        path: [`components`, 0, `components`, 0, `components`, 0]
      }
    ]);
  });

  it(`reports an attachment:// reference with no file in the scene, which would draw as an empty placeholder`, () => {
    const result = lint({
      context: { attachments: { "card.png": { path: `./card.png` } } },
      messages: [
        {
          payload: {
            flags: v2,
            components: [
              {
                type: 12,
                items: [
                  { media: { url: `attachment://card.png` } },
                  { media: { url: `attachment://crad.png` } }
                ]
              }
            ]
          }
        }
      ]
    });
    expect(result.findings).toMatchObject([
      {
        code: `attachment-missing`,
        severity: `warning`,
        path: [
          `messages`,
          0,
          `payload`,
          `components`,
          0,
          `items`,
          1,
          `media`,
          `url`
        ]
      }
    ]);
  });
});

/**
 * Selects in rows here are written as Discord expects, in an array, which @discordkit/client's schema still rejects (#106), and File components leave out `name` and `size`, which it still requires (#106). So these tests look for the lint finding they are about rather than asserting the whole list of findings; once #106 lands, each could assert that its finding is the only one.
 */
describe(`sections, files and select menus`, () => {
  const select = (
    fields: Record<string, unknown> = {}
  ): Record<string, unknown> => ({
    type: 3,
    custom_id: `level`,
    options: [{ label: `N5`, value: `n5` }],
    ...fields
  });
  const thumbnail = { type: 11, media: { url: `https://example.com/a.png` } };

  it.each(Object.entries(componentFixtures))(
    `finds no lint problem in the %s card, whose only findings are the client's schema defects (#106)`,
    (_, scene) => {
      const result = lint(scene);
      expect(
        result.findings.filter(
          ({ code }) => code !== `schema` && code !== `schema-position`
        )
      ).toStrictEqual([]);
    }
  );

  it.each([0, 4])(
    `catches a section with %i text displays, where Discord takes one to three`,
    (count) => {
      const section = {
        type: 9,
        components: Array.from({ length: count }, (_, index) =>
          text(String(index))
        ),
        accessory: thumbnail
      };
      expect(
        findingFor(card(section), `section-component-count`)
      ).toMatchObject({
        severity: `error`,
        path: [`components`, 0, `components`, 0, `components`]
      });
    }
  );

  it(`leaves a section of three text displays alone`, () => {
    const section = {
      type: 9,
      components: [text(`a`), text(`b`), text(`c`)],
      accessory: thumbnail
    };
    expect(codes(card(section))).toStrictEqual([]);
  });

  it(`catches a File that points at a web address, since a File shows only a file uploaded with the message`, () => {
    const file = { type: 13, file: { url: `https://example.com/notes.txt` } };
    expect(findingFor(card(file), `file-not-attachment`)).toMatchObject({
      severity: `error`,
      path: [`components`, 0, `components`, 0, `file`, `url`]
    });
    expect(
      findingFor(
        card({ type: 13, file: { url: `attachment://notes.txt` } }),
        `file-not-attachment`
      )
    ).toBeUndefined();
  });

  it(`catches a string select with more than 25 options`, () => {
    const options = Array.from({ length: 26 }, (_, index) => ({
      label: `Option ${String(index)}`,
      value: String(index)
    }));
    expect(
      findingFor(card(row(select({ options }))), `select-option-count`)?.path
    ).toStrictEqual([
      `components`,
      0,
      `components`,
      0,
      `components`,
      0,
      `options`
    ]);
    expect(
      findingFor(
        card(row(select({ options: options.slice(0, 25) }))),
        `select-option-count`
      )
    ).toBeUndefined();
  });

  it.each([
    [`label`, `select-option-label-length`],
    [`value`, `select-option-value-length`],
    [`description`, `select-option-description-length`]
  ] as const)(`catches an option %s over 100 characters`, (field, code) => {
    const long = select({
      options: [{ label: `N5`, value: `n5`, [field]: `x`.repeat(101) }]
    });
    const ok = select({
      options: [{ label: `N5`, value: `n5`, [field]: `x`.repeat(100) }]
    });
    expect(findingFor(card(row(long)), code)?.path).toStrictEqual([
      `components`,
      0,
      `components`,
      0,
      `components`,
      0,
      `options`,
      0,
      field
    ]);
    expect(findingFor(card(row(ok)), code)).toBeUndefined();
  });

  it(`catches a placeholder over 150 characters on any select`, () => {
    for (const type of [3, 5, 6, 7, 8]) {
      const menu = { ...select({ type }), placeholder: `x`.repeat(151) };
      expect(
        findingFor(card(row(menu)), `select-placeholder-length`)
      ).toMatchObject({
        severity: `error`
      });
    }
    expect(
      findingFor(
        card(row(select({ placeholder: `x`.repeat(150) }))),
        `select-placeholder-length`
      )
    ).toBeUndefined();
  });

  it(`catches min_values or max_values above 25`, () => {
    expect(
      findingFor(
        card(row(select({ max_values: 26 }))),
        `select-values-range`
      )?.path.at(-1)
    ).toBe(`max_values`);
    expect(
      findingFor(
        card(row(select({ min_values: 26 }))),
        `select-values-range`
      )?.path.at(-1)
    ).toBe(`min_values`);
    expect(
      findingFor(
        card(row(select({ min_values: 0, max_values: 25 }))),
        `select-values-range`
      )
    ).toBeUndefined();
  });

  it(`catches more default values than max_values allows, counting Discord's default of 1 when it is unset`, () => {
    const users = {
      type: 5,
      custom_id: `buddy`,
      default_values: [
        { id: `1311000000000000101`, type: `user` },
        { id: `1311000000000000102`, type: `user` }
      ]
    };
    expect(findingFor(card(row(users)), `select-default-count`)).toMatchObject({
      severity: `error`,
      path: [
        `components`,
        0,
        `components`,
        0,
        `components`,
        0,
        `default_values`
      ]
    });
    expect(
      findingFor(card(row({ ...users, max_values: 2 })), `select-default-count`)
    ).toBeUndefined();
  });

  it(`catches fewer default values than min_values asks for`, () => {
    const roles = {
      type: 6,
      custom_id: `roles`,
      min_values: 2,
      max_values: 3,
      default_values: [{ id: `1311000000000000201`, type: `role` }]
    };
    expect(findingFor(card(row(roles)), `select-default-count`)).toBeDefined();
  });

  it(`catches a scene's openSelect that names no component, or a select that is not a string select`, () => {
    const scene = (openSelect: string): unknown => ({
      messages: [
        {
          open_select: openSelect,
          payload: card(row(select()), row({ type: 5, custom_id: `buddy` }))
        }
      ]
    });
    expect(findingFor(scene(`nothing`), `open-select-missing`)).toMatchObject({
      severity: `error`,
      path: [`messages`, 0, `open_select`],
      message: expect.stringMatching(/no component in this message/)
    });
    expect(findingFor(scene(`buddy`), `open-select-missing`)?.message).toMatch(
      /not a String Select/
    );
    expect(findingFor(scene(`level`), `open-select-missing`)).toBeUndefined();
  });
});

describe(`markdown that will not render as written`, () => {
  it.each([
    [`subtext-missing-space`, `## Question\n-#Review on Tofugu`],
    [`heading-missing-space`, `##Question 4`],
    [`heading-too-deep`, `#### Question 4`],
    [`heading-not-at-line-start`, `**Q4** ## Which hero?`]
  ])(`reports %s in a text display`, (code, source) => {
    const finding = findingFor(card(text(source)), code as LintCode);
    expect(finding).toMatchObject({
      severity: `warning`,
      path: [`components`, 0, `components`, 0, `content`]
    });
  });

  it(`leaves correct markdown alone, including a hash that is plainly not a heading`, () => {
    expect(
      codes(card(text(`## Question\n-# Review\nI love C# and ticket #12`)))
    ).toStrictEqual([]);
  });

  it(`reports a heading in an embed field value, where Discord draws no headings`, () => {
    const embed = { fields: [{ name: `Notes`, value: `## Verbs\nto eat` }] };
    expect(
      findingFor({ embeds: [embed] }, `markdown-unsupported-here`)?.path
    ).toStrictEqual([`embeds`, 0, `fields`, 0, `value`]);
  });

  it(`reports subtext in an embed title, which renders no line-level markdown`, () => {
    expect(
      findingFor(
        { embeds: [{ title: `-# small print` }] },
        `markdown-unsupported-here`
      )?.path
    ).toStrictEqual([`embeds`, 0, `title`]);
  });

  it(`reports a user mention in an embed title, which stays literal there`, () => {
    // A results embed that names the winner in its title would show the raw `<@id>`; the description is where a mention resolves.
    const finding = findingFor(
      { embeds: [{ title: `Winner: <@80351110224678912>` }] },
      `mention-literal`
    );
    expect(finding?.path).toStrictEqual([`embeds`, 0, `title`]);
    expect(
      codes({ embeds: [{ description: `Winner: <@80351110224678912>` }] })
    ).toStrictEqual([]);
  });

  it(`reports a masked link whose target is not http or https`, () => {
    expect(
      codes({ content: `See [the guide](discord://guide)` })
    ).toStrictEqual([`link-scheme`]);
    expect(
      codes({ content: `See [the guide](<https://example.com/guide>)` })
    ).toStrictEqual([]);
  });
});

describe(`lint paths`, () => {
  it(`points into a snake_case scene as written`, () => {
    const result = lint({
      messages: [{ payload: { components: [row(button({ style: 5 }))] } }]
    });
    expect(result.findings[0]?.path).toStrictEqual([
      `messages`,
      0,
      `payload`,
      `components`,
      0,
      `components`,
      0
    ]);
    expect(result.counts[0]?.path).toStrictEqual([`messages`, 0, `payload`]);
  });

  it(`never throws, even on input that is not a payload`, () => {
    expect(lint(`not json`).valid).toBe(false);
    expect(
      lint({
        messages: [
          { payload: { components: [5, null, { type: 1, components: `x` }] } }
        ]
      }).valid
    ).toBe(false);
  });
});
