import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { undrawableCodes } from "../findings.js";
import { lint } from "../lint/index.js";
import { Scene } from "../react/Scene.js";

/**
 * Studio decides from lint alone whether to hand a scene to the renderer, because a scene that throws while the preview's deferred copy is drawn surfaces as an unhandled React error. That is only safe if lint's undrawable codes and the renderer's refusals are the same set: these scenes hold each one to the other.
 */

const v2 = 32768;
const text = { type: 10, content: `Question 4` };
const select = {
  type: 1,
  components: [
    {
      type: 3,
      custom_id: `level`,
      options: [{ label: `N5`, value: `n5` }]
    }
  ]
};
const button = {
  type: 1,
  components: [{ type: 2, style: 2, label: `Go`, custom_id: `go` }]
};
const textInput = {
  type: 1,
  components: [{ type: 4, custom_id: `name`, style: 1, label: `Name` }]
};

const cases: [string, unknown][] = [
  [
    `a drawable card with a select`,
    { messages: [{ payload: { flags: v2, components: [text, select] } }] }
  ],
  [
    `a drawable card with its select open`,
    {
      messages: [
        {
          payload: { flags: v2, components: [text, select] },
          openSelect: `level`
        }
      ]
    }
  ],
  [
    `an open select that names nothing`,
    {
      messages: [
        { payload: { flags: v2, components: [text] }, openSelect: `missing` }
      ]
    }
  ],
  [
    `an open select that names a button`,
    {
      messages: [
        { payload: { flags: v2, components: [button] }, openSelect: `go` }
      ]
    }
  ],
  [
    `a modal's text input in a message`,
    { messages: [{ payload: { flags: v2, components: [textInput] } }] }
  ]
];

describe(`what Studio refuses to draw`, () => {
  it.each(cases)(`is exactly what the renderer refuses: %s`, (_, input) => {
    const { scene, findings } = lint(input);
    if (scene === undefined) throw new Error(`The case did not read.`);
    const refused = findings.some((finding) =>
      undrawableCodes.has(finding.code)
    );
    const draw = (): string => renderToStaticMarkup(<Scene {...scene} />);
    if (refused) {
      expect(draw).toThrow();
    } else {
      expect(draw).not.toThrow();
    }
  });
});
