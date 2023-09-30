import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildVanityURLProcedure,
  getGuildVanityURLQuery,
  getGuildVanityURLSafe,
  getGuildVanityURLSchema
} from "../getGuildVanityURL";
import { inviteSchema } from "../../invite/types/Invite";

describe(`getGuildVanityURL`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/vanity-url`,
    inviteSchema.partial()
  );
  const config = generateMock(getGuildVanityURLSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildVanityURLSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildVanityURLProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildVanityURLQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
