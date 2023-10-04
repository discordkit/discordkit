import { waitFor } from "@testing-library/react";
import { z } from "zod";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createDM,
  createDMProcedure,
  createDMSafe,
  createDMSchema
} from "../createDM.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { ChannelType } from "../../channel/types/ChannelType.js";

describe(`createDM`, () => {
  const expected = mockRequest.post(
    `/users/@me/channels`,
    channelSchema.extend({ type: z.literal(ChannelType.DM) })
  );
  const config = mockSchema(createDMSchema);

  it(`can be used standalone`, async () => {
    await expect(createDMSafe(config)).resolves.toStrictEqual(expected);
  });

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
