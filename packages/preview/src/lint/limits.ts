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

/** Text displays in a section. Component reference, Section: "One to three child components representing the content of the section". */
export const minSectionComponents = 1;
export const maxSectionComponents = 3;

/** Options in a string select. Component reference, String Select: "Specified choices in a select menu; max 25". */
export const maxSelectOptions = 25;

/** Characters in a select option's label, value and description. Component reference, Select Option Structure: "User-facing name of the option; max 100 characters", "Dev-defined value of the option; max 100 characters", "Additional description of the option; max 100 characters". */
export const maxSelectOptionLabel = 100;
export const maxSelectOptionValue = 100;
export const maxSelectOptionDescription = 100;

/** Characters in a select menu's placeholder. Component reference, each select: "Placeholder text if nothing is selected ...; max 150 characters". */
export const maxSelectPlaceholder = 150;

/** The range of a select's `min_values` and `max_values`. Component reference, each select: `min_values` "min 0 ..., max 25", `max_values` "max 25"; both default to 1. */
export const maxSelectValues = 25;
export const defaultSelectValues = 1;

/** Embeds on one message. Message resource, Create Message: "Up to 10 `rich` embeds". */
export const maxEmbeds = 10;

/** Characters across every embed's title, description, field names and values, footer text and author name, each trimmed. Message resource, Embed Limits: "the combined sum of characters ... across all embeds attached to a message must not exceed 6000 characters". */
export const maxEmbedCharacters = 6000;

/*
 * A modal's limits. Checked against the live component reference and the interaction-response documentation on 2026-11-27; the cached copy in `.discord-docs/` predates the radio group, checkbox group and checkbox.
 */

/** Components at a modal's top level. Receiving and Responding, Modal: "Between 1 and 5 (inclusive) components that make up the modal". */
export const minModalComponents = 1;
export const maxModalComponents = 5;

/** Characters in a modal's title. Receiving and Responding, Modal: "Title of the popup modal, max 45 characters". */
export const maxModalTitle = 45;

/** Characters in a Label's text and description. Component reference, Label: "The label text; max 45 characters", "An optional description text for the label; max 100 characters". The deprecated `label` on a Text Input has the same 45. */
export const maxLabel = 45;
export const maxLabelDescription = 100;

/** A Text Input's length bounds and texts. Component reference, Text Input: `min_length` "min 0, max 4000", `max_length` "min 1, max 4000", `value` "max 4000 characters", `placeholder` "max 100 characters". */
export const maxTextInputLength = 4000;
export const maxTextInputPlaceholder = 100;

/** Options in a Radio Group and a Checkbox Group. Component reference: Radio Group "List of options to show; min 2, max 10"; Checkbox Group "min 1, max 10". */
export const minRadioOptions = 2;
export const minCheckboxOptions = 1;
export const maxGroupOptions = 10;

/** Characters in a radio or checkbox option's label, value and description. Component reference, Radio Group Option and Checkbox Group Option: each "max 100 characters". */
export const maxGroupOptionText = 100;

/** How many values a Checkbox Group takes and a File Upload accepts. Component reference: `min_values` "min 0, max 10", `max_values` "min 1, max 10" (a File Upload's `max_values` "max 10"). */
export const maxGroupValues = 10;

/** File types a File Upload filters for. Component reference, File Upload: "can be `image`, `video`, `audio`, or any dot-prefixed extension such as `.pdf`; max 10". */
export const maxFileTypes = 10;
export const fileTypeCategories = [`image`, `video`, `audio`] as const;

/** Where each limit above is stated, for messages that cite their source. */
export const limitSources = {
  componentReference,
  messageResource,
  interactionResponse: `https://docs.discord.com/developers/interactions/receiving-and-responding.md`
} as const;

/** Characters as lint counts them: Unicode code points, so a surrogate pair (most emoji) is one. */
export const characters = (text: string): number =>
  text.length - (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)?.length ?? 0);
