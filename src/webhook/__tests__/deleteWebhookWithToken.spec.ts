import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteWebhookWithToken,
  deleteWebhookWithTokenSchema
} from "../deleteWebhookWithToken";

describe(`deleteWebhookWithToken`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token`);
  const config = generateMock(deleteWebhookWithTokenSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteWebhookWithToken(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteWebhookWithToken);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
