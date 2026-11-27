import { useEffect, useId, useState, type ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Link,
  Popover
} from "react-aria-components";
import type { RenderRequest, RenderStatus } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import { PrimaryButton } from "../controls/Buttons.js";
import styles from "./Export.module.css";

export interface ExportProps {
  backend: Backend;
  /** What to draw: the version on screen and the settings the file does not hold. Undefined while there is none to draw, with why. */
  request: RenderRequest | undefined;
  /** Why the file cannot be drawn now (it is being saved, or a conflict waits), when it cannot. */
  waitingFor: string | undefined;
  /** The PNG's name when saved: the file's, with `.png`. */
  fileName: string;
}

type Phase =
  | { state: `idle` }
  | { state: `drawing`; since: number }
  | {
      state: `drawn`;
      url: string;
      name: string;
      bytes: number;
      width: number;
      height: number;
    }
  | { state: `failed`; message: string };

/** A PNG's size, read from its header. */
const pngSize = (bytes: Uint8Array): { width: number; height: number } => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return bytes.byteLength >= 24
    ? { width: view.getUint32(16), height: view.getUint32(20) }
    : { width: 0, height: 0 };
};

const kilobytes = (bytes: number): string =>
  new Intl.NumberFormat(undefined, {
    style: `unit`,
    unit: `kilobyte`,
    maximumFractionDigits: 0
  }).format(bytes / 1000);

/**
 * The PNG export: the file drawn by the Node renderer the `render` command uses, for the viewports on screen, through the studio command. Where there is no studio command (a draft in the browser), or the machine has no browser for the renderer to drive, it says so instead of offering a button that fails.
 */
export const Export = ({
  backend,
  request,
  waitingFor,
  fileName
}: ExportProps): ReactElement => {
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<RenderStatus>();
  const [phase, setPhase] = useState<Phase>({ state: `idle` });
  const { renderStatus, renderPng } = backend;

  // Asked each time the dialog opens, so a browser installed meanwhile is found.
  useEffect(() => {
    if (!open || renderStatus === undefined) return;
    let live = true;
    const ask = async (): Promise<void> => {
      const answer = await renderStatus();
      if (live) setStatus(answer);
    };
    void ask();
    return (): void => {
      live = false;
    };
  }, [open, renderStatus]);

  // The drawn image is held as an object URL until the next one, or until Studio closes.
  const drawnUrl = phase.state === `drawn` ? phase.url : undefined;
  useEffect(
    () => (): void => {
      if (drawnUrl !== undefined) URL.revokeObjectURL(drawnUrl);
    },
    [drawnUrl]
  );

  const draw = async (): Promise<void> => {
    if (renderPng === undefined || request === undefined) return;
    setPhase({ state: `drawing`, since: Date.now() });
    try {
      const blob = await renderPng(request);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      setPhase({
        state: `drawn`,
        url: URL.createObjectURL(blob),
        name: `${fileName.replace(/\.[^.]+$/, ``)}.png`,
        bytes: bytes.byteLength,
        ...pngSize(bytes)
      });
    } catch (error) {
      setPhase({
        state: `failed`,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const unavailable =
    renderPng === undefined
      ? `PNG export needs the studio command: this is a draft kept in the browser, which cannot run the renderer. Open the file with "discordkit-preview studio <file>", or draw it with "discordkit-preview render".`
      : status?.available === false
        ? status.reason
        : undefined;

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button className={styles.trigger}>Export PNG</Button>
      <Popover className={styles.popover} placement="bottom end">
        <Dialog className={styles.dialog} aria-labelledby={headingId}>
          <Heading id={headingId} slot="title" className={styles.heading}>
            Export PNG
          </Heading>
          <p className={styles.help}>
            Drawn by the same renderer as <code>discordkit-preview render</code>
            , for the viewports on screen, from the file as it is saved.
          </p>
          {unavailable === undefined ? null : (
            <p className={styles.problem} role="alert">
              {unavailable}
            </p>
          )}
          {unavailable === undefined && waitingFor !== undefined ? (
            <p className={styles.waiting}>{waitingFor}</p>
          ) : null}
          <PrimaryButton
            onPress={() => void draw()}
            isDisabled={
              unavailable !== undefined ||
              status === undefined ||
              request === undefined ||
              phase.state === `drawing`
            }
          >
            {phase.state === `drawing`
              ? `Drawing…`
              : phase.state === `drawn`
                ? `Draw again`
                : `Draw the PNG`}
          </PrimaryButton>
          {/* Announced as it changes, so a person who cannot see the image hears that it is ready and how large it is. */}
          <output className={styles.result}>
            {phase.state === `drawing` ? (
              <span className={styles.waiting}>
                Drawing with the Node renderer. The first export launches a
                browser, which takes a few seconds.
              </span>
            ) : phase.state === `failed` ? (
              <span className={styles.problem}>{phase.message}</span>
            ) : phase.state === `drawn` ? (
              <span className={styles.done}>
                <img
                  className={styles.image}
                  src={phase.url}
                  alt={`The exported PNG, ${String(phase.width)} by ${String(phase.height)} pixels.`}
                />
                <span>
                  Drawn: {phase.width} × {phase.height} pixels,{` `}
                  {kilobytes(phase.bytes)}.
                </span>
                <Link
                  className={styles.save}
                  href={phase.url}
                  download={phase.name}
                >
                  Save {phase.name}
                </Link>
              </span>
            ) : null}
          </output>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
