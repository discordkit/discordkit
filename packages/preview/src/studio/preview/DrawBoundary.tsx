import { Component, useEffect, type ReactElement, type ReactNode } from "react";
import { Scene } from "../../react/Scene.js";
import type { AssetUrl } from "../../react/SceneContext.js";
import type { Scene as SceneData } from "../../scene.js";
import styles from "./PreviewPane.module.css";

interface DrawProps {
  scene: SceneData;
  assetUrl: AssetUrl;
  /** Called with the renderer's reason when the scene cannot be drawn, and with undefined once it can. */
  onProblem: (message: string | undefined) => void;
}

/** Draws the scene, and tells Studio it could. */
const Drawn = ({
  scene,
  assetUrl,
  onDrawn
}: Omit<DrawProps, `onProblem`> & {
  onDrawn: (scene: SceneData) => void;
}): ReactElement => {
  useEffect(() => onDrawn(scene));
  return <Scene {...scene} assetUrl={assetUrl} />;
};

/** What the preview shows when the scene cannot be drawn: why, over the last scene that could be, faded. */
const Undrawn = ({
  error,
  lastGood,
  assetUrl,
  onProblem
}: Omit<DrawProps, `scene`> & {
  error: Error;
  lastGood: SceneData | undefined;
}): ReactElement => {
  useEffect(() => onProblem(error.message), [error, onProblem]);
  return (
    <div className={styles.undrawn}>
      <p role="alert" className={styles.undrawnMessage}>
        <strong>This scene cannot be drawn.</strong> {error.message}
        {lastGood === undefined
          ? null
          : ` Below is the last version that could be.`}
      </p>
      {lastGood === undefined ? null : (
        <div className={styles.stale} aria-hidden="true">
          <Scene {...lastGood} assetUrl={assetUrl} />
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
 * Draws a scene, and catches one the renderer refuses (an open select that names nothing, a component it cannot draw where it sits) so the rest of Studio keeps working: it shows why, over the last scene that could be drawn. React has no hook for catching a render error, so this is a class.
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
    const { scene, assetUrl, onProblem } = this.props;
    return this.state.error === undefined ? (
      <Drawn scene={scene} assetUrl={assetUrl} onDrawn={this.onDrawn} />
    ) : (
      <Undrawn
        error={this.state.error}
        lastGood={this.lastGood}
        assetUrl={assetUrl}
        onProblem={onProblem}
      />
    );
  }
}
