import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getApplicationRoleConnectionMetadataRecordsProcedure,
  getApplicationRoleConnectionMetadataRecordsQuery,
  getApplicationRoleConnectionMetadataRecordsSchema
} from "../getApplicationRoleConnectionMetadataRecords";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata";

describe(`getApplicationRoleConnectionMetadataRecords`, () => {
  const expected = mockRequest.get(
    `/applications/:application/role-connections/metadata`,
    applicationRoleConnectionMetadataSchema.array()
  );
  const input = generateMock(getApplicationRoleConnectionMetadataRecordsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationRoleConnectionMetadataRecordsProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(
      getApplicationRoleConnectionMetadataRecordsQuery,
      input
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
