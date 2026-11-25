import { describe, expect, it } from "vite-plus/test";
import type { SceneContext } from "../../scene.js";
import {
  channelMentionLabel,
  defaultAvatarUrl,
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
    expect(resolveAuthor(`80351110224678912`, context)).toStrictEqual({
      name: `Nelly`,
      avatar: `https://cdn.example/nelly.png`
    });
  });

  it(`draws a message with no author as an app called "App", with the APP tag`, () => {
    const author = resolveAuthor(undefined, context);
    expect(author.name).toBe(`App`);
    expect(author.bot).toBe(true);
  });

  it(`gives a user without a picture Discord's default avatar for their id: (id >> 22) % 6`, () => {
    // Ids built from the part the rule reads (the bits above the low 22), with noise in the low bits it must ignore.
    expect(defaultAvatarUrl(String((7n << 22n) + 12_345n))).toBe(
      `https://cdn.discordapp.com/embed/avatars/1.png`
    );
    expect(defaultAvatarUrl(String((11n << 22n) + 4_194_303n))).toBe(
      `https://cdn.discordapp.com/embed/avatars/5.png`
    );
    expect(resolveAuthor(`1`, { users: { "1": { name: `A` } } }).avatar).toBe(
      `https://cdn.discordapp.com/embed/avatars/0.png`
    );
  });

  it(`gives an id that is not a snowflake the first default avatar instead of failing`, () => {
    expect(defaultAvatarUrl(`inbou`)).toBe(
      `https://cdn.discordapp.com/embed/avatars/0.png`
    );
  });
});
