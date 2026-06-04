import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { roleSchema } from "../../permissions/Role.js";
import {
  modifyGuildRolePositions,
  modifyGuildRolePositionsSchema
} from "../modifyGuildRolePositions.js";

describe(`modifyGuildRolePositions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/roles`,
    modifyGuildRolePositionsSchema,
    v.pipe(v.array(roleSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildRolePositions,
        modifyGuildRolePositionsSchema,
        v.pipe(v.array(roleSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
