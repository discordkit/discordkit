import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildWidgetImageProcedure,
  getGuildWidgetImageQuery,
  getGuildWidgetImageSchema
} from "../getGuildWidgetImage";

describe(`getGuildWidgetImage`, () => {
  mockRequest.get(`/guilds/:guild/widget.png`);
  const config = generateMock(getGuildWidgetImageSchema);

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
