import {
  pipe,
  array,
  object,
  string,
  uuid,
  minLength,
  maxLength,
  type InferOutput
} from "valibot";
import { initTRPC } from "@trpc/server";
import { mockRequest } from "#test-utils";
import { type Fetcher, get } from "../methods.js";
import { toProcedure } from "../toProcedure.js";
import { discord } from "../DiscordSession.js";

describe(`toProcedure`, () => {
  beforeAll(() => {
    discord.setToken(`Bot secret`);
  });
  const userSchema = object({
    id: pipe(string(), uuid()),
    username: pipe(string(), minLength(2), maxLength(16))
  });
  const expected = mockRequest.get(`/listUsers`, array(userSchema));

  it(`is tRPC compatible`, async () => {
    const tRPC = initTRPC.create();
    const listUsers: Fetcher<
      null,
      Array<InferOutput<typeof userSchema>>
    > = async () => get(`/listUsers`);
    const listUsersProcedure = toProcedure(
      `query`,
      listUsers,
      null,
      array(userSchema)
    );

    await expect(
      tRPC
        .router({
          listUsers: listUsersProcedure(tRPC.procedure)
        })
        .createCaller({})
        .listUsers()
    ).resolves.toStrictEqual(expected);
  });
});
