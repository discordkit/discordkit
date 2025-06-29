import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildAuditLogProcedure,
  getGuildAuditLogQuery,
  getGuildAuditLogSafe,
  getGuildAuditLogSchema
} from "../getGuildAuditLog.js";
import { auditLogSchema } from "../types/AuditLog.js";

describe(`getGuildAuditLog`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/audit-logs`,
    getGuildAuditLogSchema,
    auditLogSchema,
    {
      seed: 1
    }
  );

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
