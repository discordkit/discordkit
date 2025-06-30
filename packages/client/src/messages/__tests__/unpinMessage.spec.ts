import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  unpinMessage,
  unpinMessageProcedure,
  unpinMessageSafe,
  unpinMessageSchema
} from "../unpinMessage.js";

describe(`unpinMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/pins/:message`,
    unpinMessageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(unpinMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(unpinMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(unpinMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
