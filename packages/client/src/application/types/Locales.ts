import { z } from "zod";

export const localesSchema = z.union([
  /** Indonesian | Bahasa Indonesia */
  z.literal(`id`),
  /** Danish | Dansk */
  z.literal(`da`),
  /** German | Deutsch */
  z.literal(`de`),
  /** English, UK | English, UK */
  z.literal(`en-GB`),
  /** English, US | English, US */
  z.literal(`en-US`),
  /** Spanish | Español */
  z.literal(`es-ES`),
  /** French | Français */
  z.literal(`fr`),
  /** Croatian | Hrvatski */
  z.literal(`hr`),
  /** Italian | Italiano */
  z.literal(`it`),
  /** Lithuanian | Lietuviškai */
  z.literal(`lt`),
  /** Hungarian | Magyar */
  z.literal(`hu`),
  /** Dutch | Nederlands */
  z.literal(`nl`),
  /** Norwegian | Norsk */
  z.literal(`no`),
  /** Polish | Polski */
  z.literal(`pl`),
  /** Portuguese, Brazilian | Português do Brasil */
  z.literal(`pt-BR`),
  /** Romanian, Romania | Română */
  z.literal(`ro`),
  /** Finnish | Suomi */
  z.literal(`fi`),
  /** Swedish | Svenska */
  z.literal(`sv-SE`),
  /** Vietnamese | Tiếng Việt */
  z.literal(`vi`),
  /** Turkish | Türkçe */
  z.literal(`tr`),
  /** Czech | Čeština */
  z.literal(`cs`),
  /** Greek | Ελληνικά */
  z.literal(`el`),
  /** Bulgarian | български */
  z.literal(`bg`),
  /** Russian | Pусский */
  z.literal(`ru`),
  /** Ukrainian | Українська */
  z.literal(`uk`),
  /** Hindi | हिन्दी */
  z.literal(`hi`),
  /** Thai | ไทย */
  z.literal(`th`),
  /** Chinese, China | 中文 */
  z.literal(`zh-CN`),
  /** Japanese | 日本語 */
  z.literal(`ja`),
  /** Chinese, Taiwan | 繁體中文 */
  z.literal(`zh-TW`),
  /** Korean | 한국어 */
  z.literal(`ko`)
]);

export type Locales = z.infer<typeof localesSchema>;
