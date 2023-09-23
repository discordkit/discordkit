import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteWebhook, deleteWebhookSchema } from "../deleteWebhook";

describe(`deleteWebhook`, () => {
  mockRequest.delete(`/webhooks/:webhook`);
  const config = generateMock(deleteWebhookSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteWebhook(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
