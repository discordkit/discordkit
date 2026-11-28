import { useCallback, useLayoutEffect, useMemo, type RefObject } from "react";
import type { Inspect } from "../../react/Inspect.js";
import type { Scene } from "../../scene.js";
import { valueAt } from "../editor/paths.js";
import { buildTree, flatten } from "../editor/tree.js";

/** The attribute the preview's components carry, naming the tree node each was drawn from. */
export const nodeAttribute = `data-dkp-node`;

/**
 * Which object in the scene each drawn element came from, for selecting by clicking: every message, embed and component, by the tree's id for it. The preview's components ask for it through `InspectContext` and mark their outermost element; nothing is marked for anyone else (see `react/Inspect.ts`). One map serves every viewport, since they draw the same scene.
 */
export const useInspect = (scene: Scene | undefined): Inspect => {
  const ids = useMemo(() => {
    const map = new WeakMap<object, string>();
    if (scene === undefined) return map;
    for (const node of flatten(buildTree(scene))) {
      const value = valueAt(scene, node.path);
      if (typeof value === `object` && value !== null) map.set(value, node.id);
    }
    return map;
  }, [scene]);
  return useCallback(
    (node: object) => {
      const id = ids.get(node);
      return id === undefined ? undefined : { [nodeAttribute]: id };
    },
    [ids]
  );
};

/** The node id under a click in a preview, if the click landed on something the tree has. */
export const clickedNode = (target: EventTarget | null): string | undefined =>
  (target instanceof Element
    ? target
        .closest<HTMLElement>(`[${nodeAttribute}]`)
        ?.getAttribute(nodeAttribute)
    : undefined) ?? undefined;

/**
 * Places the outline around the selected node in one viewport: measured from the element that viewport's preview marked for it, relative to the viewport's own frame, and measured again whenever the drawing changes size. It is Studio's element laid over the preview, not a style inside it, so the preview stays exactly what `render` draws, and it is measured on screen, so it follows the viewport's zoom. The measurement is written straight to the outline's style, since it is layout, not state anything else renders from.
 */
export const useSelectionBox = (
  frame: RefObject<HTMLDivElement | null>,
  drawing: RefObject<HTMLDivElement | null>,
  outline: RefObject<HTMLDivElement | null>,
  selected: string | undefined,
  /** What is drawn, and how large: a change to either moves the outline. */
  scene: Scene | undefined,
  zoom: number
): void => {
  useLayoutEffect(() => {
    const root = drawing.current;
    const outer = frame.current;
    const box = outline.current;
    if (root === null || outer === null || box === null) return;
    const measure = (): void => {
      const element =
        selected === undefined
          ? null
          : root.querySelector(`[${nodeAttribute}="${CSS.escape(selected)}"]`);
      box.toggleAttribute(`hidden`, element === null);
      if (element === null) return;
      const at = element.getBoundingClientRect();
      const origin = outer.getBoundingClientRect();
      box.style.setProperty(`top`, `${String(at.top - origin.top)}px`);
      box.style.setProperty(`left`, `${String(at.left - origin.left)}px`);
      box.style.setProperty(`width`, `${String(at.width)}px`);
      box.style.setProperty(`height`, `${String(at.height)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return (): void => observer.disconnect();
  }, [frame, drawing, outline, selected, scene, zoom]);
};
