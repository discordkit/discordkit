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
import { randomSeed } from "./samples.js";

/**
 * A full-width image editor built as ONE combination input — a connected group of `[ source dropdown | value text | (shuffle) ]`, with the paired hover text on its own line below:
 *
 * - **Sample**: the text holds the DiceBear *seed* (editable); a shuffle button reseeds it. The resolved DiceBear URL is derived in the schema transform.
 * - **URL**: the text holds a custom image URL directly (no shuffle).
 *
 * Binds to a nested `{ source, seed, url, text }` object at `name` (the `on` toggle lives in the section header). All values are real form fields, so Reset restores them.
 */
export const ImageField = <T extends FieldValues>({
  control,
  name
}: {
  control: Control<T, unknown, FieldValues>;
  /** Base path of the image object (e.g. `activity.largeImage`). */
  name: string;
}): React.JSX.Element => {
  const sourcePath = `${name}.source` as FieldPath<T>;
  const source = useWatch({ control, name: sourcePath }) as
    | `sample`
    | `url`
    | undefined;
  const isSample = source !== `url`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Combination input: dropdown | text | (shuffle), connected as one group */}
      <div className="flex h-10 items-stretch overflow-hidden rounded-md border border-white/12 bg-[#2b2d31] focus-within:border-[#5865f2]">
        <Controller
          control={control}
          name={sourcePath}
          render={({ field }) => (
            <Select
              aria-label="Image source"
              selectedKey={String(field.value ?? `sample`)}
              onSelectionChange={(k) => field.onChange(k)}
            >
              <Button className="flex h-full shrink-0 items-center gap-1 border-r border-white/12 bg-[#1e1f22] px-3 text-sm text-[#f2f3f5] outline-none focus:bg-[#232428]">
                <SelectValue />
                <ChevronDown size={14} className="text-[#b5bac1]" />
              </Button>
              <Popover className="rounded-lg border border-white/12 bg-[#2b2d31] p-1">
                <ListBox className="outline-none">
                  <ListBoxItem
                    id="sample"
                    className="cursor-pointer rounded px-2 py-1.5 text-sm text-[#f2f3f5] outline-none selected:bg-[#5865f2] hover:bg-white/5"
                  >
                    Sample
                  </ListBoxItem>
                  <ListBoxItem
                    id="url"
                    className="cursor-pointer rounded px-2 py-1.5 text-sm text-[#f2f3f5] outline-none selected:bg-[#5865f2] hover:bg-white/5"
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
            name={`${name}.seed` as FieldPath<T>}
            render={({ field }) => (
              <>
                <TextField
                  aria-label="Image seed"
                  value={String(field.value ?? ``)}
                  onChange={field.onChange}
                  className="flex h-full flex-1 items-center"
                >
                  <Input
                    className="h-full w-full bg-transparent px-3 text-sm text-[#f2f3f5] outline-none placeholder:text-[#87898c]"
                    placeholder="seed (e.g. discordkit)"
                  />
                </TextField>
                <TooltipTrigger delay={300}>
                  <Button
                    aria-label="Shuffle image seed"
                    onPress={() => field.onChange(randomSeed())}
                    className="flex h-full shrink-0 items-center justify-center border-l border-white/12 bg-[#1e1f22] px-3 text-[#f2f3f5] outline-none transition-colors hover:bg-[#232428] focus:bg-[#232428]"
                  >
                    <Shuffle size={16} />
                  </Button>
                  <Tooltip className="rounded bg-black/90 px-2 py-1 text-xs text-[#f2f3f5]">
                    Shuffle seed
                  </Tooltip>
                </TooltipTrigger>
              </>
            )}
          />
        ) : (
          <Controller
            control={control}
            name={`${name}.url` as FieldPath<T>}
            render={({ field }) => (
              <TextField
                aria-label="Image URL"
                value={String(field.value ?? ``)}
                onChange={field.onChange}
                className="flex h-full flex-1 items-center"
              >
                <Input
                  className="h-full w-full bg-transparent px-3 text-sm text-[#f2f3f5] outline-none placeholder:text-[#87898c]"
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
        name={`${name}.text` as FieldPath<T>}
        render={({ field }) => (
          <TextField
            aria-label="Image hover text"
            value={String(field.value ?? ``)}
            onChange={field.onChange}
          >
            <Input
              className="h-10 w-full rounded-md border border-white/12 bg-[#2b2d31] px-3 text-sm text-[#f2f3f5] outline-none placeholder:text-[#87898c] focus:border-[#5865f2]"
              placeholder="Hover text (tooltip)"
            />
          </TextField>
        )}
      />
    </div>
  );
};
