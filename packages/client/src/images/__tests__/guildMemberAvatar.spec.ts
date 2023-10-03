import { mockSchema } from "test-utils";
import {
  guildMemberAvatar,
  guildMemberAvatarSchema
} from "../guildMemberAvatar.ts";
import { z } from "zod";

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
