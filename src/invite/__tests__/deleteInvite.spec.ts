import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteInvite, deleteInviteSchema } from "../deleteInvite";

describe(`deleteInvite`, () => {
  mockRequest.delete(`/invites/:code`);
  const config = generateMock(deleteInviteSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteInvite(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
