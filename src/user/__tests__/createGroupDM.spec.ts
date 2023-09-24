import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGroupDM,
  createGroupDMProcedure,
  createGroupDMSchema
} from "../createGroupDM";
import { channelSchema } from "../../channel/types/Channel";

describe(`createGroupDM`, () => {
  const expected = mockRequest.post(`/users/@me/channels`, channelSchema);
  const config = generateMock(createGroupDMSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGroupDMProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGroupDM);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
