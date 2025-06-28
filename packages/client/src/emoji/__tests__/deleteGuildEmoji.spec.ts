import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuildEmoji,
  deleteGuildEmojiProcedure,
  deleteGuildEmojiSafe,
  deleteGuildEmojiSchema
} from "../deleteGuildEmoji.js";

describe(`deleteGuildEmoji`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/emojis/:emoji`,
    deleteGuildEmojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteGuildEmojiSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildEmojiProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
