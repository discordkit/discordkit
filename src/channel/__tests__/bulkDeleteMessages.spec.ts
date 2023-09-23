import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  bulkDeleteMessages,
  bulkDeleteMessagesSchema
} from "../bulkDeleteMessages";

describe(`bulkDeleteMessages`, () => {
  mockRequest.post(`/channels/:channel/messages/bulk-delete`);
  const config = generateMock(bulkDeleteMessagesSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.bulkDeleteMessages(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(bulkDeleteMessages);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
