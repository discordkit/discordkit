import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildWidgetImageQuery,
  getGuildWidgetImageSchema
} from "../getGuildWidgetImage";

describe(`getGuildWidgetImage`, () => {
  mockRequest.get(`/guilds/:guild/widget.png`);
  const config = generateMock(getGuildWidgetImageSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.getGuildWidgetImage(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildWidgetImageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
