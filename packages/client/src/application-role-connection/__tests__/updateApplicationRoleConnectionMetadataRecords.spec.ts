import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runMutation, runProcedure } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.js";
import {
  updateApplicationRoleConnectionMetadataRecordsProcedure,
  updateApplicationRoleConnectionMetadataRecords,
  updateApplicationRoleConnectionMetadataRecordsSchema,
  updateApplicationRoleConnectionMetadataRecordsSafe
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

    it(`can be used standalone`, async () => {
      await expect(
        updateApplicationRoleConnectionMetadataRecordsSafe(config)
      ).resolves.toEqual(expected);
    });

    it(`is tRPC compatible`, async () => {
      await expect(
        runProcedure(updateApplicationRoleConnectionMetadataRecordsProcedure)(
          config
        )
      ).resolves.toEqual(expected);
    });

    it(`is react-query compatible`, async () => {
      const { result } = runMutation(
        updateApplicationRoleConnectionMetadataRecords
      );
      result.current.mutate(config);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(expected);
    });
  }
);
