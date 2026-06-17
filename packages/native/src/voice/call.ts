import { toSubscription } from "../client.js";
import type { DiscordClient, Subscription } from "../client.js";
import { defineBindings } from "../ffi/bindings.js";
import type { FfiOpaque } from "../ffi/backend.js";
import type { ChannelId, GuildId, UserId } from "../snowflake.js";
import { readVADThreshold, readVoiceState } from "./voiceStateHandle.js";
import {
  AUDIO_MODE_BY_CODE,
  AUDIO_MODE_CODE,
  CALL_STATUS_BY_CODE,
  type AudioMode,
  type CallStatus,
  type VADThreshold,
  type VoiceState
} from "./types.js";

/**
 * A live wrapper over a native `discordpp::Call` — the second interactive handle
 * wrapper in the package (after `Lobby`), and the richest: per-call status,
 * participants, self/local mute + deaf, per-participant volume, audio mode
 * (VAD vs push-to-talk), VAD threshold, and four per-call event streams.
 *
 * Unlike the lobby/message events (client-wide setters fanned out by the domain),
 * a `Call`'s `Set*Callback` are setters on the CALL handle itself — so each `Call`
 * instance owns its own callbacks and disposes them. Getters re-read live;
 * returned sub-objects (voice state, VAD config) are plain snapshots. `[Symbol.
 * dispose]` unregisters this call's event callbacks — it does NOT end the call
 * (use `endCall(channelId)` for that; the SDK owns the call's lifetime).
 *
 * A call is not usable until `status` reaches `connected`.
 */
const bindings = defineBindings({
  channelId: /* C */ `uint64_t Discord_Call_GetChannelId(void *self)`,
  guildId: /* C */ `uint64_t Discord_Call_GetGuildId(void *self)`,
  status: /* C */ `int Discord_Call_GetStatus(void *self)`,
  participants: /* C */ `void Discord_Call_GetParticipants(void *self, Discord_UInt64Span *returnValue)`,
  voiceState: /* C */ `bool Discord_Call_GetVoiceStateHandle(void *self, uint64_t userId, Discord_VoiceStateHandle *returnValue)`,
  audioMode: /* C */ `int Discord_Call_GetAudioMode(void *self)`,
  selfMute: /* C */ `bool Discord_Call_GetSelfMute(void *self)`,
  selfDeaf: /* C */ `bool Discord_Call_GetSelfDeaf(void *self)`,
  localMute: /* C */ `bool Discord_Call_GetLocalMute(void *self, uint64_t userId)`,
  participantVolume: /* C */ `float Discord_Call_GetParticipantVolume(void *self, uint64_t userId)`,
  vadThreshold: /* C */ `void Discord_Call_GetVADThreshold(void *self, Discord_VADThresholdSettings *returnValue)`,
  setAudioMode: /* C */ `void Discord_Call_SetAudioMode(void *self, int audioMode)`,
  setSelfMute: /* C */ `void Discord_Call_SetSelfMute(void *self, bool mute)`,
  setSelfDeaf: /* C */ `void Discord_Call_SetSelfDeaf(void *self, bool deaf)`,
  setLocalMute: /* C */ `void Discord_Call_SetLocalMute(void *self, uint64_t userId, bool mute)`,
  setParticipantVolume: /* C */ `void Discord_Call_SetParticipantVolume(void *self, uint64_t userId, float volume)`,
  setPTTActive: /* C */ `void Discord_Call_SetPTTActive(void *self, bool active)`,
  setVADThreshold: /* C */ `void Discord_Call_SetVADThreshold(void *self, bool automatic, float threshold)`,
  setStatusCb: /* C */ `void Discord_Call_SetStatusChangedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setParticipantCb: /* C */ `void Discord_Call_SetParticipantChangedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setSpeakingCb: /* C */ `void Discord_Call_SetSpeakingStatusChangedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setVoiceStateCb: /* C */ `void Discord_Call_SetOnVoiceStateChangedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  statusChangedCb: {
    callback: /* C */ `void OnStatusChanged(int status, int error, int32_t errorDetail, void *userData)`
  },
  participantChangedCb: {
    callback: /* C */ `void OnParticipantChanged(uint64_t userId, bool added, void *userData)`
  },
  speakingCb: {
    callback: /* C */ `void OnSpeakingStatusChanged(uint64_t userId, bool isPlayingSound, void *userData)`
  },
  voiceStateChangedCb: {
    callback: /* C */ `void OnVoiceStateChanged(uint64_t userId, void *userData)`
  }
});

