import { useEffect, useRef, type RefObject } from "react";

const focusable = `button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`;

/** Where focus goes when what had it is gone: the selected row of the tree in the open tab, else that tab's first control, else the tab itself. */
const fallback = (root: HTMLElement): HTMLElement | null =>
  root.querySelector<HTMLElement>(
    `[role="tabpanel"] [role="row"][aria-selected="true"]`
  ) ??
  root.querySelector<HTMLElement>(`[role="tabpanel"] [role="row"]`) ??
  root.querySelector<HTMLElement>(`[role="tabpanel"] :is(${focusable})`) ??
  root.querySelector<HTMLElement>(`[role="tab"][aria-selected="true"]`);

/**
 * Keeps keyboard focus in the app when what had it is taken away under it: a field whose component an undo removed, an entry a change from the file deleted, a message removed with its form. Without this the browser drops focus to the page, and a keyboard or screen-reader user starts again from the top. Focus moves only when the element that had it has left the page and nothing else has it, so a person who clicked elsewhere is never moved.
 */
export const useFocusRescue = (root: RefObject<HTMLElement | null>): void => {
  const last = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = root.current;
    if (element === null) return;
    const onFocusIn = (event: FocusEvent): void => {
      if (event.target instanceof HTMLElement) last.current = event.target;
    };
    element.addEventListener(`focusin`, onFocusIn);
    return (): void => element.removeEventListener(`focusin`, onFocusIn);
  }, [root]);
  // After every commit, since any of them can be the one that removed it.
  useEffect(() => {
    const previous = last.current;
    const element = root.current;
    if (previous === null || previous.isConnected || element === null) return;
    const active = document.activeElement;
    if (active !== null && active !== document.body) return;
    last.current = null;
    fallback(element)?.focus();
  });
};
