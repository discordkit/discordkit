import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildAuditLogProcedure,
  getGuildAuditLogQuery,
  getGuildAuditLogSafe,
  getGuildAuditLogSchema
} from "../getGuildAuditLog";
import { auditLogSchema } from "../types/AuditLog";

describe(`getGuildAuditLog`, () => {
  mockRequest.get(`/guilds/:guild/audit-logs`, auditLogSchema);
  const config = generateMock(getGuildAuditLogSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildAuditLogSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildAuditLogProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildAuditLogQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
