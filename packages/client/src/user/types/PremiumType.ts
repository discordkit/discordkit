/** Premium types denote the level of premium a user has. Visit the Nitro page to learn more about the premium plans we currently offer. */

import { z } from "zod";

export enum PremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3
}

export const premiumTypeSchema = z.nativeEnum(PremiumType);
