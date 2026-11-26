import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { isObject } from "@discordkit/core/utils/isObject";
import {
  componentFixtures,
  componentSheets,
  embedSheet,
  fixtures
} from "../../__tests__/fixtures.js";
import type { Scene as SceneData } from "../../scene.js";
import { InspectContext, type Inspect } from "../Inspect.js";
import { Scene } from "../Scene.js";

/**
 * Studio selects a component when it is clicked in the preview, which needs the preview to say which element came from which payload object. These specs hold that to costing other users of `@discordkit/preview/react` nothing: without Studio's provider the markup carries no trace of it, and with it the only difference is one attribute per drawn object.
 */

const scenes: Record<string, SceneData> = {
  ...fixtures,
  ...componentFixtures,
  ...componentSheets,
  embedSheet
};

const attribute = `data-dkp-node`;

/** Every object in the scene a component, accessory, embed or message could be drawn from, by an id. */
const index = (scene: SceneData): Map<object, string> => {
  const ids = new Map<object, string>();
  const walk = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item: unknown, position) =>
        walk(item, `${path}.${String(position)}`)
      );
    } else if (isObject(value)) {
      ids.set(value, path);
      for (const [key, item] of Object.entries(value))
        walk(item, `${path}.${key}`);
    }
  };
  walk(scene.messages, `messages`);
  return ids;
};

const draw = (scene: SceneData, inspect?: Inspect): string =>
  renderToStaticMarkup(
    inspect === undefined ? (
      <Scene {...scene} />
    ) : (
      <InspectContext value={inspect}>
        <Scene {...scene} />
      </InspectContext>
    )
  );

describe(`inspecting the preview`, () => {
  it.each(Object.entries(scenes))(
    `adds nothing to %s's markup when no tool is inspecting`,
    (_, scene) => {
      expect(draw(scene)).not.toContain(attribute);
    }
  );

  it.each(Object.entries(scenes))(
    `marks %s's drawn objects for an inspecting tool, and changes nothing else`,
    (_, scene) => {
      const ids = index(scene);
      const marked = draw(scene, (node) => {
        const id = ids.get(node);
        return id === undefined ? undefined : { [attribute]: id };
      });
      expect(marked).toContain(attribute);
      expect(marked.replace(/ data-dkp-node="[^"]*"/g, ``)).toBe(draw(scene));
    }
  );

  it(`marks every component of Inbou's question card, the message, and each button`, () => {
    const ids = index(fixtures.inbouQuestion);
    const marked = draw(fixtures.inbouQuestion, (node) => {
      const id = ids.get(node);
      return id === undefined ? undefined : { [attribute]: id };
    });
    const found = [...marked.matchAll(/data-dkp-node="([^"]*)"/g)].map(
      (match) => match[1]
    );
    // The message, the container, its six children, four vote buttons, the end-test row and its button.
    expect(found).toHaveLength(1 + 1 + 6 + 4 + 1 + 1);
    expect(found).toContain(`messages.0`);
    expect(found).toContain(
      `messages.0.payload.components.0.components.5.components.3`
    );
  });
});
