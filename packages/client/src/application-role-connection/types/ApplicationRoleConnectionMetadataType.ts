import { enum_ } from "valibot";

export const ApplicationRoleConnectionMetadataType = {
  /** the metadata value `(integer)` is less than or equal to the guild's configured value `(integer)` */
  INTEGER_LESS_THAN_OR_EQUAL: 1,
  /** the metadata value `(integer)` is greater than or equal to the guild's configured value `(integer)` */
  INTEGER_GREATER_THAN_OR_EQUAL: 2,
  /** the metadata value `(integer)` is equal to the guild's configured value `(integer)` */
  INTEGER_EQUAL: 3,
  /** the metadata value `(integer)` is not equal to the guild's configured value `(integer)` */
  INTEGER_NOT_EQUAL: 4,
  /** the metadata value `(ISO8601 string)` is less than or equal to the guild's configured value `(integer; days before current date)` */
  DATETIME_LESS_THAN_OR_EQUAL: 5,
  /** the metadata value `(ISO8601 string)` is greater than or equal to the guild's configured value `(integer; days before current date)` */
  DATETIME_GREATER_THAN_OR_EQUAL: 6,
  /** the metadata value `(integer)` is equal to the guild's configured value `(integer; 1)` */
  BOOLEAN_EQUAL: 7,
  /** the metadata value `(integer)` is not equal to the guild's configured value `(integer; 1)` */
  BOOLEAN_NOT_EQUAL: 8
} as const;

export const applicationRoleConnectionMetadataTypeSchema = enum_(
  ApplicationRoleConnectionMetadataType
);
