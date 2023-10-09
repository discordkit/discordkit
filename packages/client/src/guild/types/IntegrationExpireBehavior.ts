import { nativeEnum } from "valibot";

export enum IntegrationExpireBehavior {
  REMOVE_ROLE = 0,
  KICK = 1
}

export const integrationExpireBehaviorSchema = nativeEnum(
  IntegrationExpireBehavior
);
