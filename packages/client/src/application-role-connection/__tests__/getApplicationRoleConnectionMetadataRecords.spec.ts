import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata.js";
import {
  getApplicationRoleConnectionMetadataRecordsProcedure,
  getApplicationRoleConnectionMetadataRecordsQuery,
  getApplicationRoleConnectionMetadataRecordsSafe,
  getApplicationRoleConnectionMetadataRecordsSchema
} from "../getApplicationRoleConnectionMetadataRecords.js";

describe(`getApplicationRoleConnectionMetadataRecords`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/role-connections/metadata`,
    getApplicationRoleConnectionMetadataRecordsSchema,
    v.pipe(v.array(applicationRoleConnectionMetadataSchema), v.length(1))
  );

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
