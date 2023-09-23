import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  groupDMAddRecipient,
  groupDMAddRecipientSchema
} from "../groupDMAddRecipient";

describe(`groupDMAddRecipient`, () => {
  mockRequest.put(`/channels/:channel/recipients/:user`);
  const config = generateMock(groupDMAddRecipientSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.groupDMAddRecipient(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(groupDMAddRecipient);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
