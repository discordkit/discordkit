import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getChannelPinsProcedure,
  getChannelPinsQuery,
  getChannelPinsSafe,
  getChannelPinsSchema
} from "../getChannelPins.js";
import { messagePinSchema } from "../types/MessagePin.js";

describe(`getChannelPins`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/pins`,
    getChannelPinsSchema,
    pipe(array(messagePinSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getChannelPinsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelPinsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelPinsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
