import { z } from "zod";

export enum IntegrationExpireBehavior {
  REMOVE_ROLE = 0,
  KICK = 1
}

export const integrationExpireBehavior = z.nativeEnum(IntegrationExpireBehavior);
