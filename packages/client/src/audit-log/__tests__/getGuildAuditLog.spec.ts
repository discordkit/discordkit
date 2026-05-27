import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getGuildAuditLogSchema,
  getGuildAuditLog
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

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildAuditLog,
        getGuildAuditLogSchema,
        auditLogSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
