import type { ReactElement, SVGProps } from "react";

/** Studio's few icons, drawn here as simple strokes so the app needs no icon package. Decorative: every control carries a text label. */
type IconProps = Omit<SVGProps<SVGSVGElement>, `children`>;

const Icon = ({
  children,
  ...props
}: IconProps & { children: ReactElement | ReactElement[] }): ReactElement => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

export const CopyIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" />
  </Icon>
);

export const CheckIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="m3.5 8.5 3 3 6-7" />
  </Icon>
);

export const ChevronIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
  </Icon>
);

export const ErrorIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.75v3.75M8 11h.01" />
  </Icon>
);

export const WarningIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M8 2.5 14 13H2Z" />
    <path d="M8 6.5v3M8 11.25h.01" />
  </Icon>
);

export const PlusIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M8 3.5v9M3.5 8h9" />
  </Icon>
);

export const UpIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />
  </Icon>
);

export const DownIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" />
  </Icon>
);

export const RemoveIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M3 4.5h10M6.5 4.5v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M4.5 4.5l.6 8.1a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.1" />
  </Icon>
);

export const DuplicateIcon = CopyIcon;

export const ChevronRightIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="m6.5 4.5 3.5 3.5-3.5 3.5" />
  </Icon>
);

export const InfoIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 7.25V11M8 5h.01" />
  </Icon>
);

export const UndoIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="M5.5 3.5 2.5 6.5l3 3" />
    <path d="M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2" />
  </Icon>
);

export const RedoIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <path d="m10.5 3.5 3 3-3 3" />
    <path d="M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2" />
  </Icon>
);

export const OkIcon = (props: IconProps): ReactElement => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="m5.5 8.25 1.75 1.75 3.25-3.75" />
  </Icon>
);
