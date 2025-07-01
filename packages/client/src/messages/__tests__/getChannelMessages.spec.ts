import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { messageSchema } from "../types/Message.js";
import {
  getChannelMessagesProcedure,
  getChannelMessagesQuery,
  getChannelMessagesSafe,
  getChannelMessagesSchema
} from "../getChannelMessages.js";

describe(`getChannelMessages`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages`,
    getChannelMessagesSchema,
    v.pipe(v.array(messageSchema), v.length(1))
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
