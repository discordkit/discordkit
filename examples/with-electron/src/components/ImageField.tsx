import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  useWatch
} from "react-hook-form";
import {
  Button,
  Input,
  type Key,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField,
  Tooltip,
  TooltipTrigger
} from "react-aria-components";
import { ChevronDown, Shuffle } from "lucide-react";
import { randomSeed } from "../samples.js";

/**
 * A full-width image editor built as ONE combination input — a connected group of
 * `[ source dropdown | value text | (shuffle) ]`, with the paired hover text on
 * its own line below:
 *
 * - **Sample**: the text holds the DiceBear *seed* (editable); a shuffle button
 *   reseeds it. The resolved DiceBear URL is derived in the schema transform.
 * - **URL**: the text holds a custom image URL directly (no shuffle).
 *
 * Binds to a nested `{ source, seed, url, text }` object at `name` (the `on`
 * toggle lives in the section header). All values are real form fields, so Reset
 * restores them.
 */
export const ImageField = <T extends FieldValues>({
  control,
  name
}: {
  control: Control<T, unknown, FieldValues>;
  /** Base path of the image object (e.g. `activity.largeImage`). */
  name: string;
}): React.JSX.Element => {
  // RHF's `FieldPath<T>` can't be derived from a runtime-built string, so the
  // base `name` is asserted into the typed-path space once here; every nested
  // path (`.source`, `.seed`, …) is built through this single helper.
  const path = (suffix: string): FieldPath<T> =>
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    `${name}.${suffix}` as FieldPath<T>;
  const sourcePath = path(`source`);
  const watched = useWatch({ control, name: sourcePath });
  // useWatch returns the field's value as the generic form type; narrow it to the
  // known source union (RHF can't infer the literal type from a dynamic path).
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const source = watched as `sample` | `url` | undefined;
  const isSample = source !== `url`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Combination input: dropdown | text | (shuffle), connected as one group */}
      <div className="flex h-10 items-stretch overflow-hidden rounded-md border border-edge bg-surface focus-within:border-brand">
        <Controller
          control={control}
          name={sourcePath}
          render={({ field }) => (
            <Select
              aria-label="Image source"
              // RAC's `selectedKey`/`onSelectionChange` is deprecated in favor of
              // the unified `value`/`onChange` (single mode → the item id directly).
              value={field.value as Key}
              onChange={(value) => field.onChange(value)}
            >
              <Button className="flex h-full shrink-0 items-center gap-1 border-r border-edge bg-canvas px-3 text-sm text-text outline-none focus:bg-surface-hover">
                <SelectValue />
                <ChevronDown size={14} className="text-text-muted" />
              </Button>
              <Popover className="rounded-lg border border-edge bg-surface p-1">
                <ListBox className="outline-none">
                  <ListBoxItem
                    id="sample"
                    className="cursor-pointer rounded px-2 py-1.5 text-sm text-text outline-none selected:bg-brand hover:bg-white/5"
                  >
                    Sample
                  </ListBoxItem>
                  <ListBoxItem
                    id="url"
                    className="cursor-pointer rounded px-2 py-1.5 text-sm text-text outline-none selected:bg-brand hover:bg-white/5"
                  >
                    URL
                  </ListBoxItem>
                </ListBox>
              </Popover>
            </Select>
          )}
        />

        {isSample ? (
          <Controller
            control={control}
            name={path(`seed`)}
            render={({ field }) => (
              <>
                <TextField
                  aria-label="Image seed"
                  value={field.value}
                  onChange={field.onChange}
                  className="flex h-full flex-1 items-center"
                >
                  <Input
                    className="h-full w-full bg-transparent px-3 text-sm text-text outline-none placeholder:text-text-subtle"
                    placeholder="seed (e.g. discordkit)"
                  />
                </TextField>
                <TooltipTrigger delay={300}>
                  <Button
                    aria-label="Shuffle image seed"
                    onPress={() => field.onChange(randomSeed())}
                    className="flex h-full shrink-0 items-center justify-center border-l border-edge bg-canvas px-3 text-text outline-none transition-colors hover:bg-surface-hover focus:bg-surface-hover"
                  >
                    <Shuffle size={16} />
                  </Button>
                  <Tooltip className="rounded bg-overlay px-2 py-1 text-xs text-text">
                    Shuffle seed
                  </Tooltip>
                </TooltipTrigger>
              </>
            )}
          />
        ) : (
          <Controller
            control={control}
            name={path(`url`)}
            render={({ field }) => (
              <TextField
                aria-label="Image URL"
                value={field.value}
                onChange={field.onChange}
                className="flex h-full flex-1 items-center"
              >
                <Input
                  className="h-full w-full bg-transparent px-3 text-sm text-text outline-none placeholder:text-text-subtle"
                  placeholder="https://path.to/image.png"
                />
              </TextField>
            )}
          />
        )}
      </div>

      {/* Paired hover-text field on its own line */}
      <Controller
        control={control}
        name={path(`text`)}
        render={({ field }) => (
          <TextField
            aria-label="Image hover text"
            value={field.value}
            onChange={field.onChange}
          >
            <Input
              className="h-10 w-full rounded-md border border-edge bg-surface px-3 text-sm text-text outline-none placeholder:text-text-subtle focus:border-brand"
              placeholder="Hover text (tooltip)"
            />
          </TextField>
        )}
      />
    </div>
  );
};
