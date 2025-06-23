import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import {
  guildMemberAvatar,
  guildMemberAvatarSchema
} from "../guildMemberAvatar.js";

describe(`guildMemberAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        guildMemberAvatar(mockSchema(guildMemberAvatarSchema))
      )
    ).not.toThrow();
  });
});
