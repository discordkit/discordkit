import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptRelationships, type ScriptedRelationship } from "./mock.js";
import { getRelationships, getRelationship } from "../relationships.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

const FRIEND: ScriptedRelationship = {
  userId: 42n,
  discordType: 1, // friend
  gameType: 0, // none
  spamRequest: false,
  user: {
    id: 42n,
    username: `ada`,
    displayName: `Ada`,
    status: 0,
    provisional: false
  }
};
const PENDING: ScriptedRelationship = {
  userId: 7n,
  discordType: 3, // pendingIncoming
  gameType: 0,
  spamRequest: true
};

describe(`getRelationships (mock backend)`, () => {
  it(`reads the relationship list (span) into snapshots, embedding the user`, () => {
    using client = createClient(config);
    scriptRelationships(mockStateOf(client.lib), [FRIEND, PENDING]);
    const rels = getRelationships({ client });
    // Why: the span primitive must yield one snapshot per element, and the
    // cross-domain embed must read the target user via the users domain reader.
    expect(rels).toHaveLength(2);
    expect(rels[0]).toEqual({
      userId: 42n,
      discordType: `friend`,
      gameType: `none`,
      spamRequest: false,
      user: expect.objectContaining({ id: 42n, username: `ada` })
    });
    // A relationship the SDK has no user handle for omits `user`.
    expect(rels[1]).toEqual({
      userId: 7n,
      discordType: `pendingIncoming`,
      gameType: `none`,
      spamRequest: true
    });
  });

  it(`returns an empty list when there are no relationships`, () => {
    using client = createClient(config);
    expect(getRelationships({ client })).toEqual([]);
  });

  it(`getRelationship reads a single relationship by id`, () => {
    using client = createClient(config);
    scriptRelationships(mockStateOf(client.lib), [FRIEND]);
    const rel = getRelationship(42n, { client });
    expect(rel.userId).toBe(42n);
    expect(rel.discordType).toBe(`friend`);
  });
});
