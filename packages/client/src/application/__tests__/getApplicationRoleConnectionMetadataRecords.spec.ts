import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getApplicationRoleConnectionMetadataRecordsProcedure,
  getApplicationRoleConnectionMetadataRecordsQuery,
  getApplicationRoleConnectionMetadataRecordsSafe,
  getApplicationRoleConnectionMetadataRecordsSchema
} from "../getApplicationRoleConnectionMetadataRecords.ts";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.ts";

describe(`getApplicationRoleConnectionMetadataRecords`, () => {
  const expected = mockRequest.get(
    `/applications/:application/role-connections/metadata`,
    applicationRoleConnectionMetadataSchema.array().length(1)
  );
  const config = generateMock(
    getApplicationRoleConnectionMetadataRecordsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      getApplicationRoleConnectionMetadataRecordsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationRoleConnectionMetadataRecordsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(
      getApplicationRoleConnectionMetadataRecordsQuery,
      config
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
