import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getApplicationRoleConnectionMetadataRecordsProcedure,
  getApplicationRoleConnectionMetadataRecordsQuery,
  getApplicationRoleConnectionMetadataRecordsSafe,
  getApplicationRoleConnectionMetadataRecordsSchema
} from "../getApplicationRoleConnectionMetadataRecords.js";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.js";

describe(`getApplicationRoleConnectionMetadataRecords`, () => {
  const expected = mockRequest.get(
    `/applications/:application/role-connections/metadata`,
    array(applicationRoleConnectionMetadataSchema, [length(1)])
  );
  const config = mockSchema(getApplicationRoleConnectionMetadataRecordsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getApplicationRoleConnectionMetadataRecordsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationRoleConnectionMetadataRecordsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(
      getApplicationRoleConnectionMetadataRecordsQuery,
      config
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
