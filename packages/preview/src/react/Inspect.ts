import { createContext, useContext } from "react";

/**
 * Lets a tool find which part of the scene each drawn element stands for, without changing what is drawn for anyone else.
 *
 * Studio selects a component when a person clicks it in the preview, so it has to know which payload object a clicked element came from. Each component asks this context for extra attributes for the object it draws (a component, an accessory, an embed, a message) and spreads them on its outermost element. With no provider, which is every use outside Studio, the answer is `undefined`, spreading it adds nothing, and the markup is exactly what it would be without this file.
 *
 * Internal: not exported from `@discordkit/preview/react`.
 */
export type Inspect = (
  node: object
) => Readonly<Record<`data-${string}`, string>> | undefined;

export const InspectContext = createContext<Inspect | null>(null);

/** The attributes the inspecting tool asks for on the element that draws `node`, or undefined when no tool is inspecting. */
export const useInspect = (
  node: object
): Readonly<Record<`data-${string}`, string>> | undefined =>
  useContext(InspectContext)?.(node);
