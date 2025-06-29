import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getChannelMessageProcedure,
  getChannelMessageQuery,
  getChannelMessageSafe,
  getChannelMessageSchema
} from "../getChannelMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`getChannelMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/:message`,
    getChannelMessageSchema,
    messageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getChannelMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
