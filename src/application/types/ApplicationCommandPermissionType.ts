import { z } from "zod";

export enum ApplicationCommandPermissionType {
  ROLE = 1,
  USER = 2,
  CHANNEL = 3
}

export const applicationCommandPermissionType = z.nativeEnum(
  ApplicationCommandPermissionType
);
