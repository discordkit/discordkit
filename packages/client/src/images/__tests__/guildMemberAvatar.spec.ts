import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  guildMemberAvatar,
  guildMemberAvatarSchema
} from "../guildMemberAvatar.js";

describe(`guildMemberAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        guildMemberAvatar(mockSchema(guildMemberAvatarSchema))
      )
    ).not.toThrow();
  });
});
