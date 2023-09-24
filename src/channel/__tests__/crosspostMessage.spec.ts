import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  crosspostMessage,
  crosspostMessageProcedure,
  crosspostMessageSchema
} from "../crosspostMessage";
import { messageSchema } from "../types/Message";

describe(`crosspostMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/messages/:message/crosspost`,
    messageSchema
  );
  const config = generateMock(crosspostMessageSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(crosspostMessageProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(crosspostMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
