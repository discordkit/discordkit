import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { inviteSchema } from "../types";

describe(`invites`, () => {
  it(`deleteInvite`, () => {
    mockRequest.delete(`/invites/:code`);
    expect(async () =>
      client.deleteInvite({
        code: `foo`
      })
    ).not.toThrow();
  });

  it(`getInvite`, async () => {
    mockRequest.get(`/invites/:code`, inviteSchema);
    const actual = await client.getInvite({
      code: `foo`
    });
    expect(actual).toBeDefined();
  });
});
