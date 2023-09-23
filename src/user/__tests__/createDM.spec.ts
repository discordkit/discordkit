import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { channelSchema } from "../../channel";
import { createDM, createDMSchema } from "../createDM";

describe(`createDM`, () => {
  const expected = mockRequest.post(`/users/@me/channels`, channelSchema);
  const config = generateMock(createDMSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createDM(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createDM);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
