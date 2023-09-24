import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getReactionsProcedure,
  getReactionsQuery,
  getReactionsSchema
} from "../getReactions";
import { userSchema } from "../../user/types/User";

describe(`getReactions`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    userSchema.partial().array()
  );
  const config = generateMock(getReactionsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getReactionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getReactionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
