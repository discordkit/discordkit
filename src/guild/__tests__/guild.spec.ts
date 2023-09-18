import { initTRPC } from "@trpc/server";
import {
  addGuildMember,
  addGuildMemberRole,
  addGuildMemberRoleSchema,
  addGuildMemberSchema,
  ban,
  getGuild,
  getGuildBan,
  getGuildBanSchema,
  getGuildBans,
  getGuildBansSchema,
  getGuildChannels,
  getGuildChannelsSchema,
  getGuildIntegrations,
  getGuildIntegrationsSchema,
  getGuildInvites,
  getGuildInvitesSchema,
  getGuildSchema,
  guild,
  integration,
  member
} from "..";
import { mockGet, mockPut } from "../../../jest.setup";
import { channel } from "../../channel";
import { invite } from "../../invite";
import { toProcedure } from "../../utils/methods";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  addGuildMember: tRPC.procedure
    .input(addGuildMemberSchema)
    .output(member)
    .mutation(toProcedure(addGuildMember)),
  addGuildMemberRole: tRPC.procedure
    .input(addGuildMemberRoleSchema)
    .mutation(toProcedure(addGuildMemberRole)),
  getGuild: tRPC.procedure
    .input(getGuildSchema)
    .output(guild)
    .query(toProcedure(getGuild)),
  getGuildBan: tRPC.procedure
    .input(getGuildBanSchema)
    .output(ban)
    .query(toProcedure(getGuildBan)),
  getGuildBans: tRPC.procedure
    .input(getGuildBansSchema)
    .output(ban.array())
    .query(toProcedure(getGuildBans)),
  getGuildChannels: tRPC.procedure
    .input(getGuildChannelsSchema)
    .output(channel.array())
    .query(toProcedure(getGuildChannels)),
  getGuildIntegrations: tRPC.procedure
    .input(getGuildIntegrationsSchema)
    .output(integration.array())
    .query(toProcedure(getGuildIntegrations)),
  getGuildInvites: tRPC.procedure
    .input(getGuildInvitesSchema)
    .output(invite.array())
    .query(toProcedure(getGuildInvites))
});
const caller = appRouter.createCaller({});

describe(`guilds`, () => {
  it(`addGuildMember`, async () => {
    const result = mockPut(`/guilds/:guild/members/:user`, member);
    const actual = await caller.addGuildMember({
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
      caller.addGuildMemberRole({
        user: `foo`,
        guild: `bar`,
        role: `qux`
      })
    ).not.toThrow();
  });

  it(`getGuild`, async () => {
    const result = mockGet(`/guilds/:id`, guild);
    const actual = await caller.getGuild({
      id: `foo`,
      params: { withCounts: true }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBan`, async () => {
    const result = mockGet(`/guilds/:guild/bans/:user`, ban);
    const actual = await caller.getGuildBan({ user: `foo`, guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBans`, async () => {
    const result = mockGet(`/guilds/:guild/bans`, ban.array());
    const actual = await caller.getGuildBans({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildChannels`, async () => {
    const result = mockGet(`/guilds/:guild/channels`, channel.array());
    const actual = await caller.getGuildChannels({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildIntegrations`, async () => {
    const result = mockGet(`/guilds/:guild/integrations`, integration.array());
    const actual = await caller.getGuildIntegrations({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildInvites`, async () => {
    const result = mockGet(`/guilds/:guild/invites`, invite.array());
    const actual = await caller.getGuildInvites({ guild: `bar` });
    expect(actual).toStrictEqual(result);
  });
});
