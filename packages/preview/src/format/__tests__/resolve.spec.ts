import { describe, expect, it } from "vite-plus/test";
import type { SceneContext } from "../../scene.js";
import {
  channelMentionLabel,
  defaultAvatar,
  defaultAvatarColors,
  resolveAuthor,
  roleMention,
  userMentionLabel
} from "../resolve.js";

/** A mention that resolves to the wrong name, or to a name where Discord would show "unknown", hides exactly the mistake a preview is for. */
const context: SceneContext = {
  users: {
    "80351110224678912": {
      name: `Nelly`,
      avatar: `https://cdn.example/nelly.png`
    }
  },
  roles: {
    "41771983423143936": { name: `Moderators`, color: 0x1abc9c },
    "41771983423143937": { name: `Everyone Else`, color: 0 }
  },
  channels: { "41771983423143938": { name: `general` } }
};

describe(`mentions`, () => {
  it(`shows a user mention as @ and the user's name from the scene`, () => {
    expect(userMentionLabel(`80351110224678912`, context)).toBe(`@Nelly`);
  });

  it(`shows a user the scene does not list as @unknown-user, as Discord does for an id it cannot find`, () => {
    expect(userMentionLabel(`1`, context)).toBe(`@unknown-user`);
    expect(userMentionLabel(`1`, undefined)).toBe(`@unknown-user`);
  });

  it(`gives a role mention its role's colour as hex, so the pill is drawn in it`, () => {
    expect(roleMention(`41771983423143936`, context)).toStrictEqual({
      label: `@Moderators`,
      color: `#1abc9c`
    });
  });

  it(`treats colour 0 as no colour, since that is how Discord stores an uncoloured role`, () => {
    expect(roleMention(`41771983423143937`, context)).toStrictEqual({
      label: `@Everyone Else`
    });
  });

  it(`shows a role the scene does not list as @deleted-role`, () => {
    expect(roleMention(`2`, context)).toStrictEqual({ label: `@deleted-role` });
  });

  it(`names a channel without its #, which is drawn as an icon, and an unknown one as "unknown"`, () => {
    expect(channelMentionLabel(`41771983423143938`, context)).toBe(`general`);
    expect(channelMentionLabel(`3`, context)).toBe(`unknown`);
  });
});

describe(`message authors`, () => {
  it(`draws the scene's user, keeping their avatar`, () => {
    const author = resolveAuthor(`80351110224678912`, context);
    expect(author.name).toBe(`Nelly`);
    expect(author.avatar).toBe(`https://cdn.example/nelly.png`);
  });

  it(`draws a message with no author as an app called "App", with the APP tag`, () => {
    const author = resolveAuthor(undefined, context);
    expect(author.name).toBe(`App`);
    expect(author.bot).toBe(true);
  });
});

/** A bare payload must render with no network, and generated images must not carry Discord's logo, so a user without a picture gets an avatar drawn locally instead of one of Discord's CDN images. */
describe(`the default avatar`, () => {
  it(`names no image at all for a user without a picture, so nothing is fetched for it`, () => {
    const author = resolveAuthor(`1`, { users: { "1": { name: `quill` } } });
    expect(author.avatar).toBeUndefined();
    expect(author.fallback.initial).toBe(`Q`);
  });

  it(`takes the first character a reader sees, so a name starting with an emoji or a combining mark is not split`, () => {
    expect(defaultAvatar(`a`, `👩‍🚀 Ada`).initial).toBe(`👩‍🚀`);
    expect(defaultAvatar(`b`, `  émile`).initial).toBe(`É`);
    expect(defaultAvatar(`c`, ``).initial).toBe(`?`);
  });

  it(`keeps a user's colour from scene to scene, chosen from their id rather than their place in the scene`, () => {
    const first = defaultAvatar(`1311000000000000101`, `Emberwing`);
    expect(defaultAvatar(`1311000000000000101`, `Emberwing`)).toStrictEqual(
      first
    );
    expect(defaultAvatarColors).toContain(first.color);
  });

  it(`spreads different users across the palette rather than giving everyone one colour`, () => {
    const colors = new Set(
      Array.from(
        { length: 24 },
        (_, index) => defaultAvatar(`13110000000000${String(index)}`, `x`).color
      )
    );
    expect(colors.size).toBeGreaterThan(3);
  });
});
