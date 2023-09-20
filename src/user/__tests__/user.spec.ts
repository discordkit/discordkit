import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { channelSchema } from "../../channel";
import { guildSchema, memberSchema } from "../../guild";
import { connectionSchema, userSchema } from "../types";

describe(`users`, () => {
  it(`createDM`, async () => {
    const result = mockRequest.post(`/users/@me/channels`, channelSchema);
    const actual = await client.createDM({
      body: {
        recipientId: `foo`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGroupDM`, async () => {
    const result = mockRequest.post(`/users/@me/channels`, channelSchema);
    const actual = await client.createGroupDM({
      body: {
        accessTokens: [`foo`],
        nicks: { bar: `baz` }
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getCurrentUser`, async () => {
    const result = mockRequest.post(`/users/@me`, userSchema);
    const actual = await client.getCurrentUser({});
    expect(actual).toStrictEqual(result);
  });

  it(`getCurrentUserGuildMember`, async () => {
    const result = mockRequest.post(
      `/users/@me/guilds/:guild/member`,
      memberSchema
    );
    const actual = await client.getCurrentUserGuildMember({
      guild: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getCurrentUserGuilds`, async () => {
    const result = mockRequest.post(`/users/@me/guilds`, guildSchema.array());
    const actual = await client.getCurrentUserGuilds({});
    expect(actual).toStrictEqual(result);
  });

  it(`getUser`, async () => {
    const result = mockRequest.post(`/users/:user`, userSchema);
    const actual = await client.getUser({
      user: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getUserConnections`, async () => {
    const result = mockRequest.get(`/users/@me/connections`, connectionSchema);
    const actual = await client.getUserConnections({});
    expect(actual).toStrictEqual(result);
  });

  it(`leaveGuild`, () => {
    mockRequest.delete(`/users/@me/guilds/:guild`);
    expect(async () =>
      client.leaveGuild({
        guild: `foo`
      })
    ).not.toThrow();
  });

  it(`modifyCurrentUser`, async () => {
    const result = mockRequest.patch(`/users/@me`, userSchema);
    const actual = await client.modifyCurrentUser({
      body: {
        username: `bar`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
