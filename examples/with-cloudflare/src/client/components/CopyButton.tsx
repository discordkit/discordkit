import { useEffect, useState } from "react";
import {
  Button,
  Tooltip,
  TooltipTrigger,
  type ButtonProps
} from "react-aria-components";
import { Check, Copy } from "lucide-react";

/**
 * Copy text to the clipboard, with the confirmation the action otherwise
 * lacks: a clipboard write is completely invisible, so without feedback you
 * cannot tell a successful copy from a dead button.
 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    // Undefined on insecure origins, and this example is served over plain
    // http in local dev — so the call is guarded rather than assumed.
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** How long the "copied" confirmation stays up. */
const CONFIRM_MS = 1200;

export const useCopy = (): {
  copied: boolean;
  copy: (text: string) => void;
} => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => {
      setCopied(false);
    }, CONFIRM_MS);
    return (): void => {
      clearTimeout(timer);
    };
  }, [copied]);

  return {
    copied,
    copy: (text: string): void => {
      void (async (): Promise<void> => {
        if (await copyText(text)) setCopied(true);
      })();
    }
  };
};

/**
 * A button that copies `value`, swapping its icon to a tick on success.
 *
 * `label` describes the action for screen readers and the tooltip; `children`
 * is the visible content, so this works both as an icon button and as a
 * clickable value.
 */
export const CopyButton = ({
  value,
  label,
  children,
  className,
  ...props
}: {
  value: string;
  label: string;
  children?: React.ReactNode;
  className?: string;
} & Omit<ButtonProps, `children` | `className`>): React.JSX.Element => {
  const { copied, copy } = useCopy();

  return (
    <TooltipTrigger delay={400}>
      <Button
        {...props}
        aria-label={label}
        onPress={() => {
          copy(value);
        }}
        className={
          className ??
          `flex items-center gap-1 rounded px-1 text-ink-body hover:bg-ink-line hover:text-ink-text`
        }
      >
        {children}
        {copied ? (
          <Check size={11} className="shrink-0 text-ok" aria-hidden />
        ) : (
          <Copy size={11} className="shrink-0 opacity-60" aria-hidden />
        )}
      </Button>
      <Tooltip
        offset={4}
        className="rounded border border-ink-line-strong bg-ink-panel px-2 py-1 text-2xs text-ink-body shadow-lg"
      >
        {copied ? `Copied` : label}
      </Tooltip>
    </TooltipTrigger>
  );
};
