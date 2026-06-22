import { useState } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { Check, Copy } from "lucide-react";

/**
 * Button family. Following the composition guideline, each visual treatment is
 * its OWN component (PrimaryButton / GhostButton) rather than one `<Button
 * variant>` with boolean/enum props — the call sites read as intent, and there's
 * no prop matrix to thread through. All use semantic theme tokens (see
 * `style.css`), so they re-theme from one place.
 */

const base = `flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors`;

/** Subtle neutral action (secondary + icon buttons). `h-10` lines up with inputs. */
export const GhostButton = ({
  className = ``,
  ...props
}: ButtonProps & { className?: string }): React.JSX.Element => (
  <Button
    {...props}
    className={`${base} h-10 bg-elevated px-3 text-text hover:bg-elevated-hover pressed:bg-elevated-active ${className}`}
  />
);

/**
 * Copy-to-clipboard button; flips to a check + "Copied" for 1.5s. Owns its
 * transient copied state — a self-contained interaction, not lifted.
 */
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
      className={`${base} bg-elevated px-2 py-1 text-xs text-text hover:bg-elevated-hover pressed:bg-elevated-active ${className}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? `Copied` : `Copy`}
    </Button>
  );
};