/**
 * A live, interactive voice call in a lobby. Created by the voice ops
 * ({@link ../voice/calls.js | startCall}/`getCall`), never constructed directly.
 *
 * @example
 * ```ts
 * import { startCall } from "@discordkit/native/voice";
 *
 * using call = startCall(lobbyId);
 * using sub = call.onStatusChanged((status) => {
 *   if (status === "connected") console.log("in voice with", call.participants);
 * });
 * call.setSelfMute(true);              // mute my mic for this call
 * call.setParticipantVolume(userId, 150); // turn someone up (0–200)
 * ```
 */
export class Call {
  readonly #client: DiscordClient;
  readonly #handle: FfiOpaque;
  readonly #channelId: ChannelId;
  readonly #registered = new Set<FfiOpaque>();

  /** @internal Construct from a fetched/started handle. Use the voice ops, not this. */
  constructor(client: DiscordClient, handle: FfiOpaque) {
    this.#client = client;
    this.#handle = handle;
    this.#channelId = bindings(client.lib).channelId(handle) as ChannelId;
  }

  /** The id of the lobby/channel this call is in. */
  get channelId(): ChannelId {
    return this.#channelId;
  }

  /** The guild id this call is associated with. */
  get guildId(): GuildId {
    return bindings(this.#client.lib).guildId(this.#handle) as GuildId;
  }

  /** The current call status (re-read live). Not usable until `connected`. */
  get status(): CallStatus {
    return (
      CALL_STATUS_BY_CODE[
        Number(bindings(this.#client.lib).status(this.#handle))
      ] ?? `disconnected`
    );
  }

  /** The participant user ids (re-read live). */
  get participants(): UserId[] {
    const span = this.#client.lib.allocSpanOut();
    bindings(this.#client.lib).participants(this.#handle, span);
    return this.#client.lib.readUInt64Span(span) as UserId[];
  }

  /** Whether the current user's mic is muted (re-read live). */
  get selfMute(): boolean {
    return Boolean(bindings(this.#client.lib).selfMute(this.#handle));
  }

  /** Whether the current user is deafened (re-read live). */
  get selfDeaf(): boolean {
    return Boolean(bindings(this.#client.lib).selfDeaf(this.#handle));
  }

  /** How the current user's mic is keyed on this call (re-read live). */
  get audioMode(): AudioMode {
    return (
      AUDIO_MODE_BY_CODE[
        Number(bindings(this.#client.lib).audioMode(this.#handle))
      ] ?? `uninitialized`
    );
  }

  /** The current VAD threshold configuration (re-read live). */
  get vadThreshold(): VADThreshold {
    const out = this.#client.lib.allocHandle();
    bindings(this.#client.lib).vadThreshold(this.#handle, out);
    return readVADThreshold(this.#client.lib, out);
  }

  /** Read a participant's self-mute/deaf state, if they're in the call (live). */
  voiceState = (userId: UserId): VoiceState | undefined => {
    const out = this.#client.lib.allocHandle();
    return bindings(this.#client.lib).voiceState(this.#handle, userId, out)
      ? readVoiceState(this.#client.lib, out)
      : undefined;
  };

  /** Whether the current user has locally muted `userId` for themselves. */
  localMute = (userId: UserId): boolean =>
    Boolean(bindings(this.#client.lib).localMute(this.#handle, userId));

  /** The local playout volume set for `userId` (range 0..200, 100 = default). */
  participantVolume = (userId: UserId): number =>
    Number(bindings(this.#client.lib).participantVolume(this.#handle, userId));

  /** Mute/unmute the current user's microphone for everyone in the call. */
  setSelfMute = (mute: boolean): void => {
    bindings(this.#client.lib).setSelfMute(this.#handle, mute);
  };

  /** Deafen/undeafen the current user (also mutes them) for this call. */
  setSelfDeaf = (deaf: boolean): void => {
    bindings(this.#client.lib).setSelfDeaf(this.#handle, deaf);
  };

  /** Locally mute/unmute `userId` (only for the current user, not others). */
  setLocalMute = (userId: UserId, mute: boolean): void => {
    bindings(this.#client.lib).setLocalMute(this.#handle, userId, mute);
  };

  /** Locally set `userId`'s playout volume (0..200, 100 = default). */
  setParticipantVolume = (userId: UserId, volume: number): void => {
    bindings(this.#client.lib).setParticipantVolume(
      this.#handle,
      userId,
      volume
    );
  };

  /** Switch this call between voice auto-detect and push-to-talk. */
  setAudioMode = (mode: AudioMode): void => {
    bindings(this.#client.lib).setAudioMode(
      this.#handle,
      AUDIO_MODE_CODE[mode]
    );
  };

  /** When in push-to-talk mode, call on press/release of the PTT key. */
  setPushToTalkActive = (active: boolean): void => {
    bindings(this.#client.lib).setPTTActive(this.#handle, active);
  };

  /** Configure VAD: `automatic` lets Discord pick, else use `threshold` (-100..0). */
  setVADThreshold = (automatic: boolean, threshold = -60): void => {
    bindings(this.#client.lib).setVADThreshold(
      this.#handle,
      automatic,
      threshold
    );
  };

  /** Register a per-call callback + return a tracked, disposable unsubscribe. */
  #subscribe = (
    setter: (self: FfiOpaque, ptr: FfiOpaque) => unknown,
    cbType: FfiOpaque,
    fn: (...args: unknown[]) => void
  ): Subscription => {
    const cb = this.#client.lib.registerCallback(cbType, fn);
    this.#registered.add(cb);
    setter(this.#handle, cb);
    return toSubscription(() => {
      this.#client.lib.unregisterCallback(cb);
      this.#registered.delete(cb);
    });
  };

  /** Subscribe to this call's connection status changing. */
  onStatusChanged = (handler: (status: CallStatus) => void): Subscription => {
    const b = bindings(this.#client.lib);
    return this.#subscribe(
      (self, ptr) => b.setStatusCb(self, ptr, null, null),
      b.statusChangedCb,
      (code: unknown) =>
        handler(CALL_STATUS_BY_CODE[Number(code)] ?? `disconnected`)
    );
  };

  /** Subscribe to participants joining/leaving. `added` is true on join. */
  onParticipantChanged = (
    handler: (userId: UserId, added: boolean) => void
  ): Subscription => {
    const b = bindings(this.#client.lib);
    return this.#subscribe(
      (self, ptr) => b.setParticipantCb(self, ptr, null, null),
      b.participantChangedCb,
      (userId: unknown, added: unknown) =>
        handler(BigInt(userId as bigint | number) as UserId, Boolean(added))
    );
  };

  /** Subscribe to a participant starting/stopping speaking. */
  onSpeakingStatusChanged = (
    handler: (userId: UserId, speaking: boolean) => void
  ): Subscription => {
    const b = bindings(this.#client.lib);
    return this.#subscribe(
      (self, ptr) => b.setSpeakingCb(self, ptr, null, null),
      b.speakingCb,
      (userId: unknown, speaking: unknown) =>
        handler(BigInt(userId as bigint | number) as UserId, Boolean(speaking))
    );
  };

  /** Subscribe to a participant's voice state (their self-mute/deaf) changing. */
  onVoiceStateChanged = (handler: (userId: UserId) => void): Subscription => {
    const b = bindings(this.#client.lib);
    return this.#subscribe(
      (self, ptr) => b.setVoiceStateCb(self, ptr, null, null),
      b.voiceStateChangedCb,
      (userId: unknown) => handler(BigInt(userId as bigint | number) as UserId)
    );
  };

  /** Unregister this call's event callbacks. Does NOT end the call. */
  [Symbol.dispose] = (): void => {
    for (const cb of this.#registered) this.#client.lib.unregisterCallback(cb);
    this.#registered.clear();
  };
}
