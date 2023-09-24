import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import { createDM, createDMProcedure, createDMSchema } from "../createDM";
import { channelSchema } from "../../channel/types/Channel";

describe(`createDM`, () => {
  const expected = mockRequest.post(`/users/@me/channels`, channelSchema);
  const config = generateMock(createDMSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createDMProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createDM);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
