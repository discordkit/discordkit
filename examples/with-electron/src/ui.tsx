import { useState, type ReactNode } from "react";
import {
  Button,
  type ButtonProps,
  Switch,
  type SwitchProps
} from "react-aria-components";
import { Check, Copy } from "lucide-react";

/**
 * Shared, Discord-styled UI tokens + primitives, so the editor matches Discord's
 * settings aesthetic consistently (dark surfaces, blurple accent, rounded
 * controls, uppercase micro-labels, sectioned layout) rather than ad-hoc styles.
 */
// Contrast tuned with APCA in mind: on the page bg (#1a1b1e-ish) and the input
// bg (#2b2d31), body text uses near-white (#f2f3f5, Lc≈90+), secondary text uses
// #b5bac1 (Discord's "interactive-normal", Lc≈60+ — comfortably readable, not
// the muted neutral-500 that fell short), and borders are visible (white/12)
// rather than near-invisible black/30. Inputs sit a step LIGHTER than the page
// so the field boundary reads without relying on a faint border alone.
export const tokens = {
  input: `h-10 w-full rounded-md border border-white/12 bg-[#2b2d31] px-3 text-sm text-[#f2f3f5] outline-none placeholder:text-[#87898c] focus:border-[#5865f2]`,
  label: `text-xs font-semibold uppercase tracking-wide text-[#b5bac1]`,
  hint: `text-xs text-[#b5bac1]`,
  panel: `rounded-lg border border-white/12 bg-[#2b2d31] p-1`,
  field: `flex flex-col gap-1.5`
};

/** A labeled settings section with a top divider, à la Discord's settings. */
export const Section = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}): React.JSX.Element => (
  <section className="border-t border-white/10 pt-5">
    <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
      {title}
    </h2>
    {children}
  </section>
);

/** Blurple primary action. */
export const PrimaryButton = (props: ButtonProps): React.JSX.Element => (
  <Button
    {...props}
    className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#5865f2] px-4 text-sm font-medium text-white transition-colors hover:bg-[#4752c4] pressed:bg-[#3c45a5]"
  />
);

/** Subtle neutral action (secondary buttons, icon buttons). `h-10` so it lines
 * up exactly with inputs when placed beside them in a row. */
export const GhostButton = ({
  className = ``,
  ...props
}: ButtonProps & { className?: string }): React.JSX.Element => (
  <Button
    {...props}
    className={`flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#4e5058] px-3 text-sm font-medium text-[#f2f3f5] transition-colors hover:bg-[#6d6f78] pressed:bg-[#41434a] ${className}`}
  />
);

/** The Discord-style switch track + knob. Grey/left when off, blurple/right when
 * on (RAC `group-selected:` variants, enabled by the tailwindcss-react-aria
 * plugin in style.css). Reused by {@link Toggle} and {@link SectionToggle}. */
const SwitchTrack = (): React.JSX.Element => (
  <span className="flex h-6 w-10 shrink-0 items-center rounded-full bg-[#80848e] px-0.5 transition-colors group-selected:bg-[#5865f2]">
    <span className="size-5 rounded-full bg-white shadow-sm transition-transform group-selected:translate-x-4" />
  </span>
);

/** A labeled on/off switch (track on the left, label after it). */
export const Toggle = ({
  children,
  ...props
}: SwitchProps & { children: ReactNode }): React.JSX.Element => (
  <Switch
    {...props}
    className="group flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#f2f3f5]"
  >
    <SwitchTrack />
    {children}
  </Switch>
);

/**
 * A section whose header row carries an enable switch on the right — Discord's
 * pattern for conditionally-shown settings. When `isSelected` is false the
 * `children` (the inputs) are hidden, making omission explicit rather than
 * inferred from an empty field.
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
  <section className="border-t border-white/10 pt-5">
    <Switch
      isSelected={isSelected}
      onChange={onChange}
      className="group mb-3 flex w-full cursor-pointer items-center justify-between"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
        {title}
      </span>
      <SwitchTrack />
    </Switch>
    {isSelected ? children : null}
  </section>
);

/** A small copy-to-clipboard button; flips to a check + "Copied" briefly. */
export const CopyButton = ({
  text,
  className = ``
}: {
  text: string;
  className?: string;
}): React.JSX.Element => {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      aria-label="Copy code"
      onPress={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`flex items-center gap-1 rounded-md bg-[#4e5058] px-2 py-1 text-xs font-medium text-[#f2f3f5] transition-colors hover:bg-[#6d6f78] pressed:bg-[#41434a] ${className}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? `Copied` : `Copy`}
    </Button>
  );
};
