import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  updateApplicationRoleConnectionMetadataRecordsProcedure,
  updateApplicationRoleConnectionMetadataRecords,
  updateApplicationRoleConnectionMetadataRecordsSchema
} from "../updateApplicationRoleConnectionMetadataRecords";
import { applicationRoleConnectionMetadataSchema } from "../types/ApplicationRoleConnectionMetadata";

describe(`updateApplicationRoleConnectionMetadataRecords`, () => {
  const expected = mockRequest.put(
    `/applications/:application/role-connections/metadata`,
    applicationRoleConnectionMetadataSchema.array()
  );
  const input = generateMock(
    updateApplicationRoleConnectionMetadataRecordsSchema
  );

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(updateApplicationRoleConnectionMetadataRecordsProcedure)(
        input
      )
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(
      updateApplicationRoleConnectionMetadataRecords
    );
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
