import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  pinMessage,
  pinMessageProcedure,
  pinMessageSafe,
  pinMessageSchema
} from "../pinMessage";

describe(`pinMessage`, () => {
  mockRequest.put(`/channels/:channel/pins/:message`);
  const config = generateMock(pinMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(pinMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(pinMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(pinMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
