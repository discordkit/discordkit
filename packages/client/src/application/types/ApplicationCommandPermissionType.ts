import { nativeEnum } from "valibot";

export enum ApplicationCommandPermissionType {
  ROLE = 1,
  USER = 2,
  CHANNEL = 3
}

export const applicationCommandPermissionType = nativeEnum(
  ApplicationCommandPermissionType
);
