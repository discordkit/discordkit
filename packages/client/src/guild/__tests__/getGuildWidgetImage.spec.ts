import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildWidgetImageProcedure,
  getGuildWidgetImageQuery,
  getGuildWidgetImageSafe,
  getGuildWidgetImageSchema
} from "../getGuildWidgetImage.ts";

describe(`getGuildWidgetImage`, () => {
  mockRequest.get(`/guilds/:guild/widget.png`);
  const config = mockSchema(getGuildWidgetImageSchema);

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
