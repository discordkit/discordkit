import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.js";
import {
  getApplicationRoleConnectionMetadataRecordsSchema,
  getApplicationRoleConnectionMetadataRecords
} from "../getApplicationRoleConnectionMetadataRecords.js";

describe(`getApplicationRoleConnectionMetadataRecords`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/role-connections/metadata`,
    getApplicationRoleConnectionMetadataRecordsSchema,
    v.pipe(v.array(applicationRoleConnectionMetadataSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationRoleConnectionMetadataRecords,
        getApplicationRoleConnectionMetadataRecordsSchema,
        v.pipe(v.array(applicationRoleConnectionMetadataSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
