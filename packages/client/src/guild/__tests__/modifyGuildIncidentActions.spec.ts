import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildIncidentActions,
  modifyGuildIncidentActionsProcedure,
  modifyGuildIncidentActionsSafe,
  modifyGuildIncidentActionsSchema
} from "../modifyGuildIncidentActions.js";
import { incidentsDataSchema } from "../types/IncidentsData.js";

describe(`modifyGuildIncidentActions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/incident-actions`,
    modifyGuildIncidentActionsSchema,
    incidentsDataSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildIncidentActionsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildIncidentActionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildIncidentActions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
