import {
  SwitchField,
  SwitchButton,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  SliderTrack,
  SliderThumb,
  Label,
  TextField,
  Input
} from "react-aria-components";
import type { StudioOptions } from "../studio.js";

/**
 * The Studio's tuning controls — the dev-tool payoff. Each control maps to a
 * design-guideline lever (density, the Discord badge, the connection point, the
 * in-game section); changing one re-renders the live friends list beside it, so a
 * developer can dial in their friends-list UX and see it against the spec.
 */
export const ControlsPanel = ({
  options,
  onChange,
  maxInGame
}: {
  options: StudioOptions;
  onChange: (next: StudioOptions) => void;
  maxInGame: number;
}): React.JSX.Element => {
  const set = <K extends keyof StudioOptions>(
    key: K,
    value: StudioOptions[K]
  ): void => onChange({ ...options, [key]: value });

  return (
    <div className="flex w-72 flex-col gap-5 rounded-module border border-edge-soft bg-surface p-5">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-muted">
        Studio
      </h2>

      <Control label="Density">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[options.density]}
          onSelectionChange={(keys) => {
            const next = [...keys][0];
            if (next === `comfortable` || next === `compact`)
              set(`density`, next);
          }}
          className="flex gap-1 rounded-md bg-fill p-1"
        >
          <DensityOption id="comfortable">Comfortable</DensityOption>
          <DensityOption id="compact">Compact</DensityOption>
        </ToggleButtonGroup>
      </Control>

      <Toggle
        label="Discord badge"
        isSelected={options.showDiscordBadge}
        onChange={(v) => set(`showDiscordBadge`, v)}
      />
      <Toggle
        label="Connection point"
        isSelected={options.showConnectionPoint}
        onChange={(v) => set(`showConnectionPoint`, v)}
      />

      <TextField
        value={options.gameTitle}
        onChange={(v) => set(`gameTitle`, v)}
        className="flex flex-col gap-1.5"
      >
        <Label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Game title
        </Label>
        <Input className="h-9 rounded-md border border-edge bg-canvas px-3 text-sm text-text outline-none focus:border-brand" />
      </TextField>

      <Slider
        value={Math.min(options.simulatedInGame, maxInGame)}
        onChange={(v) =>
          set(`simulatedInGame`, Array.isArray(v) ? (v[0] ?? 0) : v)
        }
        minValue={0}
        maxValue={maxInGame}
        className="flex flex-col gap-1.5"
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Simulate in-game
          </Label>
          <span className="text-xs tabular-nums text-text-subtle">
            {Math.min(options.simulatedInGame, maxInGame)} / {maxInGame}
          </span>
        </div>
        <SliderTrack className="relative h-6 w-full">
          {({ state }) => (
            <>
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-fill" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
                style={{ width: `${state.getThumbPercent(0) * 100}%` }}
              />
              <SliderThumb className="top-1/2 size-4 rounded-full bg-text shadow outline-none focus-visible:ring-2 focus-visible:ring-brand" />
            </>
          )}
        </SliderTrack>
      </Slider>
      <p className="text-xs text-text-subtle">
        The SDK’s relationships read carries each friend’s status, not which
        game they’re in — so the in-game section is simulated here for
        previewing the layout.
      </p>
    </div>
  );
};

const Control = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
      {label}
    </span>
    {children}
  </div>
);

const DensityOption = ({
  id,
  children
}: {
  id: string;
  children: React.ReactNode;
}): React.JSX.Element => (
  <ToggleButton
    id={id}
    className="flex-1 rounded px-2 py-1 text-center text-xs font-medium text-text-muted outline-none selected:bg-section selected:text-text focus-visible:ring-2 focus-visible:ring-brand"
  >
    {children}
  </ToggleButton>
);

const Toggle = ({
  label,
  isSelected,
  onChange
}: {
  label: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
}): React.JSX.Element => (
  <SwitchField isSelected={isSelected} onChange={onChange}>
    <SwitchButton className="group flex w-full cursor-pointer items-center justify-between text-sm font-medium text-text">
      <span>{label}</span>
      <span className="flex h-5 w-9 shrink-0 items-center rounded-full bg-switch-off px-0.5 transition-colors group-selected:bg-brand">
        <span className="size-4 rounded-full bg-white shadow-sm transition-transform group-selected:translate-x-4" />
      </span>
    </SwitchButton>
  </SwitchField>
);
