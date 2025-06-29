import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  crosspostMessage,
  crosspostMessageProcedure,
  crosspostMessageSafe,
  crosspostMessageSchema
} from "../crosspostMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`crosspostMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/messages/:message/crosspost`,
    crosspostMessageSchema,
    messageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(crosspostMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(crosspostMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(crosspostMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
