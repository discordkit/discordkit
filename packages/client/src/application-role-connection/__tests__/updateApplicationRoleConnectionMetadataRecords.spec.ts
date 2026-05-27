import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.js";
import {
  updateApplicationRoleConnectionMetadataRecords,
  updateApplicationRoleConnectionMetadataRecordsSchema
} from "../updateApplicationRoleConnectionMetadataRecords.js";

describe(
  `updateApplicationRoleConnectionMetadataRecords`,
  { repeats: 5 },
  () => {
    const { config, expected } = mockUtils.request.put(
      `/applications/:application/role-connections/metadata`,
      updateApplicationRoleConnectionMetadataRecordsSchema,
      v.pipe(v.array(applicationRoleConnectionMetadataSchema), v.length(1))
    );

    it(`validates input, fetches, and validates output`, async () => {
      await expect(
        toValidated(
          updateApplicationRoleConnectionMetadataRecords,
          updateApplicationRoleConnectionMetadataRecordsSchema,
          v.pipe(v.array(applicationRoleConnectionMetadataSchema), v.length(1))
        )(config)
      ).resolves.toEqual(expected);
    });
  }
);
