import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getUserApplicationRoleConnectionProcedure,
  getUserApplicationRoleConnectionQuery,
  getUserApplicationRoleConnectionSchema
} from "../getUserApplicationRoleConnection";
import { applicationRoleConnectionSchema } from "../../application/types/ApplicationRoleConnection";

describe(`getUserApplicationRoleConnection`, () => {
  const expected = mockRequest.get(
    `/users/@me/applications/:application/role-connection`,
    applicationRoleConnectionSchema
  );
  const config = generateMock(getUserApplicationRoleConnectionSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getUserApplicationRoleConnectionProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getUserApplicationRoleConnectionQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});