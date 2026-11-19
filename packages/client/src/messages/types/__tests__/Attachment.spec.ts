import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { attachmentRequestSchema, attachmentSchema } from "../Attachment.js";
import { AttachmentFlags } from "../AttachmentFlags.js";

const attachment = {
  id: `1234567890123456789`,
  filename: `clip.mp4`,
  size: 1024,
  url: `https://cdn.discordapp.com/attachments/1/2/clip.mp4`,
  proxyUrl: `https://media.discordapp.net/attachments/1/2/clip.mp4`
};

describe(`attachmentSchema`, () => {
  it.each([
    [`IS_CLIP`, AttachmentFlags.IS_CLIP],
    [`IS_THUMBNAIL`, AttachmentFlags.IS_THUMBNAIL],
    [`IS_SPOILER`, AttachmentFlags.IS_SPOILER],
    [`CONTAINS_EXPLICIT_CONTENT`, AttachmentFlags.CONTAINS_EXPLICIT_CONTENT],
    [`IS_ANIMATED`, AttachmentFlags.IS_ANIMATED],
    [`CONTAINS_GORE_CONTENT`, AttachmentFlags.CONTAINS_GORE_CONTENT],
    [`CONTAINS_SELF_HARM_CONTENT`, AttachmentFlags.CONTAINS_SELF_HARM_CONTENT]
  ])(`parses an attachment Discord flagged %s`, (_name, flags) => {
    // The bitfield validator rejects any bit the enum does not name, so a flag missing from the enum makes every message carrying it unparseable. Discord sets these on ordinary messages: a spoilered image, an animated one, anything its content scanning flags.
    expect(
      v.safeParse(attachmentSchema, { ...attachment, flags }).success
    ).toBe(true);
  });

  it(`parses an attachment with several flags set at once`, () => {
    const flags =
      AttachmentFlags.IS_SPOILER |
      AttachmentFlags.IS_ANIMATED |
      AttachmentFlags.CONTAINS_EXPLICIT_CONTENT;

    expect(
      v.safeParse(attachmentSchema, { ...attachment, flags }).success
    ).toBe(true);
  });

  it(`still rejects a bit Discord has not documented`, () => {
    // The strictness is deliberate: an unknown bit means the enum is behind the API, which should surface as a failure instead of passing through unnamed.
    expect(
      v.safeParse(attachmentSchema, { ...attachment, flags: 1 << 20 }).success
    ).toBe(false);
  });
});

describe(`attachmentRequestSchema`, () => {
  it(`lets an edit keep a file by id and mark it as a spoiler`, () => {
    // When editing, Discord only needs the id of each file to keep, plus the fields being changed. `isSpoiler` exists only on the request side: the response reports it through the IS_SPOILER flag.
    expect(
      v.parse(attachmentRequestSchema, {
        id: `1234567890123456789`,
        isSpoiler: true
      })
    ).toEqual({ id: `1234567890123456789`, isSpoiler: true });
  });
});
