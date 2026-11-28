import { ComponentType } from "@discordkit/client/components/types/ComponentType";

/** Thrown for a component the renderer cannot draw where it sits, so a preview never silently leaves part of a message out. */
export const unsupportedComponent = (type: number, parent: string): Error =>
  new Error(
    `@discordkit/preview cannot draw a ${ComponentType[type] ?? `type ${type}`} component inside ${parent}. The renderer draws each component where Discord allows it: in a message, Containers, Sections, Text Displays, Thumbnails, Separators, Media Galleries, Files and Action Rows of buttons or a select menu; in a modal, Labels (each around a text input, a select, a file upload, a radio group, a checkbox group or a checkbox), Text Displays, and the older Action Row of one text input. Leaving the component out would make the preview look unlike what Discord shows. Move it to a place Discord allows it (\`lint\` says where), or remove it to preview the rest.`
  );
