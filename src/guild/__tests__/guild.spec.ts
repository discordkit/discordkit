import {
  activeGuildThreadsSchema,
  banSchema,
  guildPruneCountSchema,
  guildSchema,
  guildWidgetSchema,
  integrationSchema,
  memberSchema,
  roleSchema,
  welcomeScreenSchema
} from "..";
import { mockRequest } from "../../../jest.setup";
import { channelSchema } from "../../channel";
import { inviteSchema } from "../../invite";
import { voiceRegionSchema } from "../../voice";
import { client } from "../__fixtures__/router";

describe(`guilds`, () => {
  it(`addGuildMember`, async () => {
    const result = mockRequest.put(
      `/guilds/:guild/members/:user`,
      memberSchema
    );
    const actual = await client.addGuildMember({
      user: `userID`,
      guild: `guildID`,
      body: {
        accessToken: `token`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`addGuildMemberRole`, () => {
    mockRequest.put(`/guilds/:guild/members/:user/roles/:role`);
    expect(async () =>
      client.addGuildMemberRole({
        user: `userID`,
        guild: `guildID`,
        role: `roleID`
      })
    ).not.toThrow();
  });

  it(`beginGuildPrune`, async () => {
    const result = mockRequest.post(
      `/guilds/:guild/prune`,
      guildPruneCountSchema
    );
    const actual = await client.beginGuildPrune({
      guild: `guildID`,
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
        name: `guild name`,
        region: null
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildBan`, async () => {
    const result = mockRequest.put(`/guilds/:guild/bans/:user`, banSchema);
    const actual = await client.createGuildBan({
      guild: `guildID`,
      user: `userID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildChannel`, async () => {
    const result = mockRequest.post(`/guilds/:guild/channels`, channelSchema);
    const actual = await client.createGuildChannel({
      guild: `guildID`,
      body: {
        name: `channel name`,
        defaultAutoArchiveDuration: 60
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildRole`, async () => {
    const result = mockRequest.post(`/guilds/:guild/roles`, roleSchema);
    const actual = await client.createGuildRole({
      guild: `guildID`,
      body: {
        name: `role name`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteGuild`, () => {
    mockRequest.delete(`/guilds/:guild`);
    expect(async () =>
      client.deleteGuild({
        guild: `guildID`
      })
    ).not.toThrow();
  });

  it(`deleteGuildIntegration`, () => {
    mockRequest.delete(`/guilds/:guild/integrations/:integration`);
    expect(async () =>
      client.deleteGuildIntegration({
        guild: `guildID`,
        integration: `integrationID`
      })
    ).not.toThrow();
  });

  it(`deleteGuildRole`, () => {
    mockRequest.delete(`/guilds/:guild/roles/:role`);
    expect(async () =>
      client.deleteGuildRole({
        guild: `guildID`,
        role: `roleID`
      })
    ).not.toThrow();
  });

  it(`getGuild`, async () => {
    const result = mockRequest.get(`/guilds/:id`, guildSchema);
    const actual = await client.getGuild({
      id: `guildID`,
      params: { withCounts: true }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBan`, async () => {
    const result = mockRequest.get(`/guilds/:guild/bans/:user`, banSchema);
    const actual = await client.getGuildBan({
      user: `userID`,
      guild: `guildID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildBans`, async () => {
    const result = mockRequest.get(`/guilds/:guild/bans`, banSchema.array());
    const actual = await client.getGuildBans({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildChannels`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/channels`,
      channelSchema.array()
    );
    const actual = await client.getGuildChannels({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildIntegrations`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/integrations`,
      integrationSchema.array()
    );
    const actual = await client.getGuildIntegrations({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildInvites`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/invites`,
      inviteSchema.array()
    );
    const actual = await client.getGuildInvites({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildmember`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/members/:user`,
      memberSchema
    );
    const actual = await client.getGuildMember({
      guild: `guildID`,
      user: `userID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildPreview`, async () => {
    const result = mockRequest.get(`/guilds/:guild/preview`, guildSchema);
    const actual = await client.getGuildPreview({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildPruneCount`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/prune`,
      guildPruneCountSchema
    );
    const actual = await client.getGuildPruneCount({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildRoles`, async () => {
    const result = mockRequest.get(`/guilds/:guild/roles`, roleSchema.array());
    const actual = await client.getGuildRoles({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildVanityURL`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/vanity-url`,
      inviteSchema.partial()
    );
    const actual = await client.getGuildVanityURL({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildVoiceRegions`, async () => {
    const result = mockRequest.get(`/guilds/:guild/regions`, voiceRegionSchema);
    const actual = await client.getGuildVoiceRegions({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildWelcomeScreen`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/welcome-screen`,
      welcomeScreenSchema
    );
    const actual = await client.getGuildWelcomeScreen({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildWidget`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/widget.json`,
      guildWidgetSchema
    );
    const actual = await client.getGuildWidget({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildWidgetImage`, () => {
    mockRequest.get(`/guilds/:guild/widget.png`, guildWidgetSchema);
    expect(async () =>
      client.getGuildWidgetImage({ guild: `guildID` })
    ).not.toThrow();
  });

  it(`getGuildWidgetSettings`, async () => {
    const result = mockRequest.get(`/guilds/:guild/widget`, guildWidgetSchema);
    const actual = await client.getGuildWidgetSettings({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`listActiveGuildThreads`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/threads/active`,
      activeGuildThreadsSchema
    );
    const actual = await client.listActiveGuildThreads({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`listGuildMembers`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/members`,
      memberSchema.array()
    );
    const actual = await client.listGuildMembers({ guild: `guildID` });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyCurrentMember`, () => {
    mockRequest.patch(`/guilds/:guild/members/@me`);
    expect(async () =>
      client.modifyCurrentMember({
        guild: `guildID`,
        body: {
          nick: `username`
        }
      })
    ).not.toThrow();
  });

  it(`modifyCurrentUserVoiceState`, () => {
    mockRequest.patch(`/guilds/:guild/voice-states/@me`);
    expect(async () =>
      client.modifyCurrentUserVoiceState({
        guild: `guildID`,
        body: {
          channelId: `channelID`,
          requestToSpeakTimestamp: `timestamp`
        }
      })
    ).not.toThrow();
  });

  it(`modifyGuild`, () => {
    mockRequest.patch(`/guilds/:guild`);
    expect(async () =>
      client.modifyGuild({
        guild: `guildID`,
        body: {
          name: `new guild name`
        }
      })
    ).not.toThrow();
  });

  it(`modifyGuildChannelPositions`, () => {
    mockRequest.patch(`/guilds/:guild/channels`);
    expect(async () =>
      client.modifyGuildChannelPositions({
        guild: `guildID`,
        body: [
          {
            id: `channelID`,
            position: 1,
            parentId: `channelID`,
            lockPermissions: null
          }
        ]
      })
    ).not.toThrow();
  });

  it(`modifyGuildMember`, () => {
    mockRequest.patch(`/guilds/:guild/members/:user`);
    expect(async () =>
      client.modifyGuildMember({
        guild: `guildID`,
        user: `userID`,
        body: {
          communicationDisabledUntil: `dateString`
        }
      })
    ).not.toThrow();
  });

  it(`modifyGuildMFALevel`, () => {
    mockRequest.patch(`/guilds/:guild/mfa`);
    expect(async () =>
      client.modifyGuildMFALevel({
        guild: `guildID`,
        body: {
          level: 1
        }
      })
    ).not.toThrow();
  });

  it(`modifyGuildRole`, () => {
    mockRequest.patch(`/guilds/:guild/roles/:role`);
    expect(async () =>
      client.modifyGuildRole({
        guild: `guildID`,
        role: `roleID`,
        body: {
          name: `new role name`
        }
      })
    ).not.toThrow();
  });

  it(`modifyGuildRolePositions`, () => {
    mockRequest.patch(`/guilds/:guild/roles`);
    expect(async () =>
      client.modifyGuildRolePositions({
        guild: `guildID`,
        body: [
          {
            id: `roleID`,
            position: 1
          }
        ]
      })
    ).not.toThrow();
  });

  it(`modifyGuildWelcomeScreen`, () => {
    mockRequest.patch(`/guilds/:guild/welcome-screen`);
    expect(async () =>
      client.modifyGuildWelcomeScreen({
        guild: `guildID`,
        body: {
          enabled: false
        }
      })
    ).not.toThrow();
  });

  it(`modifyGuildWidget`, () => {
    mockRequest.patch(`/guilds/:guild/widget`);
    expect(async () =>
      client.modifyGuildWidget({
        guild: `guildID`,
        body: {
          enabled: false
        }
      })
    ).not.toThrow();
  });

  it(`modifyUserVoiceState`, () => {
    mockRequest.patch(`/guilds/:guild/voice-states/:user`);
    expect(async () =>
      client.modifyUserVoiceState({
        guild: `guildID`,
        user: `userID`,
        body: {
          channelId: `channelID`
        }
      })
    ).not.toThrow();
  });

  it(`removeGuildBan`, () => {
    mockRequest.delete(`/guilds/:guild/bans/:user`);
    expect(async () =>
      client.removeGuildBan({
        guild: `guildID`,
        user: `userID`
      })
    ).not.toThrow();
  });

  it(`removeGuildMember`, () => {
    mockRequest.delete(`/guilds/:guild/members/:user`);
    expect(async () =>
      client.removeGuildMember({
        guild: `guildID`,
        user: `userID`
      })
    ).not.toThrow();
  });

  it(`removeGuildMemberRole`, () => {
    mockRequest.delete(`/guilds/:guild/members/:user/roles/:role`);
    expect(async () =>
      client.removeGuildMemberRole({
        guild: `guildID`,
        user: `userID`,
        role: `roleID`
      })
    ).not.toThrow();
  });

  it(`searchGuildMembers`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/members/search`,
      memberSchema.array()
    );
    const actual = await client.searchGuildMembers({
      guild: `guildID`,
      params: {
        query: `username`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
