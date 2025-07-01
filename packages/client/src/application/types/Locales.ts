import * as v from "valibot";

export const localesSchema = v.picklist([
  /** Indonesian | Bahasa Indonesia */
  `id`,
  /** Danish | Dansk */
  `da`,
  /** German | Deutsch */
  `de`,
  /** English, UK | English, UK */
  `en-GB`,
  /** English, US | English, US */
  `en-US`,
  /** Spanish | Español */
  `es-ES`,
  /** French | Français */
  `fr`,
  /** Croatian | Hrvatski */
  `hr`,
  /** Italian | Italiano */
  `it`,
  /** Lithuanian | Lietuviškai */
  `lt`,
  /** Hungarian | Magyar */
  `hu`,
  /** Dutch | Nederlands */
  `nl`,
  /** Norwegian | Norsk */
  `no`,
  /** Polish | Polski */
  `pl`,
  /** Portuguese, Brazilian | Português do Brasil */
  `pt-BR`,
  /** Romanian, Romania | Română */
  `ro`,
  /** Finnish | Suomi */
  `fi`,
  /** Swedish | Svenska */
  `sv-SE`,
  /** Vietnamese | Tiếng Việt */
  `vi`,
  /** Turkish | Türkçe */
  `tr`,
  /** Czech | Čeština */
  `cs`,
  /** Greek | Ελληνικά */
  `el`,
  /** Bulgarian | български */
  `bg`,
  /** Russian | Pусский */
  `ru`,
  /** Ukrainian | Українська */
  `uk`,
  /** Hindi | हिन्दी */
  `hi`,
  /** Thai | ไทย */
  `th`,
  /** Chinese, China | 中文 */
  `zh-CN`,
  /** Japanese | 日本語 */
  `ja`,
  /** Chinese, Taiwan | 繁體中文 */
  `zh-TW`,
  /** Korean | 한국어 */
  `ko`
]);

export type Locales = v.InferOutput<typeof localesSchema>;
