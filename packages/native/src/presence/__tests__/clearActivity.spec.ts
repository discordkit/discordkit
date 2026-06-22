import { describe, it, expect } from "vitest";
import { createClient } from "../../client.js";
import { mockBackend, mockStateOf } from "../../__tests__/mockBackend.js";
import { presenceOf } from "./mock.js";
import { clearActivity } from "../richPresence.js";

const config = {
  applicationId: 123n,
  libraryPath: `mock`,
  backend: mockBackend
};

describe(`clearActivity (mock backend)`, () => {
  it(`fully removes presence (not an empty update)`, () => {
    using client = createClient(config);
    const state = mockStateOf(client.lib);
    // Why: an empty UpdateRichPresence still shows "Playing <AppName>" + icon.
    // Clearing must use ClearRichPresence to remove the activity entirely.
    clearActivity({ client });
    expect(presenceOf(state).cleared).toBe(true);
    expect(state.calls).toContain(`Discord_Client_ClearRichPresence`);
    expect(state.calls).not.toContain(`Discord_Client_UpdateRichPresence`);
  });
});
