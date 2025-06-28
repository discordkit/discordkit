import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getPinnedMessagesProcedure,
  getPinnedMessagesQuery,
  getPinnedMessagesSafe,
  getPinnedMessagesSchema
} from "../getPinnedMessages.js";
import { messageSchema } from "../types/Message.js";

describe(`getPinnedMessages`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/pins`,
    getPinnedMessagesSchema,
    pipe(array(messageSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getPinnedMessagesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getPinnedMessagesProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getPinnedMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
