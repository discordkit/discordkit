import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stageSchema } from "../types";
import {
  getStageInstanceQuery,
  getStageInstanceSchema
} from "../getStageInstance";

describe(`getStageInstance`, () => {
  const expected = mockRequest.get(`/stage-instances/:channel`, stageSchema);
  const config = generateMock(getStageInstanceSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getStageInstance(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getStageInstanceQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
