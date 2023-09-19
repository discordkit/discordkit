import { initTRPC } from "@trpc/server";
import {
  addGuildMemberProcedure,
  addGuildMemberRoleProcedure,
  beginGuildPruneProcedure,
  createGuildProcedure,
  createGuildBanProcedure,
  createGuildChannelProcedure,
  createGuildRoleProcedure,
  deleteGuildProcedure,
  deleteGuildIntegrationProcedure,
  deleteGuildRoleProcedure,
  getGuildProcedure,
  getGuildBanProcedure,
  getGuildBansProcedure,
  getGuildChannelsProcedure,
  getGuildIntegrationsProcedure,
  getGuildInvitesProcedure,
  getGuildMemberProcedure,
  getGuildPreviewProcedure,
  getGuildPruneCountProcedure,
  getGuildRolesProcedure,
  getGuildVanityURLProcedure,
  getGuildVoiceRegionsProcedure,
  getGuildWelcomeScreenProcedure,
  getGuildWidgetProcedure,
  getGuildWidgetImageProcedure,
  getGuildWidgetSettingsProcedure,
  listActiveGuildThreadsProcedure,
  listGuildMembersProcedure,
  modifyCurrentMemberProcedure,
  modifyCurrentUserVoiceStateProcedure,
  modifyGuildProcedure,
  modifyGuildChannelPositionsProcedure,
  modifyGuildMemberProcedure,
  modifyGuildMFALevelProcedure,
  modifyGuildRoleProcedure,
  modifyGuildRolePositionsProcedure,
  modifyGuildWelcomeScreenProcedure,
  modifyGuildWidgetProcedure,
  modifyUserVoiceStateProcedure,
  removeGuildBanProcedure,
  removeGuildMemberProcedure,
  removeGuildMemberRoleProcedure,
  searchGuildMembersProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  addGuildMember: addGuildMemberProcedure(tRPC.procedure),
  addGuildMemberRole: addGuildMemberRoleProcedure(tRPC.procedure),
  beginGuildPrune: beginGuildPruneProcedure(tRPC.procedure),
  createGuild: createGuildProcedure(tRPC.procedure),
  createGuildBan: createGuildBanProcedure(tRPC.procedure),
  createGuildChannel: createGuildChannelProcedure(tRPC.procedure),
  createGuildRole: createGuildRoleProcedure(tRPC.procedure),
  deleteGuild: deleteGuildProcedure(tRPC.procedure),
  deleteGuildIntegration: deleteGuildIntegrationProcedure(tRPC.procedure),
  deleteGuildRole: deleteGuildRoleProcedure(tRPC.procedure),
  getGuild: getGuildProcedure(tRPC.procedure),
  getGuildBan: getGuildBanProcedure(tRPC.procedure),
  getGuildBans: getGuildBansProcedure(tRPC.procedure),
  getGuildChannels: getGuildChannelsProcedure(tRPC.procedure),
  getGuildIntegrations: getGuildIntegrationsProcedure(tRPC.procedure),
  getGuildInvites: getGuildInvitesProcedure(tRPC.procedure),
  getGuildMembers: getGuildMemberProcedure(tRPC.procedure),
  getGuildPreview: getGuildPreviewProcedure(tRPC.procedure),
  getGuildPruneCount: getGuildPruneCountProcedure(tRPC.procedure),
  getGuildRoles: getGuildRolesProcedure(tRPC.procedure),
  getGuildVanityURL: getGuildVanityURLProcedure(tRPC.procedure),
  getGuildVoiceRegions: getGuildVoiceRegionsProcedure(tRPC.procedure),
  getGuildWelcomeScreen: getGuildWelcomeScreenProcedure(tRPC.procedure),
  getGuildWidget: getGuildWidgetProcedure(tRPC.procedure),
  getGuildWidgetImage: getGuildWidgetImageProcedure(tRPC.procedure),
  getGuildWidgetSettings: getGuildWidgetSettingsProcedure(tRPC.procedure),
  listActiveGuildThreads: listActiveGuildThreadsProcedure(tRPC.procedure),
  listGuildMembers: listGuildMembersProcedure(tRPC.procedure),
  modifyCurrentMember: modifyCurrentMemberProcedure(tRPC.procedure),
  modifyCurrentUserVoiceState: modifyCurrentUserVoiceStateProcedure(
    tRPC.procedure
  ),
  modifyGuild: modifyGuildProcedure(tRPC.procedure),
  modifyGuildChannelPositions: modifyGuildChannelPositionsProcedure(
    tRPC.procedure
  ),
  modifyGuildMember: modifyGuildMemberProcedure(tRPC.procedure),
  modifyGuildMFALevel: modifyGuildMFALevelProcedure(tRPC.procedure),
  modifyGuildRole: modifyGuildRoleProcedure(tRPC.procedure),
  modifyGuildRolePositions: modifyGuildRolePositionsProcedure(tRPC.procedure),
  modifyGuildWelcomeScreen: modifyGuildWelcomeScreenProcedure(tRPC.procedure),
  modifyGuildWidget: modifyGuildWidgetProcedure(tRPC.procedure),
  modifyUserVoiceState: modifyUserVoiceStateProcedure(tRPC.procedure),
  removeGuildBan: removeGuildBanProcedure(tRPC.procedure),
  removeGuildMember: removeGuildMemberProcedure(tRPC.procedure),
  removeGuildMemberRole: removeGuildMemberRoleProcedure(tRPC.procedure),
  searchGuildMembers: searchGuildMembersProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
