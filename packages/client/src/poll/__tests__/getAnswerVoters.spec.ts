import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import {
  getAnswerVotersProcedure,
  getAnswerVotersQuery,
  getAnswerVotersSafe,
  getAnswerVotersSchema
} from "../getAnswerVoters.js";
import { userSchema } from "../../user/types/User.js";

describe(`getAnswerVoters`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/polls/:message/answers/:answer`,
    getAnswerVotersSchema,
    v.object({
      users: v.array(userSchema)
    })
  );

  it(`can be used standalone`, async () => {
    await expect(getAnswerVotersSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getAnswerVotersProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getAnswerVotersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
