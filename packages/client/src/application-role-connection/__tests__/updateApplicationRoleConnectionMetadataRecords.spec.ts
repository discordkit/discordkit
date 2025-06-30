import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  updateApplicationRoleConnectionMetadataRecordsProcedure,
  updateApplicationRoleConnectionMetadataRecords,
  updateApplicationRoleConnectionMetadataRecordsSchema,
  updateApplicationRoleConnectionMetadataRecordsSafe
} from "../updateApplicationRoleConnectionMetadataRecords.js";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.js";

describe(
  `updateApplicationRoleConnectionMetadataRecords`,
  { repeats: 5 },
  () => {
    const { config, expected } = mockUtils.request.put(
      `/applications/:application/role-connections/metadata`,
      updateApplicationRoleConnectionMetadataRecordsSchema,
      pipe(array(applicationRoleConnectionMetadataSchema), length(1))
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
