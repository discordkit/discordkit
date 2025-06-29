import { afterAll } from "vitest";
import { MockUtils } from "#mock-utils";
import { discord, snowflake } from "@discordkit/core";
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
  customMocks: (schema): unknown => {
    if (MockUtils.titlesMatch(schema, snowflake)) {
      return MockUtils.uid.getUniqueID().toString();
    }
    if (MockUtils.titlesMatch(schema, applicationFlag)) {
      return MockUtils.applyTransforms(
        schema,
        MockUtils.flags(ApplicationFlags)
      );
    }
    if (MockUtils.titlesMatch(schema, channelFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(ChannelFlags));
    }
    if (MockUtils.titlesMatch(schema, activityFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(ActivityFlags));
    }
    if (MockUtils.titlesMatch(schema, guildMemberFlag)) {
      return MockUtils.applyTransforms(
        schema,
        MockUtils.flags(GuildMemberFlags)
      );
    }
    if (MockUtils.titlesMatch(schema, systemChannelFlag)) {
      return MockUtils.applyTransforms(
        schema,
        MockUtils.flags(SystemChannelFlags)
      );
    }
    if (MockUtils.titlesMatch(schema, attachmentFlag)) {
      return MockUtils.applyTransforms(
        schema,
        MockUtils.flags(AttachmentFlags)
      );
    }
    if (MockUtils.titlesMatch(schema, messageFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(MessageFlag));
    }
    if (MockUtils.titlesMatch(schema, permissionFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(Permissions));
    }
    if (MockUtils.titlesMatch(schema, roleFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(RoleFlags));
    }
    if (MockUtils.titlesMatch(schema, userFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(UserFlags));
    }
    if (MockUtils.titlesMatch(schema, skuFlag)) {
      return MockUtils.applyTransforms(schema, MockUtils.flags(SKUFlags));
    }
    if (MockUtils.titlesMatch(schema, lobbyMemberFlag)) {
      return MockUtils.applyTransforms(
        schema,
        MockUtils.flags(LobbyMemberFlags)
      );
    }
  }
});

afterAll(() => {
  mockUtils.reset();
});
