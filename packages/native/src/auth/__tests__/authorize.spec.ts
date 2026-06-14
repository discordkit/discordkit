import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import "./mock.js";
import { authorize } from "../authorize.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`authorize (mock backend)`, () => {
  it(`runs the full PKCE flow then connects`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await authorize({ client });
    // Why: the flow must execute in order — verifier → authorize → token
    // exchange → update → connect. Each step gates the next; a missing/misordered
    // call means a broken sign-in.
    const order = state.calls.filter((c) =>
      [
        `Discord_Client_CreateAuthorizationCodeVerifier`,
        `Discord_Client_Authorize`,
        `Discord_Client_GetToken`,
        `Discord_Client_UpdateToken`,
        `Discord_Client_Connect`
      ].includes(c)
    );
    expect(order).toEqual([
      `Discord_Client_CreateAuthorizationCodeVerifier`,
      `Discord_Client_Authorize`,
      `Discord_Client_GetToken`,
      `Discord_Client_UpdateToken`,
      `Discord_Client_Connect`
    ]);
  });

  it(`requests the presence scopes by default and drops the args handle`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await authorize({ client });
    // Why: the default scope set must be the presence set, and the transient
    // AuthorizationArgs handle must be dropped (via `using`) — no native leak.
    expect(state.calls).toContain(`Discord_Client_GetDefaultPresenceScopes`);
    expect(state.calls).not.toContain(
      `Discord_Client_GetDefaultCommunicationScopes`
    );
    expect(state.calls).toContain(`Discord_AuthorizationArgs_Drop`);
  });

  it(`requests communication scopes when asked`, async () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    await authorize({ client, scopes: `communication` });
    expect(state.calls).toContain(
      `Discord_Client_GetDefaultCommunicationScopes`
    );
  });
});
