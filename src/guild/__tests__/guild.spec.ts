import {
  banSchema,
  guildPruneCountSchema,
  guildSchema,
  integrationSchema,
  memberSchema,
  roleSchema
} from "..";
import { mockRequest } from "../../../jest.setup";
import { channelSchema } from "../../channel";
import { inviteSchema } from "../../invite";
import { client } from "../__fixtures__/router";

describe(`guilds`, () => {
  it(`addGuildMember`, async () => {
    const result = mockRequest.put(
      `/guilds/:guild/members/:user`,
      memberSchema
    );
    const actual = await client.addGuildMember({
      user: `foo`,
      guild: `bar`,
      body: {
        accessToken: `qux`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`addGuildMemberRole`, () => {
    mockRequest.put(`/guilds/:guild/members/:user/roles/:role`);
    expect(async () =>
      client.addGuildMemberRole({
        user: `foo`,
        guild: `bar`,
        role: `qux`
      })
    ).not.toThrow();
  });

  it(`beginGuildPrune`, async () => {
    const result = mockRequest.post(
      `/guilds/:guild/prune`,
      guildPruneCountSchema
    );
    const actual = await client.beginGuildPrune({
      guild: `bar`,
      body: {
        days: 5
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuild`, async () => {
    const result = mockRequest.post(`/guilds`, guildSchema);
    const actual = await client.createGuild({
      body: {
        name: `foo`,
        region: null
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildBan`, async () => {
    const result = mockRequest.put(`/guilds/:guild/bans/:user`, banSchema);
    const actual = await client.createGuildBan({
      guild: `foo`,
      user: `bar`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildChannel`, async () => {
    const result = mockRequest.post(`/guilds/:guild/channels`, channelSchema);
    const actual = await client.createGuildChannel({
      guild: `foo`,
      body: {
        name: `bar`,
        defaultAutoArchiveDuration: 60
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildRole`, async () => {
    const result = mockRequest.post(`/guilds/:guild/roles`, roleSchema);
    const actual = await client.createGuildRole({
      guild: `foo`,
      body: {
        name: `bar`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteGuild`, () => {
    mockRequest.delete(`/guilds/:guild`);
    expect(async () =>
      client.deleteGuild({
        guild: `foo`
      })
    ).not.toThrow();
  });

  it(`getGuild`, async () => {
    const result = mockRequest.get(`/guilds/:id`, guildSchema);
    const actual = await client.getGuild({
      id: `foo`,
      params: { withCounts: true }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBan`, async () => {
    const result = mockRequest.get(`/guilds/:guild/bans/:user`, banSchema);
    const actual = await client.getGuildBan({ user: `foo`, guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBans`, async () => {
    const result = mockRequest.get(`/guilds/:guild/bans`, banSchema.array());
    const actual = await client.getGuildBans({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildChannels`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/channels`,
      channelSchema.array()
    );
    const actual = await client.getGuildChannels({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildIntegrations`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/integrations`,
      integrationSchema.array()
    );
    const actual = await client.getGuildIntegrations({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildInvites`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/invites`,
      inviteSchema.array()
    );
    const actual = await client.getGuildInvites({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });
});
