import { describe, it, expect } from "vite-plus/test";
import { EVENT_INTENTS } from "../../types/GatewayIntents.js";
import { onChannelCreate } from "../channel/onChannelCreate.js";
import { onGuildAuditLogEntryCreate } from "../guild/onGuildAuditLogEntryCreate.js";
import { onGuildDelete } from "../guild/onGuildDelete.js";
import { onGuildUpdate } from "../guild/onGuildUpdate.js";
import { onIntegrationCreate } from "../integrations/onIntegrationCreate.js";
import { onIntegrationUpdate } from "../integrations/onIntegrationUpdate.js";
import { onMessageUpdate } from "../messages/onMessageUpdate.js";
import { onThreadDelete } from "../channel/onThreadDelete.js";
import { onThreadMemberUpdate } from "../channel/onThreadMemberUpdate.js";
import { onUserUpdate } from "../presence/onUserUpdate.js";

/**
 * Most of this batch was generated from the cached docs, so these specs guard
 * the two things codegen can get wrong without a typecheck noticing: the wire
 * name a handler subscribes to, and the intents it reports.
 *
 * `dispatchEvent<T>` accepts any `T`, so a mis-mapped payload type compiles
 * perfectly and only fails against live Discord traffic. The payload shapes are
 * therefore hand-audited against the docs rather than asserted here — see the
 * comments on the handlers the audit corrected.
 */

describe(`alias event wire names`, () => {
  it(`subscribes to the wire name matching its handler name`, () => {
    // A typo here means a handler that silently never fires: the fan-out routes
    // on `t`, so an unknown name simply never matches.
    expect(onChannelCreate.event).toBe(`CHANNEL_CREATE`);
    expect(onGuildUpdate.event).toBe(`GUILD_UPDATE`);
    expect(onMessageUpdate.event).toBe(`MESSAGE_UPDATE`);
    expect(onUserUpdate.event).toBe(`USER_UPDATE`);
    expect(onThreadDelete.event).toBe(`THREAD_DELETE`);
    expect(onIntegrationCreate.event).toBe(`INTEGRATION_CREATE`);
    expect(onIntegrationUpdate.event).toBe(`INTEGRATION_UPDATE`);
    expect(onGuildAuditLogEntryCreate.event).toBe(
      `GUILD_AUDIT_LOG_ENTRY_CREATE`
    );
  });

  it(`reports the intents the generated map assigns`, () => {
    expect(onChannelCreate.intents).toEqual([`GUILDS`]);
    expect(onGuildUpdate.intents).toEqual([`GUILDS`]);
    expect(onGuildAuditLogEntryCreate.intents).toEqual([`GUILD_MODERATION`]);
    expect(onIntegrationCreate.intents).toEqual([`GUILD_INTEGRATIONS`]);
    // MESSAGE_UPDATE is delivered under either the guild or DM message intent.
    expect(onMessageUpdate.intents).toEqual([
      `GUILD_MESSAGES`,
      `DIRECT_MESSAGES`
    ]);
  });

  it(`reports no intents for always-delivered events`, () => {
    // USER_UPDATE is about the bot's own user, so Discord always sends it.
    expect(onUserUpdate.intents).toEqual([]);
  });

  it(`covers every event the generated intent map gates`, () => {
    // Not a coverage requirement — the point is that any event we DO ship a
    // handler for must agree with the generated map, so a hand-written handler
    // can't drift from the docs it was derived from.
    for (const handler of [
      onChannelCreate,
      onGuildUpdate,
      onGuildDelete,
      onThreadDelete,
      onThreadMemberUpdate,
      onMessageUpdate,
      onIntegrationCreate,
      onIntegrationUpdate,
      onGuildAuditLogEntryCreate
    ]) {
      const expected =
        (EVENT_INTENTS as Record<string, readonly string[]>)[handler.event] ??
        [];
      expect(handler.intents).toEqual(expected);
    }
  });
});
