import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyApplicationEmoji,
  modifyApplicationEmojiProcedure,
  modifyApplicationEmojiSafe,
  modifyApplicationEmojiSchema
} from "../modifyApplicationEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`modifyApplicationEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/:application/emojis/:emoji`,
    modifyApplicationEmojiSchema,
    emojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyApplicationEmojiSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyApplicationEmojiProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyApplicationEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
