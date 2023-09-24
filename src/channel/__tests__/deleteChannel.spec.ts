import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteChannel,
  deleteChannelProcedure,
  deleteChannelSchema
} from "../deleteChannel";

describe(`deleteChannel`, () => {
  mockRequest.delete(`/channels/:channel`);
  const config = generateMock(deleteChannelSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteChannelProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
