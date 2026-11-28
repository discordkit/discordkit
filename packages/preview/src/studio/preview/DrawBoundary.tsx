import { Component, useEffect, type ReactElement, type ReactNode } from "react";
import type { LayoutId } from "../../devices.js";
import { Scene } from "../../react/Scene.js";
import type { AssetUrl } from "../../react/SceneContext.js";
import type { Scene as SceneData } from "../../scene.js";
import styles from "./PreviewPane.module.css";

interface DrawProps {
  scene: SceneData;
  /** Which client's layout to draw (see `devices.ts`). */
  layout: LayoutId;
  assetUrl: AssetUrl;
  /** Why the scene cannot be drawn, when that is known before drawing it: lint's finding for something the renderer refuses (see `undrawableCodes`). The scene is then not rendered at all, so nothing throws. */
  refusal: string | undefined;
  /** Called with the renderer's reason when the scene cannot be drawn, and with undefined once it can. */
  onProblem: (message: string | undefined) => void;
}

/** Draws the scene, and tells Studio it could. */
const Drawn = ({
  scene,
  layout,
  assetUrl,
  onDrawn
}: Omit<DrawProps, `onProblem` | `refusal`> & {
  onDrawn: (scene: SceneData) => void;
}): ReactElement => {
  useEffect(() => onDrawn(scene));
  return <Scene {...scene} layout={layout} assetUrl={assetUrl} />;
};

/** What the preview shows when the scene cannot be drawn: why, over the last scene that could be, faded. */
const Undrawn = ({
  message,
  lastGood,
  layout,
  assetUrl,
  onProblem
}: Omit<DrawProps, `scene` | `refusal`> & {
  message: string;
  lastGood: SceneData | undefined;
}): ReactElement => {
  useEffect(() => onProblem(message), [message, onProblem]);
  return (
    <div className={styles.undrawn}>
      <p role="alert" className={styles.undrawnMessage}>
        <strong>This scene cannot be drawn.</strong> {message}
        {lastGood === undefined
          ? null
          : ` Below is the last version that could be.`}
      </p>
      {lastGood === undefined ? null : (
        <div className={styles.stale} aria-hidden="true">
          <Scene {...lastGood} layout={layout} assetUrl={assetUrl} />
        </div>
      )}
    </div>
  );
};

interface State {
  error: Error | undefined;
  /** The scene the error came from, as JSON, so a changed scene is tried again. Compared by content: the form hands over a new object on every render. */
  failed: string | undefined;
}

/**
 * Draws a scene, or says why it cannot, over the last scene that could be drawn, so the rest of Studio keeps working.
 *
 * A scene lint already knows the renderer refuses (an open select that names nothing, a component it cannot draw where it sits) arrives with its `refusal` and is never rendered. That matters beyond tidiness: the preview is drawn from a deferred copy of the form, and when a deferred render throws, React retries the whole root synchronously, where `useDeferredValue` can hand back the previous scene, which draws; React then reports the first throw as a recoverable error, which a test run counts as unhandled. Catching render errors stays as the net for anything lint did not foresee. React has no hook for that, so this is a class.
 */
export class DrawBoundary extends Component<DrawProps, State> {
  override state: State = { error: undefined, failed: undefined };

  private lastGood: SceneData | undefined;

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  static getDerivedStateFromProps(
    props: DrawProps,
    state: State
  ): Partial<State> | null {
    if (state.error === undefined) return null;
    const key = JSON.stringify(props.scene);
    if (state.failed === undefined) return { failed: key };
    return state.failed === key
      ? null
      : { error: undefined, failed: undefined };
  }

  private readonly onDrawn = (scene: SceneData): void => {
    this.lastGood = scene;
    this.props.onProblem(undefined);
  };

  override render(): ReactNode {
    const { scene, layout, assetUrl, refusal, onProblem } = this.props;
    const message = refusal ?? this.state.error?.message;
    return message === undefined ? (
      <Drawn
        scene={scene}
        layout={layout}
        assetUrl={assetUrl}
        onDrawn={this.onDrawn}
      />
    ) : (
      <Undrawn
        message={message}
        lastGood={this.lastGood}
        layout={layout}
        assetUrl={assetUrl}
        onProblem={onProblem}
      />
    );
  }
}
