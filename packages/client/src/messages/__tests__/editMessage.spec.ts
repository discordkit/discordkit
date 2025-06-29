import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  editMessage,
  editMessageProcedure,
  editMessageSafe,
  editMessageSchema
} from "../editMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`editMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/channels/:channel/messages/:message`,
    editMessageSchema,
    messageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(editMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(editMessageProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
