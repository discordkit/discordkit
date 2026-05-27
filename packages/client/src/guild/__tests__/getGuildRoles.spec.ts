import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { roleSchema } from "../../permissions/Role.js";
import { getGuildRolesSchema, getGuildRoles } from "../getGuildRoles.js";

describe(`getGuildRoles`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/roles`,
    getGuildRolesSchema,
    v.pipe(v.array(roleSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildRoles,
        getGuildRolesSchema,
        v.pipe(v.array(roleSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
