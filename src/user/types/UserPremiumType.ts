/** Premium types denote the level of premium a user has. Visit the Nitro page to learn more about the premium plans we currently offer. */

import { z } from "zod";

export enum UserPremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2
}

export const userPremiumType = z.nativeEnum(UserPremiumType);
