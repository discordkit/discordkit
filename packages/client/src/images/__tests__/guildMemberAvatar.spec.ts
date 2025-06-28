import { mockUtils } from "#mocks";
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
        guildMemberAvatar(mockUtils.schema(guildMemberAvatarSchema))
      )
    ).not.toThrow();
  });
});
