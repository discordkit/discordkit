import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getChannelMessagesProcedure,
  getChannelMessagesQuery,
  getChannelMessagesSafe,
  getChannelMessagesSchema
} from "../getChannelMessages.js";
import { messageSchema } from "../types/Message.js";

describe(`getChannelMessages`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages`,
    getChannelMessagesSchema,
    pipe(array(messageSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getChannelMessagesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelMessagesProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
