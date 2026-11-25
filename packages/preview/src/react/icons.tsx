import type { ReactElement } from "react";

/**
 * Small icons drawn for this package. Discord's own icons are not copied: each of these is a plain shape that reads as the same symbol at the size it is drawn, and only its box size comes from Discord's stylesheet. They draw in `currentColor`.
 */

export interface IconProps {
  className: string;
}

/** A check mark, for a verified app's tag. */
export const CheckIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M4 8.25 6.75 11 12 5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A hash sign, for a text channel mention. */
export const HashIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10 3 8 21M16 3l-2 18M4 8.5h17M3 15.5h17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
    />
  </svg>
);

/** An open eye, for the "Only you can see this" line under an ephemeral message. */
export const EyeIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);
