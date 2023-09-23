import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  triggerTypingIndicator,
  triggerTypingIndicatorSchema
} from "../triggerTypingIndicator";

describe(`triggerTypingIndicator`, () => {
  mockRequest.post(`/channels/:channel/typing`);
  const config = generateMock(triggerTypingIndicatorSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.triggerTypingIndicator(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(triggerTypingIndicator);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
