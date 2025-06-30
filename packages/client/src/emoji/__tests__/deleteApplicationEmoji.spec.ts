import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteApplicationEmoji,
  deleteApplicationEmojiProcedure,
  deleteApplicationEmojiSafe,
  deleteApplicationEmojiSchema
} from "../deleteApplicationEmoji.js";

describe(`deleteApplicationEmoji`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/emojis/:emoji`,
    deleteApplicationEmojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteApplicationEmojiSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteApplicationEmojiProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteApplicationEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
