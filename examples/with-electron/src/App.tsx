import "@discordkit/electron/renderer";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMemo, useRef } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { Info, Plus, RotateCcw, Trash2 } from "lucide-react";
import * as v from "valibot";
import type { ActivityInput } from "@discordkit/native/presence";
import { NumberControl, TextControl } from "./fields.js";
import { ImageField } from "./imageField.js";
import { PreviewCard } from "./PreviewCard.js";
import { showCode } from "./showCode.js";
import { CopyButton, GhostButton, SectionToggle, Toggle } from "./ui.js";
import { useDiscordPresence } from "./useDiscordPresence.js";
import { useDiscordStatus } from "./useDiscordStatus.js";
import {
  createActivitySchema,
  DEFAULT_VALUES,
  type FormValues
} from "./schema.js";

export const App = (): React.JSX.Element => {
  // Build the schema ONCE, closing over the session-stable party id + start timestamp. Its transform turns form values into a ready-to-send ActivityInput, so there's no mapping function and no extra refs.
  const startedAt = useRef(Date.now()).current;
  const schema = useMemo(
    () => createActivitySchema(crypto.randomUUID(), startedAt),
    [startedAt]
  );

  const { control, watch, reset } = useForm<FormValues, unknown, ActivityInput>(
    {
      resolver: valibotResolver(schema),
      defaultValues: DEFAULT_VALUES,
      mode: `onChange`
    }
  );
  const { fields, append, remove } = useFieldArray({
    control,
    name: `activity.buttons`
  });
  const values = watch();

  // safeParse, NOT parse: while you type a partial URL the schema is briefly invalid, and a throwing parse in render would unmount the tree. On invalid input keep the last valid activity (seeded from the always-valid defaults).
  const lastValid = useRef<ActivityInput>(v.parse(schema, DEFAULT_VALUES));
  const activity = useMemo(() => {
    const result = v.safeParse(schema, values);
    if (result.success) lastValid.current = result.output;
    return lastValid.current;
  }, [schema, values]);
  const status = useDiscordStatus();
  // Master toggle: when off, push null → fully clears presence in Discord.
  const { error } = useDiscordPresence(values.enabled ? activity : null);

  return (
    <main className="mx-auto grid max-w-5xl grid-cols-[1fr_340px] gap-10 p-8">
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="text-xl font-semibold">Rich Presence Visualizer</h1>
          <p className="mt-1 text-sm text-[#b5bac1]">
            Toggle a section on to include it; edit the fields and presence
            updates live via{` `}
            <code className="rounded bg-[#1e1f22] px-1.5 py-0.5">
              @discordkit/native
            </code>
            . No login required.
          </p>
        </header>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Controller
          control={control}
          name="activity.details.on"
          render={({ field }) => (
            <SectionToggle
              title="Details"
              isSelected={Boolean(field.value)}
              onChange={field.onChange}
            >
              <TextControl
                control={control}
                name="activity.details.value"
                label="details (first line)"
              />
            </SectionToggle>
          )}
        />

        <Controller
          control={control}
          name="activity.state.on"
          render={({ field }) => (
            <SectionToggle
              title="State"
              isSelected={Boolean(field.value)}
              onChange={field.onChange}
            >
              <TextControl
                control={control}
                name="activity.state.value"
                label="state (second line)"
              />
            </SectionToggle>
          )}
        />

        <Controller
          control={control}
          name="activity.largeImage.on"
          render={({ field }) => (
            <SectionToggle
              title="Large image"
              isSelected={Boolean(field.value)}
              onChange={field.onChange}
            >
              <ImageField control={control} name="activity.largeImage" />
            </SectionToggle>
          )}
        />

        <Controller
          control={control}
          name="activity.smallImage.on"
          render={({ field }) => (
            <SectionToggle
              title="Small image (corner badge)"
              isSelected={Boolean(field.value)}
              onChange={field.onChange}
            >
              <ImageField control={control} name="activity.smallImage" />
            </SectionToggle>
          )}
        />

        <Controller
          control={control}
          name="activity.party.on"
          render={({ field }) => (
            <SectionToggle
              title="Party (player count)"
              isSelected={Boolean(field.value)}
              onChange={field.onChange}
            >
              <div className="grid grid-cols-2 gap-4">
                <NumberControl
                  control={control}
                  name="activity.party.currentSize"
                  label="party size"
                />
                <NumberControl
                  control={control}
                  name="activity.party.maxSize"
                  label="party max"
                />
              </div>
            </SectionToggle>
          )}
        />

        <Controller
          control={control}
          name="activity.useTimestamp"
          render={({ field }) => (
            <section className="flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                Elapsed timer
              </span>
              <Toggle
                isSelected={Boolean(field.value)}
                onChange={field.onChange}
              >
                <span className="sr-only">Show elapsed timer</span>
              </Toggle>
            </section>
          )}
        />

        <section className="border-t border-white/10 pt-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
            Buttons
          </h2>
          <div className="flex flex-col gap-3">
            {fields.map((f, i) => (
              <div key={f.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <TextControl
                    control={control}
                    name={`activity.buttons.${i}.label`}
                    label="label"
                  />
                </div>
                <div className="flex-2">
                  <TextControl
                    control={control}
                    name={`activity.buttons.${i}.url`}
                    label="url"
                  />
                </div>
                <GhostButton
                  aria-label="Remove button"
                  onPress={() => remove(i)}
                  className="px-2.5"
                >
                  <Trash2 size={16} />
                </GhostButton>
              </div>
            ))}
            {fields.length < 2 ? (
              <GhostButton
                className="self-start"
                onPress={() => append({ label: ``, url: `` })}
              >
                <Plus size={16} /> Add button
              </GhostButton>
            ) : null}
            <p className="flex items-start gap-1.5 text-xs text-[#b5bac1]">
              <Info size={13} className="mt-0.5 shrink-0" />
              <span>
                Discord only shows buttons to <em>other</em> people viewing your
                profile — you won&apos;t see your own. Use a second account to
                verify.
              </span>
            </p>
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <Tabs>
          <TabList
            aria-label="Preview"
            className="mb-3 flex gap-1 rounded-lg bg-[#1e1f22] p-1 text-sm"
          >
            <Tab
              id="profile"
              className="flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-[#b5bac1] outline-none transition-colors selected:bg-[#4e5058] selected:text-white focus-visible:ring-2 focus-visible:ring-[#5865f2]"
            >
              Full Profile
            </Tab>
            <Tab
              id="code"
              className="flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-[#b5bac1] outline-none transition-colors selected:bg-[#4e5058] selected:text-white focus-visible:ring-2 focus-visible:ring-[#5865f2]"
            >
              Show Code
            </Tab>
          </TabList>
          <TabPanel id="profile">
            <PreviewCard values={values} startedAt={startedAt} />
          </TabPanel>
          <TabPanel id="code">
            <div className="relative">
              <CopyButton
                text={showCode(activity)}
                className="absolute right-2 top-2"
              />
              <pre className="overflow-auto rounded-md bg-[#2b2d31] p-4 pt-10 text-xs leading-relaxed">
                {showCode(activity)}
              </pre>
            </div>
          </TabPanel>
        </Tabs>

        {/* Presence controls live under the preview, where the result shows. */}
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#2b2d31] p-4">
          <Controller
            control={control}
            name="enabled"
            render={({ field }) => (
              <Toggle
                isSelected={Boolean(field.value)}
                onChange={field.onChange}
              >
                {field.value ? `Presence is on` : `Presence is off`}
              </Toggle>
            )}
          />
          <p className="text-xs text-[#b5bac1]">
            Turning it off fully clears your Rich Presence in Discord. Back on
            pushes the current edits again.
          </p>
          <GhostButton
            className="self-start"
            onPress={() => reset(DEFAULT_VALUES)}
          >
            <RotateCcw size={16} /> Reset to defaults
          </GhostButton>
        </div>

        <p className="text-xs text-[#949ba4]">
          SDK status: {status} — Rich Presence doesn&apos;t require an
          authenticated connection, so this stays “Disconnected” unless you sign
          in. Your presence still appears regardless.
        </p>
      </aside>
    </main>
  );
};
