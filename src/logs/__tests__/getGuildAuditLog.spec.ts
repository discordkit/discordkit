import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildAuditLogQuery,
  getGuildAuditLogSchema
} from "../getGuildAuditLog";
import { auditLogSchema } from "../types";

describe(`getGuildAuditLog`, () => {
  mockRequest.get(`/guilds/:guild/audit-logs`, auditLogSchema);
  const config = generateMock(getGuildAuditLogSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildAuditLog(config);
    expect(actual).toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildAuditLogQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
