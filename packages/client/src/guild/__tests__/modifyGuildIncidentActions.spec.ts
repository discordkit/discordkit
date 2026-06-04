import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildIncidentActions,
  modifyGuildIncidentActionsSchema
} from "../modifyGuildIncidentActions.js";
import { incidentsDataSchema } from "../types/IncidentsData.js";

describe(`modifyGuildIncidentActions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/incident-actions`,
    modifyGuildIncidentActionsSchema,
    incidentsDataSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildIncidentActions,
        modifyGuildIncidentActionsSchema,
        incidentsDataSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
