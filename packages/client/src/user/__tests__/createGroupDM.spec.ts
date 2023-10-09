import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import { literal, merge, object } from "valibot";
import {
  createGroupDM,
  createGroupDMProcedure,
  createGroupDMSafe,
  createGroupDMSchema
} from "../createGroupDM.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { ChannelType } from "../../channel/types/ChannelType.js";

describe(`createGroupDM`, () => {
  const expected = mockRequest.post(
    `/users/@me/channels`,
    merge([channelSchema, object({ type: literal(ChannelType.GROUP_DM) })])
  );
  const config = mockSchema(createGroupDMSchema);

  it(`can be used standalone`, async () => {
    await expect(createGroupDMSafe(config)).resolves.toStrictEqual(expected);
  });

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
