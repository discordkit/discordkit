import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildWidgetImageProcedure,
  getGuildWidgetImageQuery,
  getGuildWidgetImageSafe,
  getGuildWidgetImageSchema
} from "../getGuildWidgetImage.js";

describe(`getGuildWidgetImage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.get(
    `/guilds/:guild/widget.png`,
    getGuildWidgetImageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildWidgetImageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWidgetImageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWidgetImageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
