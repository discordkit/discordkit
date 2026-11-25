import { ComponentType } from "@discordkit/client/components/types/ComponentType";

/** Thrown for a component the renderer cannot draw yet, so a preview never silently leaves part of a message out. */
export const unsupportedComponent = (type: number, parent: string): Error =>
  new Error(
    `@discordkit/preview cannot draw a ${ComponentType[type] ?? `type ${type}`} component inside ${parent} yet. The renderer draws Container and Text Display so far, and leaving the component out would make the preview look unlike the real message. Remove that component from the payload to preview the rest, or follow the package's changelog for when it is supported.`
  );
