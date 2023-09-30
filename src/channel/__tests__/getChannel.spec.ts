import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getChannelProcedure,
  getChannelQuery,
  getChannelSafe,
  getChannelSchema
} from "../getChannel";
import { channelSchema } from "../types/Channel";

describe(`getChannel`, () => {
  const expected = mockRequest.get(`/channels/:channel`, channelSchema);
  const config = generateMock(getChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(getChannelSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
