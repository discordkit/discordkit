import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  unpinMessage,
  unpinMessageProcedure,
  unpinMessageSchema
} from "../unpinMessage";

describe(`unpinMessage`, () => {
  mockRequest.delete(`/channels/:channel/pins/:message`);
  const config = generateMock(unpinMessageSchema);

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
