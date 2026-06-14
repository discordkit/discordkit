import {
  registerMockHandlers,
  type MockContext,
  type MockState
} from "../../__tests__/mockBackend.js";
// Lobby members embed a user, so readLobbyMember calls the users domain's
// readUser — register its handlers for that side effect.
import "../../users/__tests__/mock.js";
import type { ScriptedUser } from "../../users/__tests__/mock.js";

/**
 * Mock behavior for the lobbies domain — registered with the shared mock backend,
 * kept next to the lobby specs. Covers the live `Lobby` wrapper's getters, the
 * entry ops (create/join, get, getLobbyIds), guild/channel discovery, and the
 * client-wide event fan-out (delivered via {@link fireLobbyEvent}).
 *
 * A scripted lobby's handle stashes its data as `__lobby`; members as `__member`;
 * guild/channel discovery results are scripted as plain arrays delivered through
 * the op callbacks' spans.
 */

export interface ScriptedMember {
  id: bigint;
  connected: boolean;
  canLinkLobby: boolean;
  metadata: Record<string, string>;
  user?: ScriptedUser;
}

export interface ScriptedLobby {
  id: bigint;
  members: ScriptedMember[];
  metadata: Record<string, string>;
  linkedChannel?: { id: bigint; name: string; guildId: bigint };
}

export interface ScriptedGuild {
  id: bigint;
  name: string;
}

export interface ScriptedChannel {
  id: bigint;
  name: string;
  type: number;
  position: number;
  parentId?: bigint;
  linkable: boolean;
  viewableByAll: boolean;
  linkedLobby?: { lobbyId: bigint; applicationId: bigint };
}

interface LobbyDomainState {
  lobbies: Map<bigint, ScriptedLobby>;
  guilds: ScriptedGuild[];
  channels: ScriptedChannel[];
  /** lobbyId for createOrJoin to return. */
  nextLobbyId: bigint;
  /** Names of the lobby ops invoked, in order. */
  actions: string[];
  /** Captured client-wide event callbacks + the raw invoker. */
  events: Partial<Record<string, unknown>>;
  invoke?: (handle: unknown, ...args: unknown[]) => void;
}

const store = new WeakMap<MockState, LobbyDomainState>();
const stateOf = (s: MockState): LobbyDomainState => {
  let v = store.get(s);
  if (!v) {
    v = {
      lobbies: new Map(),
      guilds: [],
      channels: [],
      nextLobbyId: 0n,
      actions: [],
      events: {}
    };
    store.set(s, v);
  }
  return v;
};

/** Register a scripted lobby (also what `createOrJoinLobby` will resolve to). */
export const scriptLobby = (state: MockState, lobby: ScriptedLobby): void => {
  const s = stateOf(state);
  s.lobbies.set(lobby.id, lobby);
  s.nextLobbyId = lobby.id;
};

/** Set the guilds `getUserGuilds` resolves with. */
export const scriptGuilds = (
  state: MockState,
  guilds: ScriptedGuild[]
): void => {
  stateOf(state).guilds = guilds;
};

/** Set the channels `getGuildChannels` resolves with. */
export const scriptChannels = (
  state: MockState,
  channels: ScriptedChannel[]
): void => {
  stateOf(state).channels = channels;
};

/** Names of the lobby ops invoked on this mock, in order. */
export const lobbyActionsOf = (state: MockState): string[] =>
  stateOf(state).actions;

/** Deliver a client-wide lobby event (`created`/`memberAdded`/…) to subscribers. */
export const fireLobbyEvent = (
  state: MockState,
  event:
    | `LobbyCreated`
    | `LobbyDeleted`
    | `LobbyUpdated`
    | `LobbyMemberAdded`
    | `LobbyMemberRemoved`
    | `LobbyMemberUpdated`,
  ...ids: bigint[]
): void => {
  const s = stateOf(state);
  s.invoke?.(s.events[event], ...ids);
};

const lobbyOf = (handle: unknown): ScriptedLobby | undefined =>
  (handle as { __lobby?: ScriptedLobby }).__lobby;
