import type { ReactElement } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay
} from "react-aria-components";
import type { InputKind } from "../../scene/intake.js";
import { PrimaryButton, QuietButton } from "../controls/Buttons.js";
import dialog from "./KindDialog.module.css";

const holds: Record<Exclude<InputKind, `scene` | `unknown`>, string> = {
  message: `a message payload`,
  modal: `a modal`,
  components: `an array of components`,
  component: `one component`
};

/**
 * The way from a file that holds a bare payload to a scene file, which is the only kind with room for preview settings, viewports, an author, the users and files mentions name, and more messages. It changes what the file is for anything else that reads it, so it says exactly what it will do and waits to be asked.
 */
export const ConvertToScene = ({
  fileKind,
  fileName,
  onConvert,
  isDisabled
}: {
  fileKind: InputKind | undefined;
  fileName: string;
  onConvert: () => void;
  isDisabled?: boolean;
}): ReactElement | null => {
  if (
    fileKind === undefined ||
    fileKind === `scene` ||
    fileKind === `unknown`
  ) {
    return null;
  }
  const path =
    fileKind === `message`
      ? `messages[0].payload`
      : fileKind === `modal`
        ? `modal.payload`
        : fileKind === `components`
          ? `messages[0].payload.components`
          : `messages[0].payload.components[0]`;
  return (
    <DialogTrigger>
      <QuietButton isDisabled={isDisabled}>Convert to a scene…</QuietButton>
      <ModalOverlay className={dialog.overlay} isDismissable>
        <Modal className={dialog.modal}>
          <Dialog role="alertdialog" className={dialog.dialog}>
            {({ close }) => (
              <>
                <Heading slot="title" className={dialog.title}>
                  Make {fileName} a scene?
                </Heading>
                <p className={dialog.text}>
                  {fileName} holds {holds[fileKind]}. Studio will rewrite it as
                  a scene with that as its one message, at{` `}
                  <code>{path}</code>. Keys keep their spelling, and the whole
                  file is indented afresh.
                </p>
                <p className={dialog.text}>
                  The preview settings and viewports chosen here are saved in
                  it, and it can then hold an author, more messages, and the
                  users, roles, channels, emoji and files the message mentions.
                  Anything else that reads this file as a payload (a bot&apos;s
                  code, a test) will need to read <code>{path}</code> instead.
                  Undo takes it back.
                </p>
                <div className={dialog.actions}>
                  {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- an alert dialog starts on its least drastic choice. */}
                  <QuietButton onPress={close} autoFocus>
                    Keep it as it is
                  </QuietButton>
                  <PrimaryButton
                    onPress={() => {
                      onConvert();
                      close();
                    }}
                  >
                    Make it a scene
                  </PrimaryButton>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
