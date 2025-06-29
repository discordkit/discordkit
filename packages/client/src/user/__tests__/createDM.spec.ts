import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createDM,
  createDMProcedure,
  createDMSafe,
  createDMSchema
} from "../createDM.js";
import { directMessageChannelSchema } from "../../channel/types/Channel.js";

describe(`createDM`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/users/@me/channels`,
    createDMSchema,
    directMessageChannelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createDMSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(createDMProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createDM);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
