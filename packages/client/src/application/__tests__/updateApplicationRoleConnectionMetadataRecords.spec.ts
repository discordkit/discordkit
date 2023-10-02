import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  updateApplicationRoleConnectionMetadataRecordsProcedure,
  updateApplicationRoleConnectionMetadataRecords,
  updateApplicationRoleConnectionMetadataRecordsSchema,
  updateApplicationRoleConnectionMetadataRecordsSafe
} from "../updateApplicationRoleConnectionMetadataRecords.ts";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.ts";

const expected = mockRequest.put(
  `/applications/:application/role-connections/metadata`,
  applicationRoleConnectionMetadataSchema.array().length(1)
);
const config = mockSchema(updateApplicationRoleConnectionMetadataRecordsSchema);

describe(`updateApplicationRoleConnectionMetadataRecords`, () => {
  it(`can be used standalone`, async () => {
    await expect(
      updateApplicationRoleConnectionMetadataRecordsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(updateApplicationRoleConnectionMetadataRecordsProcedure)(
        config
      )
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(
      updateApplicationRoleConnectionMetadataRecords
    );
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
