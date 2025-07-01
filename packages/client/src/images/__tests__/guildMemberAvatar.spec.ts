import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  guildMemberAvatar,
  guildMemberAvatarSchema
} from "../guildMemberAvatar.js";

describe(`guildMemberAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildMemberAvatar(mockUtils.schema(guildMemberAvatarSchema))
      )
    ).not.toThrow();
  });
});