const memberOf = (handle: unknown): ScriptedMember | undefined =>
  (handle as { __member?: ScriptedMember }).__member;
const channelOf = (handle: unknown): ScriptedChannel | undefined =>
  (handle as { __channel?: ScriptedChannel }).__channel;

const ackAction = (ctx: MockContext): undefined => {
  stateOf(ctx.state).actions.push(ctx.name);
  ctx.fireResultCallback();
  return undefined;
};

/** Record an event setter's callback + the raw invoker, keyed by event name. */
const captureEvent =
  (event: string) =>
  (ctx: MockContext): undefined => {
    const s = stateOf(ctx.state);
    s.events[event] = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  };

registerMockHandlers({
  // --- entry ops ---
  Discord_Client_CreateOrJoinLobby: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback(stateOf(ctx.state).nextLobbyId);
    return undefined;
  },
  Discord_Client_CreateOrJoinLobbyWithMetadata: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback(stateOf(ctx.state).nextLobbyId);
    return undefined;
  },
  Discord_Client_GetLobbyHandle: (ctx) => {
    const lobby = stateOf(ctx.state).lobbies.get(ctx.args[1] as bigint);
    if (!lobby) return false;
    (ctx.args[2] as { __lobby?: ScriptedLobby }).__lobby = lobby;
    return true;
  },
  Discord_Client_GetLobbyIds: (ctx) => {
    (ctx.args[1] as { __span?: bigint[] }).__span = [
      ...stateOf(ctx.state).lobbies.keys()
    ];
    return undefined;
  },
  Discord_Client_GetUserGuilds: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback({
      __span: stateOf(ctx.state).guilds.map((g) => ({ __guild: g }))
    });
    return undefined;
  },
  Discord_Client_GetGuildChannels: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback({
      __span: stateOf(ctx.state).channels.map((c) => ({ __channel: c }))
    });
    return undefined;
  },
  // --- lobby ops (acked) ---
  Discord_Client_LeaveLobby: ackAction,
  Discord_Client_LinkChannelToLobby: ackAction,
  Discord_Client_UnlinkChannelFromLobby: ackAction,
  // --- event setters ---
  Discord_Client_SetLobbyCreatedCallback: captureEvent(`LobbyCreated`),
  Discord_Client_SetLobbyDeletedCallback: captureEvent(`LobbyDeleted`),
  Discord_Client_SetLobbyUpdatedCallback: captureEvent(`LobbyUpdated`),
  Discord_Client_SetLobbyMemberAddedCallback: captureEvent(`LobbyMemberAdded`),
  Discord_Client_SetLobbyMemberRemovedCallback:
    captureEvent(`LobbyMemberRemoved`),
  Discord_Client_SetLobbyMemberUpdatedCallback:
    captureEvent(`LobbyMemberUpdated`),
  // --- LobbyHandle getters ---
  Discord_LobbyHandle_Id: (ctx) => lobbyOf(ctx.args[0])?.id ?? 0n,
  Discord_LobbyHandle_LobbyMemberIds: (ctx) => {
    (ctx.args[1] as { __span?: bigint[] }).__span = (
      lobbyOf(ctx.args[0])?.members ?? []
    ).map((m) => m.id);
    return undefined;
  },
  Discord_LobbyHandle_LobbyMembers: (ctx) => {
    (ctx.args[1] as { __span?: unknown[] }).__span = (
      lobbyOf(ctx.args[0])?.members ?? []
    ).map((m) => ({ __member: m }));
    return undefined;
  },
  Discord_LobbyHandle_GetLobbyMemberHandle: (ctx) => {
    const member = lobbyOf(ctx.args[0])?.members.find(
      (m) => m.id === ctx.args[1]
    );
    if (!member) return false;
    (ctx.args[2] as { __member?: ScriptedMember }).__member = member;
    return true;
  },
  Discord_LobbyHandle_Metadata: (ctx) => {
    (ctx.args[1] as { __props?: Record<string, string> }).__props =
      lobbyOf(ctx.args[0])?.metadata ?? {};
    return undefined;
  },
  Discord_LobbyHandle_LinkedChannel: (ctx) => {
    const linked = lobbyOf(ctx.args[0])?.linkedChannel;
    if (!linked) return false;
    (ctx.args[1] as { __linked?: typeof linked }).__linked = linked;
    return true;
  },
  // --- LinkedChannel getters ---
  Discord_LinkedChannel_Id: (ctx) =>
    (ctx.args[0] as { __linked?: { id: bigint } }).__linked?.id ?? 0n,
  Discord_LinkedChannel_GuildId: (ctx) =>
    (ctx.args[0] as { __linked?: { guildId: bigint } }).__linked?.guildId ?? 0n,
  Discord_LinkedChannel_Name: (ctx) => {
    ctx.writeString(
      ctx.args[1],
      (ctx.args[0] as { __linked?: { name: string } }).__linked?.name ?? ``
    );
    return undefined;
  },
  // --- LobbyMemberHandle getters ---
  Discord_LobbyMemberHandle_Id: (ctx) => memberOf(ctx.args[0])?.id ?? 0n,
  Discord_LobbyMemberHandle_Connected: (ctx) =>
    Boolean(memberOf(ctx.args[0])?.connected),
  Discord_LobbyMemberHandle_CanLinkLobby: (ctx) =>
    Boolean(memberOf(ctx.args[0])?.canLinkLobby),
  Discord_LobbyMemberHandle_Metadata: (ctx) => {
    (ctx.args[1] as { __props?: Record<string, string> }).__props =
      memberOf(ctx.args[0])?.metadata ?? {};
    return undefined;
  },
  Discord_LobbyMemberHandle_User: (ctx) => {
    const user = memberOf(ctx.args[0])?.user;
    if (!user) return false;
    (ctx.args[1] as { __user?: ScriptedUser }).__user = user;
    return true;
  },
  // --- GuildMinimal getters ---
  Discord_GuildMinimal_Id: (ctx) =>
    (ctx.args[0] as { __guild?: ScriptedGuild }).__guild?.id ?? 0n,
  Discord_GuildMinimal_Name: (ctx) => {
    ctx.writeString(
      ctx.args[1],
      (ctx.args[0] as { __guild?: ScriptedGuild }).__guild?.name ?? ``
    );
    return undefined;
  },
  // --- GuildChannel getters ---
  Discord_GuildChannel_Id: (ctx) => channelOf(ctx.args[0])?.id ?? 0n,
  Discord_GuildChannel_Type: (ctx) => channelOf(ctx.args[0])?.type ?? 0,
  Discord_GuildChannel_Position: (ctx) => channelOf(ctx.args[0])?.position ?? 0,
  Discord_GuildChannel_IsLinkable: (ctx) =>
    Boolean(channelOf(ctx.args[0])?.linkable),
  Discord_GuildChannel_IsViewableAndWriteableByAllMembers: (ctx) =>
    Boolean(channelOf(ctx.args[0])?.viewableByAll),
  Discord_GuildChannel_Name: (ctx) => {
    ctx.writeString(ctx.args[1], channelOf(ctx.args[0])?.name ?? ``);
    return undefined;
  },
  Discord_GuildChannel_ParentId: (ctx) => {
    const parentId = channelOf(ctx.args[0])?.parentId;
    if (parentId === undefined) return false;
    (ctx.args[1] as { __u64?: bigint }).__u64 = parentId;
    return true;
  },
  Discord_GuildChannel_LinkedLobby: (ctx) => {
    const linked = channelOf(ctx.args[0])?.linkedLobby;
    if (!linked) return false;
    (ctx.args[1] as { __linkedLobby?: typeof linked }).__linkedLobby = linked;
    return true;
  },
  Discord_LinkedLobby_LobbyId: (ctx) =>
    (ctx.args[0] as { __linkedLobby?: { lobbyId: bigint } }).__linkedLobby
      ?.lobbyId ?? 0n,
  Discord_LinkedLobby_ApplicationId: (ctx) =>
    (ctx.args[0] as { __linkedLobby?: { applicationId: bigint } }).__linkedLobby
      ?.applicationId ?? 0n
});
