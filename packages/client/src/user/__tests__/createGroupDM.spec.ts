import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGroupDM,
  createGroupDMProcedure,
  createGroupDMSafe,
  createGroupDMSchema
} from "../createGroupDM.js";
import { groupDirectMessageChannelSchema } from "../../channel/types/Channel.js";

describe(`createGroupDM`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/users/@me/channels`,
    createGroupDMSchema,
    groupDirectMessageChannelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGroupDMSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(createGroupDMProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGroupDM);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
