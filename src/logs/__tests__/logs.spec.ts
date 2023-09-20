import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { auditLogSchema } from "../types";

describe(`logs`, () => {
  it(`getGuildAuditLog`, async () => {
    mockRequest.get(`/guilds/:guild/audit-logs`, auditLogSchema);
    const actual = await client.getGuildAuditLog({
      guild: `foo`
    });
    expect(actual).toBeDefined();
  });
});
