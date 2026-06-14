import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { scriptUser, type ScriptedUser } from "./mock.js";
import { getUser } from "../users.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

const SCRIPTED: ScriptedUser = {
  id: 7n,
  username: `grace`,
  displayName: `grace`,
  status: 3, // idle
  provisional: true
};

describe(`getUser (mock backend)`, () => {
  it(`reads a cached user by id into a snapshot`, () => {
    using client = createClient(config);
    scriptUser(mockStateOf(client.lib), SCRIPTED);
    const user = getUser(7n, { client });
    // Why: optional fields the SDK doesn't report (globalName, avatar) must be
    // undefined, not "" — the snapshot distinguishes "unset" from "empty".
    expect(user).toEqual({
      id: 7n,
      username: `grace`,
      displayName: `grace`,
      globalName: undefined,
      avatar: undefined,
      status: `idle`,
      provisional: true
    });
    expect(mockStateOf(client.lib).calls).toContain(`Discord_Client_GetUser`);
  });

  it(`returns undefined for a user the SDK has not cached`, () => {
    using client = createClient(config);
    // Why: getUser reads the local SDK cache, not a REST fetch — an uncached id
    // is a normal "not here" result, surfaced as undefined.
    expect(getUser(999n, { client })).toBeUndefined();
  });
});
