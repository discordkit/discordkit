import type { ReactNode } from "react";
import {
  SwitchButton,
  SwitchField,
  type SwitchFieldProps
} from "react-aria-components";

/**
 * Switch family. Uses React Aria's `SwitchField` + `SwitchButton` (the `Switch`
 * all-in-one is deprecated): `SwitchField` owns the selection state/value props,
 * `SwitchButton` is the clickable label that exposes the `data-selected` state
 * the `group-selected:` track variants key off. Toggle and SectionToggle share
 * the track via {@link SwitchTrack}.
 */

/** The Discord-style track + knob: grey/left off, blurple/right on (RAC
 * `group-selected:` variants, enabled by the tailwindcss-react-aria plugin). */
const SwitchTrack = (): React.JSX.Element => (
  <span className="flex h-6 w-10 shrink-0 items-center rounded-full bg-switch-off px-0.5 transition-colors group-selected:bg-brand">
    <span className="size-5 rounded-full bg-white shadow-sm transition-transform group-selected:translate-x-4" />
  </span>
);

/** A labeled on/off switch (track on the left, label after it). */
export const Toggle = ({
  children,
  ...props
}: SwitchFieldProps & { children: ReactNode }): React.JSX.Element => (
  <SwitchField {...props}>
    <SwitchButton className="group flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text">
      <SwitchTrack />
      {children}
    </SwitchButton>
  </SwitchField>
);

/**
 * A section whose header row carries an enable switch on the right — Discord's
 * pattern for conditionally-shown settings. When off, the `children` (inputs) are
 * hidden, making omission explicit rather than inferred from empty fields.
 */
export const SectionToggle = ({
  title,
  isSelected,
  onChange,
  children
}: {
  title: string;
  isSelected: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}): React.JSX.Element => (
  <section className="border-t border-edge-soft pt-5">
    <SwitchField isSelected={isSelected} onChange={onChange}>
      <SwitchButton className="group mb-3 flex w-full cursor-pointer items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
          {title}
        </span>
        <SwitchTrack />
      </SwitchButton>
    </SwitchField>
    {isSelected ? children : null}
  </section>
);
