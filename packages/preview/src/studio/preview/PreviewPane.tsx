import type { ReactElement } from "react";
import type { InputKind } from "../../scene/intake.js";
import {
  defaultLocale,
  defaultNow,
  defaultTheme,
  defaultTimeZone,
  defaultWidth,
  type Scene as SceneData,
  type Theme
} from "../../scene.js";
import type { AssetUrl } from "../../react/SceneContext.js";
import {
  ComboField,
  NumberInputField,
  SegmentedField,
  SelectField,
  ToggleField,
  TextInputField
} from "../controls/Fields.js";
import { DrawBoundary } from "./DrawBoundary.js";
import {
  localeOptions,
  noOpenSelect,
  openSelectValue,
  presetFor,
  stringSelectOptions,
  themeOptions,
  timeZoneOptions,
  widthPresets,
  type WidthPreset
} from "./viewOptions.js";
import styles from "./PreviewPane.module.css";

/** A view setting the toolbar changes: a scene field, or which select is open. */
export type ViewChange =
  | { field: `theme`; value: Theme }
  | { field: `width`; value: number }
  | { field: `locale` | `timeZone` | `now`; value: string }
  | { field: `revealSpoilers`; value: boolean }
  | { field: `openSelect`; value: string };

const kindNames: Record<Exclude<InputKind, `scene` | `unknown`>, string> = {
  message: `a message payload`,
  components: `an array of components`,
  component: `one component`
};

const zones = timeZoneOptions();

export interface PreviewPaneProps {
  /** The scene to draw, or undefined when there has never been one that reads. */
  scene: SceneData | undefined;
  /** What the file holds. Only a scene file has a place for view settings. */
  kind: InputKind | undefined;
  assetUrl: AssetUrl;
  onChange: (change: ViewChange) => void;
  /** Why the controls are off, when they are. */
  disabledReason: string | undefined;
  /** Lint's message for a view setting's field, if any. */
  fieldError: (
    field: `locale` | `timeZone` | `now` | `width`
  ) => string | undefined;
  /** Called with the renderer's reason when the scene cannot be drawn, and with undefined once it can. */
  onProblem: (message: string | undefined) => void;
  /** Shown over the stage when the scene on screen is not the pane's text: it does not parse, or a conflict is showing the file's. */
  staleNote: string | undefined;
}

export const PreviewPane = ({
  scene,
  kind,
  assetUrl,
  onChange,
  disabledReason,
  fieldError,
  onProblem,
  staleNote
}: PreviewPaneProps): ReactElement => {
  const disabled = disabledReason !== undefined || scene === undefined;
  const width = scene?.width ?? defaultWidth;
  const theme = scene?.theme ?? defaultTheme;
  const selects = scene === undefined ? [] : stringSelectOptions(scene);
  const preset = presetFor(width);
  return (
    <section className={styles.pane} aria-labelledby="preview-heading">
      <div className={styles.toolbar}>
        <h2 id="preview-heading" className={styles.heading}>
          Preview
        </h2>
        <fieldset className={styles.controls}>
          <legend className={styles.visuallyHidden}>Preview settings</legend>
          <SegmentedField
            label="Discord theme"
            value={theme}
            options={themeOptions}
            onChange={(value) => onChange({ field: `theme`, value })}
            isDisabled={disabled}
          />
          <SegmentedField<WidthPreset | `custom`>
            label="Width preset"
            value={preset ?? `custom`}
            options={[
              ...widthPresets.map(({ id, label, width: px }) => ({
                id,
                label: `${label} ${String(px)}`
              })),
              ...(preset === undefined
                ? [{ id: `custom` as const, label: `Custom` }]
                : [])
            ]}
            onChange={(id) => {
              const chosen = widthPresets.find(
                (candidate) => candidate.id === id
              );
              if (chosen !== undefined)
                onChange({ field: `width`, value: chosen.width });
            }}
            isDisabled={disabled}
          />
          <NumberInputField
            label="Width (px)"
            value={width}
            minValue={1}
            maxValue={4096}
            width={4}
            onChange={(value) => onChange({ field: `width`, value })}
            isDisabled={disabled}
            error={fieldError(`width`)}
          />
          <ComboField
            label="Locale"
            value={scene?.locale ?? defaultLocale}
            options={localeOptions}
            onCommit={(value) => onChange({ field: `locale`, value })}
            isDisabled={disabled}
            error={fieldError(`locale`)}
            width={11}
          />
          <ComboField
            label="Time zone"
            value={scene?.timeZone ?? defaultTimeZone}
            options={zones}
            onCommit={(value) => onChange({ field: `timeZone`, value })}
            isDisabled={disabled}
            error={fieldError(`timeZone`)}
            width={18}
          />
          <TextInputField
            label="Clock (now)"
            value={scene?.now ?? defaultNow}
            onCommit={(value) => onChange({ field: `now`, value })}
            isDisabled={disabled}
            error={fieldError(`now`)}
            width={26}
          />
          <ToggleField
            label="Reveal spoilers"
            isSelected={scene?.revealSpoilers ?? false}
            onChange={(value) => onChange({ field: `revealSpoilers`, value })}
            isDisabled={disabled}
          />
          {selects.length === 0 || scene === undefined ? null : (
            <SelectField
              label="Open select"
              value={openSelectValue(scene)}
              options={[
                { id: noOpenSelect, label: `None (all closed)` },
                ...selects
              ]}
              onChange={(value) => onChange({ field: `openSelect`, value })}
              isDisabled={disabled}
            />
          )}
        </fieldset>
        {disabledReason === undefined ? null : (
          <p className={styles.note}>{disabledReason}</p>
        )}
        {kind === undefined || kind === `scene` || kind === `unknown` ? null : (
          <p className={styles.note}>
            Not written to the file: it holds {kindNames[kind]}, which has no
            place for these settings. To keep them, make it a scene,{" "}
            <code>{`{ "messages": [{ "payload": … }] }`}</code>.
          </p>
        )}
      </div>
      <div className={styles.stage}>
        <div className={styles.frame}>
          <p className={styles.caption}>
            <span>{String(width)} px</span>
            <span>
              {themeOptions.find((option) => option.id === theme)?.label}
            </span>
            {staleNote === undefined ? null : (
              <span className={styles.staleNote}>{staleNote}</span>
            )}
          </p>
          {/* `all: initial` stops Studio's inherited text styles reaching the preview, so it is drawn as the Node renderer draws it. */}
          <div className={styles.isolate} data-testid="preview">
            {scene === undefined ? (
              <p className={styles.empty}>Nothing to draw yet.</p>
            ) : (
              <DrawBoundary
                scene={scene}
                assetUrl={assetUrl}
                onProblem={onProblem}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
