import { banSchema, guildSchema, integrationSchema, memberSchema } from "..";
import { mockGet, mockPut } from "../../../jest.setup";
import { channelSchema } from "../../channel";
import { inviteSchema } from "../../invite";
import { client } from "../__fixtures__/router";

describe(`guilds`, () => {
  it(`addGuildMember`, async () => {
    const result = mockPut(`/guilds/:guild/members/:user`, memberSchema);
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
    mockPut(`/guilds/:guild/members/:user/roles/:role`);
    expect(async () =>
      client.addGuildMemberRole({
        user: `foo`,
        guild: `bar`,
        role: `qux`
      })
    ).not.toThrow();
  });

  it(`getGuild`, async () => {
    const result = mockGet(`/guilds/:id`, guildSchema);
    const actual = await client.getGuild({
      id: `foo`,
      params: { withCounts: true }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBan`, async () => {
    const result = mockGet(`/guilds/:guild/bans/:user`, banSchema);
    const actual = await client.getGuildBan({ user: `foo`, guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBans`, async () => {
    const result = mockGet(`/guilds/:guild/bans`, banSchema.array());
    const actual = await client.getGuildBans({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildChannels`, async () => {
    const result = mockGet(`/guilds/:guild/channels`, channelSchema.array());
    const actual = await client.getGuildChannels({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildIntegrations`, async () => {
    const result = mockGet(
      `/guilds/:guild/integrations`,
      integrationSchema.array()
    );
    const actual = await client.getGuildIntegrations({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildInvites`, async () => {
    const result = mockGet(`/guilds/:guild/invites`, inviteSchema.array());
    const actual = await client.getGuildInvites({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });
});
