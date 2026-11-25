import { get } from "react-hook-form";
import { describe, expect, it } from "vite-plus/test";
import { lint } from "../../lint/index.js";
import type { Scene } from "../../scene.js";
import { findingsToErrors, lintResolver } from "../form/lintResolver.js";

/**
 * Studio's form takes its validation from the package's own `lint`, so it can never disagree with `discordkit-preview lint` about a message. The next slice registers a field per scene path; these specs fix that a finding lands at exactly that path, where react-hook-form's own `get` will look for it.
 */

const scene: Scene = {
  messages: [
    {
      payload: {
        flags: 32768,
        components: [
          { type: 10, content: `-#Small print` },
          {
            type: 1,
            components: [{ type: 2, style: 5, label: `Link`, customId: `x` }]
          }
        ]
      }
    }
  ],
  locale: `not a locale`
};

describe(`the lint resolver`, () => {
  it(`puts a finding on a field at that field's scene path`, () => {
    const errors = findingsToErrors(lint(scene).findings, scene);
    expect(
      get(errors, `messages.0.payload.components.0.content`)
    ).toMatchObject({
      type: `warning`,
      types: { "subtext-missing-space": expect.any(String) }
    });
    expect(get(errors, `locale`)).toMatchObject({ type: `error` });
  });

  it(`puts a finding on a component under its root key, so it cannot collide with its fields' errors`, () => {
    const errors = findingsToErrors(lint(scene).findings, scene);
    expect(
      get(errors, `messages.0.payload.components.1.components.0.root`)
    ).toMatchObject({
      type: `error`,
      types: { "button-style-fields": expect.any(String) }
    });
  });

  it(`reports the same findings as lint, one for one`, () => {
    const errors = findingsToErrors(lint(scene).findings, scene);
    const codes = lint(scene)
      .findings.map((finding) => finding.code)
      .sort();
    const collected: string[] = [];
    const walk = (node: unknown): void => {
      if (typeof node !== `object` || node === null) return;
      if (
        `types` in node &&
        typeof node.types === `object` &&
        node.types !== null
      ) {
        collected.push(...Object.keys(node.types));
        return;
      }
      for (const child of Object.values(node)) walk(child);
    };
    walk(errors);
    expect(collected.sort()).toEqual(codes);
  });

  it(`passes a clean scene through with no errors`, async () => {
    const clean: Scene = { messages: [{ payload: { content: `Hello` } }] };
    const result = await lintResolver(clean, undefined, {
      fields: {},
      shouldUseNativeValidation: false
    });
    expect(result).toEqual({ values: clean, errors: {} });
  });
});
