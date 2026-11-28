/**
 * Discord's limits on a message, one constant each, with where it is stated. Checked against the live documentation on 2026-11-25; the repo's cached copy in `.discord-docs/` predates the text-display limit.
 *
 * Discord does not say how it counts characters. Lint counts Unicode code points, which is how Python's `len` counts and is believed to match the API; @discordkit/client's schemas count UTF-16 code units, which differ only for characters outside the Basic Multilingual Plane, such as most emoji.
 */

const componentReference = `https://docs.discord.com/developers/components/reference.md`;
const messageResource = `https://docs.discord.com/developers/resources/message.md`;

/** Components in one message, counted across the whole tree: nested components and a section's accessory included. Component reference: "Messages allow up to 40 total components". */
export const maxComponents = 40;

/** Characters across every Text Display in a message. Component reference, Text Display: "The character count of all text display components in a message or modal may total up to 4000 characters." */
export const maxTextDisplayCharacters = 4000;

/** Characters in a message's `content`. Message resource, Create Message: "Message contents (up to 2000 characters)". */
export const maxContentCharacters = 2000;

/** Top-level action rows in a message without the Components V2 flag. Component reference, Legacy Message Component Behavior: "Legacy messages allow up to 5 action rows as top-level components". */
export const maxClassicActionRows = 5;

/** Buttons in one action row. Component reference, Action Row: "Up to 5 contextually grouped buttons". */
export const maxActionRowButtons = 5;

/** Characters in a button's label. Component reference, Button: "max 80 characters". */
export const maxButtonLabel = 80;

/** Characters in a link button's URL. Component reference, Button: "max 512 characters". */
export const maxButtonUrl = 512;

/** Characters in a `custom_id`. Component reference: "a string of 1 to 100 characters". */
export const maxCustomId = 100;

/** Characters in a media gallery item's or a thumbnail's alt text. Component reference, Media Gallery Item and Thumbnail: "Alt text for the media, max 1024 characters". */
export const maxAltText = 1024;

/** Embeds on one message. Message resource, Create Message: "Up to 10 `rich` embeds". */
export const maxEmbeds = 10;

/** Characters across every embed's title, description, field names and values, footer text and author name, each trimmed. Message resource, Embed Limits: "the combined sum of characters ... across all embeds attached to a message must not exceed 6000 characters". */
export const maxEmbedCharacters = 6000;

/** Where each limit above is stated, for messages that cite their source. */
export const limitSources = { componentReference, messageResource } as const;

/** Characters as lint counts them: Unicode code points, so a surrogate pair (most emoji) is one. */
export const characters = (text: string): number =>
  text.length - (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)?.length ?? 0);
