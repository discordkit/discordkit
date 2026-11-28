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

/** An arrow leaving a box, after a Link button's label: the button opens a page outside Discord. */
export const LaunchIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A shopping bag, before a Premium button's product name. */
export const ShopIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 8h14l-1 12H6L5 8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M9 8V6.5a3 3 0 0 1 6 0V8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/** A downward chevron, at the end of a closed select menu. */
export const ChevronDownIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m6 9.5 6 6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A filled circle holding a check mark, beside the chosen option of an open select menu. */
export const SelectedIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path
      d="m7.5 12.25 3 3 6-6.5"
      fill="none"
      stroke="var(--white)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A cross, on a chosen value's pill in a member, role or channel select. */
export const CloseIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m7 7 10 10M17 7 7 17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/** A triangle holding an exclamation mark, for the warning at the top of a modal. The triangle is filled and the mark is cut out of it, so it reads at 20px in one colour. */
export const WarningIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.27 3.5a2 2 0 0 1 3.46 0l8.66 15a2 2 0 0 1-1.73 3H3.34a2 2 0 0 1-1.73-3l8.66-15ZM11 9a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V9Zm1 7.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
    />
  </svg>
);

/** A page with an arrow rising out of it, for a modal's file upload. */
export const UploadIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M13 3l6 6M13 3v4a2 2 0 0 0 2 2h4m0 0v2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 21v-7m-3 3 3-3 3 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A page with its corner folded down, for a file attachment. Drawn in the 30 by 40 box Discord gives its file icon. */
export const FileIcon = ({ className }: IconProps): ReactElement => (
  <svg className={className} viewBox="0 0 30 40" aria-hidden="true">
    <path
      d="M3 1h16l10 10v26a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z"
      fill="var(--background-mod-normal)"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M19 1v8a2 2 0 0 0 2 2h8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M7 20h16M7 25h16M7 30h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
