import { afterAll } from "vitest";
import { MockUtils } from "#mock-utils";
import { datauri, discord, snowflake } from "@discordkit/core";
import { faker } from "@faker-js/faker";
import {
  applicationFlag,
  ApplicationFlags
} from "../application/types/ApplicationFlags.js";
import { channelFlag, ChannelFlags } from "../channel/types/ChannelFlags.js";
import { activityFlag, ActivityFlags } from "../guild/types/ActivityFlags.js";
import {
  guildMemberFlag,
  GuildMemberFlags
} from "../guild/types/GuildMemberFlags.js";
import {
  systemChannelFlag,
  SystemChannelFlags
} from "../guild/types/SystemChannelFlags.js";
import {
  attachmentFlag,
  AttachmentFlags
} from "../messages/types/AttachmentFlags.js";
import { messageFlag, MessageFlag } from "../messages/types/MessageFlag.js";
import { permissionFlag, Permissions } from "../permissions/Permissions.js";
import { roleFlag, RoleFlags } from "../permissions/RoleFlags.js";
import { userFlag, UserFlags } from "../user/types/UserFlags.js";
import { skuFlag, SKUFlags } from "../sku/types/SKUFlags.js";
import {
  lobbyMemberFlag,
  LobbyMemberFlags
} from "../lobby/types/LobbyMemberFlags.js";

export const mockUtils = new MockUtils(discord, {
  customMocks: [
    [snowflake, (): string => MockUtils.uid.getUniqueID().toString()],
    [datauri, (): string => faker.image.dataUri()],
    [applicationFlag, MockUtils.flagMatcher(ApplicationFlags)],
    [channelFlag, MockUtils.flagMatcher(ChannelFlags)],
    [activityFlag, MockUtils.flagMatcher(ActivityFlags)],
    [guildMemberFlag, MockUtils.flagMatcher(GuildMemberFlags)],
    [systemChannelFlag, MockUtils.flagMatcher(SystemChannelFlags)],
    [attachmentFlag, MockUtils.flagMatcher(AttachmentFlags)],
    [messageFlag, MockUtils.flagMatcher(MessageFlag)],
    [permissionFlag, MockUtils.flagMatcher(Permissions)],
    [roleFlag, MockUtils.flagMatcher(RoleFlags)],
    [userFlag, MockUtils.flagMatcher(UserFlags)],
    [skuFlag, MockUtils.flagMatcher(SKUFlags)],
    [lobbyMemberFlag, MockUtils.flagMatcher(LobbyMemberFlags)]
  ]
});

afterAll(() => {
  mockUtils.reset();
});
