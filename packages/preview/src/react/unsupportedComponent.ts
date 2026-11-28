import { ComponentType } from "@discordkit/client/components/types/ComponentType";

/** Thrown for a component the renderer cannot draw where it sits, so a preview never silently leaves part of a message out. */
export const unsupportedComponent = (type: number, parent: string): Error =>
  new Error(
    `@discordkit/preview cannot draw a ${ComponentType[type] ?? `type ${type}`} component inside ${parent} yet. The renderer draws every component a message can hold (Container, Section, Text Display, Thumbnail, Separator, Media Gallery, File, and Action Rows of buttons or a select menu), each where Discord allows it, but not the components only a modal holds, and leaving the component out would make the preview look unlike the real message. Remove that component from the payload to preview the rest, or follow the package's changelog for when it is supported.`
  );
