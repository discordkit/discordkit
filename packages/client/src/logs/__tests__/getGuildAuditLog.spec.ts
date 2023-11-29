import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildAuditLogProcedure,
  getGuildAuditLogQuery,
  getGuildAuditLogSafe,
  getGuildAuditLogSchema
} from "../getGuildAuditLog.js";
import { auditLogSchema } from "../types/AuditLog.js";

describe(`getGuildAuditLog`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/audit-logs`,
    auditLogSchema,
    { seed: 1 }
  );
  const config = mockSchema(getGuildAuditLogSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildAuditLogSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildAuditLogProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildAuditLogQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
