import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  guildMemberAvatar,
  guildMemberAvatarSchema
} from "../guildMemberAvatar.js";

describe(`guildMemberAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(guildMemberAvatar(mockSchema(guildMemberAvatarSchema)))
    ).not.toThrow();
  });
});
