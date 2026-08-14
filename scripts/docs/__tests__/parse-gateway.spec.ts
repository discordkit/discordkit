import { describe, it, expect } from "vite-plus/test";
import {
  parseCloseCodes,
  parseEvents,
  parseIntents,
  parseOpcodes
} from "../parse-gateway.ts";

/**
 * These specs pin the constructs `parse.ts` structurally cannot express, using
 * fixtures shaped exactly like the cached Discord docs. Each asserts a *specific
 * documented value* rather than a count, so the test fails when the extraction
 * regresses — a count-only assertion would still pass with every field shifted
 * by a column, which is the precise bug that motivated this parser.
 */

const OPCODES_FIXTURE = `
###### Gateway Opcodes

| Code | Name          | Client Action | Description                                    |
| ---- | ------------- | ------------- | ---------------------------------------------- |
| 0    | Dispatch      | Receive       | An event was dispatched.                       |
| 1    | Heartbeat     | Send/Receive  | Fired periodically to keep the connection alive. |
| 2    | Identify      | Send          | Starts a new session during the initial handshake. |

###### Gateway Close Event Codes

| Code | Description        | Explanation                                          | Reconnect |
| ---- | ------------------ | ---------------------------------------------------- | --------- |
| 4000 | Unknown error      | We're not sure what went wrong. Try reconnecting?    | true      |
| 4004 | Authentication failed | The account token sent with your [identify payload](/developers/events/gateway-events#identify) is incorrect. | false     |
| 4014 | Disallowed intent(s) | You sent a disallowed intent for a [Gateway Intent](/developers/events/gateway#gateway-intents). | false     |
`;

const INTENTS_FIXTURE = `
### List of Intents

\`\`\`
GUILDS (1 << 0)
  - GUILD_CREATE
  - THREAD_MEMBERS_UPDATE *
MESSAGE_CONTENT (1 << 15)
GUILD_MESSAGE_POLLS (1 << 24)
  - MESSAGE_POLL_VOTE_ADD
  - MESSAGE_POLL_VOTE_REMOVE
\`\`\`
`;

const EVENTS_FIXTURE = `
## Send Events

#### Identify

Used to trigger the initial handshake with the gateway.

###### Identify Structure

| Field | Type   | Description |
| ----- | ------ | ----------- |
| token | string | Auth token  |

## Receive Events

### Messages

#### Message Create

Sent when a message is created. The inner payload is a [message](/developers/resources/message#message-object) object.

#### Message Delete Bulk

Sent when multiple messages are deleted at once.
`;

describe(`parseOpcodes`, () => {
  const opcodes = parseOpcodes(OPCODES_FIXTURE);

  it(`captures the Client Action column as a direction`, () => {
    // Direction decides whether an opcode is one we send or one we dispatch
    // on. The generic enum parser drops this column entirely, which would make
    // Heartbeat (the only bidirectional opcode) indistinguishable from Identify.
    expect(opcodes.find((o) => o.name === `Dispatch`)?.direction).toBe(
      `receive`
    );
    expect(opcodes.find((o) => o.name === `Identify`)?.direction).toBe(`send`);
    expect(opcodes.find((o) => o.name === `Heartbeat`)?.direction).toBe(`both`);
  });

  it(`reads the numeric code, not the row label`, () => {
    expect(opcodes.find((o) => o.code === 0)?.name).toBe(`Dispatch`);
  });
});

describe(`parseCloseCodes`, () => {
  const closeCodes = parseCloseCodes(OPCODES_FIXTURE);

  it(`assigns code, label and explanation to the right fields`, () => {
    // The close-code table has NO `Name` column (`| Code | Description |
    // Explanation | Reconnect |`), so the generic parser's column heuristics
    // slide by one and put the numeric code in `name` and the prose in `value`.
    const authFailed = closeCodes.find((c) => c.code === 4004);
    expect(authFailed?.label).toBe(`Authentication failed`);
    expect(authFailed?.explanation).toContain(`account token`);
  });

  it(`captures the Reconnect column`, () => {
    // Reconnecting after a fatal close is an infinite loop against Discord.
    // 4004/4014 are terminal; 4000 is retryable.
    expect(closeCodes.find((c) => c.code === 4000)?.reconnect).toBe(true);
    expect(closeCodes.find((c) => c.code === 4004)?.reconnect).toBe(false);
    expect(closeCodes.find((c) => c.code === 4014)?.reconnect).toBe(false);
  });

  it(`strips markdown links out of the explanation`, () => {
    expect(closeCodes.find((c) => c.code === 4014)?.explanation).not.toContain(
      `](/developers`
    );
  });
});

describe(`parseIntents`, () => {
  const intents = parseIntents(INTENTS_FIXTURE);

  it(`computes the bit value from the documented shift`, () => {
    expect(intents.find((i) => i.name === `GUILDS`)).toMatchObject({
      shift: 0,
      value: 1
    });
    // 1 << 24 exceeds what a naive parseInt of the rendered value would give,
    // so keep the shift symbolic and compute the value from it.
    expect(intents.find((i) => i.name === `GUILD_MESSAGE_POLLS`)).toMatchObject(
      {
        shift: 24,
        value: 16777216
      }
    );
  });

  it(`flags events marked with a trailing asterisk as privileged`, () => {
    const guilds = intents.find((i) => i.name === `GUILDS`);
    expect(guilds?.events).toContain(`THREAD_MEMBERS_UPDATE`);
    expect(guilds?.privilegedEvents).toEqual([`THREAD_MEMBERS_UPDATE`]);
    // The unmarked event must NOT be treated as privileged.
    expect(guilds?.privilegedEvents).not.toContain(`GUILD_CREATE`);
  });

  it(`keeps intents that gate fields rather than events`, () => {
    // MESSAGE_CONTENT lists no events: it gates message *fields*. Dropping
    // zero-event intents would lose the one privileged intent a message-reading
    // bot must declare, and its absence fails silently at runtime with empty
    // `content` rather than an error.
    expect(intents.find((i) => i.name === `MESSAGE_CONTENT`)).toMatchObject({
      shift: 15,
      events: []
    });
  });
});

describe(`parseEvents`, () => {
  const events = parseEvents(EVENTS_FIXTURE);

  it(`derives the wire name used in a dispatch payload's t field`, () => {
    expect(events.find((e) => e.name === `Message Create`)?.wireName).toBe(
      `MESSAGE_CREATE`
    );
    expect(events.find((e) => e.name === `Message Delete Bulk`)?.wireName).toBe(
      `MESSAGE_DELETE_BULK`
    );
  });

  it(`assigns direction from the enclosing section`, () => {
    expect(events.find((e) => e.name === `Identify`)?.direction).toBe(`send`);
    expect(events.find((e) => e.name === `Message Create`)?.direction).toBe(
      `receive`
    );
  });

  it(`skips category headings that are not events`, () => {
    // `### Messages` groups events; treating h3 groupings as events is how the
    // generic parser produced 15 "objects" for ~84 real events.
    expect(events.map((e) => e.name)).not.toContain(`Messages`);
  });

  it(`takes the description from the prose, not a following table`, () => {
    expect(events.find((e) => e.name === `Identify`)?.description).toBe(
      `Used to trigger the initial handshake with the gateway.`
    );
    // Prose links are flattened to their display text.
    expect(events.find((e) => e.name === `Message Create`)?.description).toBe(
      `Sent when a message is created. The inner payload is a message object.`
    );
  });
});
