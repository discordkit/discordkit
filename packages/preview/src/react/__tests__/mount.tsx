import { expect, onTestFinished } from "vite-plus/test";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import { Scene, type SceneProps } from "../Scene.js";
import textDisplayStyles from "../TextDisplay.module.css";

/** Rendering helpers for the browser specs: mount a scene into the page and read what it drew. Each mount is removed when the test that made it finishes. */

/** Draws every image as a placeholder, so no spec loads anything from the network. */
const offline = (): null => null;

/** Mounts a scene and returns its root element. Images are drawn as placeholders unless the scene passes its own `assetUrl`. */
export const mountScene = (scene: SceneProps): HTMLElement => {
  const host = document.createElement(`div`);
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  flushSync(() => {
    root.render(<Scene assetUrl={offline} {...scene} />);
  });
  const element = host.firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error(`The scene did not render.`);
  }
  return element;
};

/** One message holding `components`, in an otherwise default scene. */
export const mountComponents = (
  components: MessageComponent,
  scene: Omit<SceneProps, `messages`> = {}
): HTMLElement =>
  mountScene({ ...scene, messages: [{ payload: { components } }] });

/** Mounts `content` as a text display, inside a container (where Discord draws text at its reduced size) unless `topLevel`, and returns the text display's element. */
export const mountText = (
  content: string,
  {
    topLevel = false,
    ...scene
  }: Omit<SceneProps, `messages`> & { topLevel?: boolean } = {}
): HTMLElement => {
  const text = { type: ComponentType.TextDisplay, content } as const;
  const root = mountComponents(
    topLevel ? [text] : [{ type: ComponentType.Container, components: [text] }],
    scene
  );
  return find(root, byClass(textDisplayStyles.textDisplay));
};

/** A selector for a CSS module class, by the name the module maps it to. */
export const byClass = (className: string | undefined): string => {
  if (className === undefined) throw new Error(`No such CSS module class.`);
  return `.${CSS.escape(className)}`;
};

/** Returns the first element matching `selector` under `root`, failing the test if there is none. */
export const findElement = (root: ParentNode, selector: string): Element => {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Nothing matched ${selector}.`);
  return element;
};

/** As `findElement`, for an HTML element. */
export const find = (root: ParentNode, selector: string): HTMLElement => {
  const element = findElement(root, selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(
      `${selector} matched something other than an HTML element.`
    );
  }
  return element;
};

/** The checkbox under `root`. */
export const findCheckbox = (root: ParentNode): HTMLInputElement => {
  const element = findElement(root, `input[type=checkbox]`);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`The checkbox is not an input.`);
  }
  return element;
};

/** Reads a computed colour as `[r, g, b, a]`. */
const channels = (color: string): number[] => {
  const match = /rgba?\(([^)]+)\)/.exec(color);
  if (!match) throw new Error(`Not an rgb colour: ${color}`);
  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);
  return parts.length === 3 ? [...parts, 1] : parts;
};

/**
 * Asserts a computed colour is the measured one. The tokens are written in Discord's HSL, and the hex in their comments is rounded, so each channel may be one step off and the alpha a few thousandths.
 */
export const expectColor = (
  actual: string,
  expected: readonly number[]
): void => {
  const [r, g, b, a] = channels(actual);
  const [er, eg, eb, ea = 1] = expected;
  expect(Math.abs(r - er), `red of ${actual}`).toBeLessThanOrEqual(1);
  expect(Math.abs(g - eg), `green of ${actual}`).toBeLessThanOrEqual(1);
  expect(Math.abs(b - eb), `blue of ${actual}`).toBeLessThanOrEqual(1);
  expect(a, `alpha of ${actual}`).toBeCloseTo(ea, 2);
};

/** Discord's measured colours for the default (`dark`, Discord's `.theme-darker`) theme, as `[r, g, b, a]`, from the hex in tokens.module.css. */
export const dark = {
  textDefault: [239, 239, 241],
  textStrong: [251, 251, 251],
  textSubtle: [171, 172, 178],
  textMuted: [150, 151, 158],
  chatTextMuted: [129, 130, 138],
  textLink: [77, 150, 238],
  textCode: [228, 228, 230],
  mentionForeground: [169, 187, 255],
  mentionBackground: [88, 101, 242, 0.239],
  backgroundCode: [88, 101, 242, 0.078],
  borderNormal: [151, 151, 159, 0.2],
  backgroundModNormal: [151, 151, 159, 0.161],
  backgroundModSubtle: [151, 151, 159, 0.122],
  spineDefault: [71, 72, 81],
  spoilerHidden: [102, 103, 112],
  brand: [88, 101, 242],
  brand05a: [88, 101, 242, 0.05],
  white: [255, 255, 255]
} as const;
