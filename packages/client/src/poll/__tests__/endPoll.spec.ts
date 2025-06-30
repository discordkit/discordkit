import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  endPoll,
  endPollProcedure,
  endPollSafe,
  endPollSchema
} from "../endPoll.js";

describe(`endPoll`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/polls/:message/expire`,
    endPollSchema
  );

  it(`can be used standalone`, async () => {
    await expect(endPollSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(endPollProcedure)(config)).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(endPoll);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
