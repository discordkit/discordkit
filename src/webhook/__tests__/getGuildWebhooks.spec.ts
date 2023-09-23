import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import {
  getGuildWebhooksQuery,
  getGuildWebhooksSchema
} from "../getGuildWebhooks";

describe(`getGuildWebhooks`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/webhooks`,
    webhookSchema.array()
  );
  const config = generateMock(getGuildWebhooksSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildWebhooks(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildWebhooksQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
