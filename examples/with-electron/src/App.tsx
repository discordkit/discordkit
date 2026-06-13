import "@discordkit/electron/renderer";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMemo, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import * as v from "valibot";
import type { ActivityInput } from "@discordkit/native/presence";
import { NumberControl, TextControl } from "./fields.js";
import { PreviewCard } from "./PreviewCard.js";
import { showCode } from "./showCode.js";
import { useDiscordPresence } from "./useDiscordPresence.js";
import { useDiscordStatus } from "./useDiscordStatus.js";
import {
  createActivitySchema,
  DEFAULT_VALUES,
  type FormValues
} from "./schema.js";

export const App = (): React.JSX.Element => {
  // Build the schema ONCE, closing over the session-stable party id + start
  // timestamp. The schema's transform turns form values into a ready-to-send
  // ActivityInput, so there's no mapping function and no extra refs.
  const startedAt = useRef(Date.now()).current;
  const schema = useMemo(
    () => createActivitySchema(crypto.randomUUID(), startedAt),
    [startedAt]
  );

  const { control, watch } = useForm<FormValues, unknown, ActivityInput>({
    resolver: valibotResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: `onChange`
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `buttons`
  });
  const values = watch();

  // The activity is just the form values run through the schema's transform —
  // the preview + Show Code update reactively; the push to Discord is debounced.
  const activity = useMemo(() => v.parse(schema, values), [schema, values]);
  const status = useDiscordStatus();
  const { error } = useDiscordPresence(activity);

  return (
    <main className="mx-auto grid max-w-5xl grid-cols-2 gap-8 p-8">
      <section className="flex flex-col gap-4">
        <header>
          <h1 className="text-xl font-semibold">Rich Presence Visualizer</h1>
          <p className="text-sm text-neutral-400">
            Edit the fields — presence updates live via{` `}
            <code>@discordkit/native</code>. Status: <strong>{status}</strong>
            {error ? (
              <span className="block text-amber-400">{error}</span>
            ) : null}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <TextControl control={control} name="details" label="details" />
          <TextControl control={control} name="state" label="state" />
          <TextControl
            control={control}
            name="assets.largeImage"
            label="large Image Key"
          />
          <TextControl
            control={control}
            name="assets.largeText"
            label="large Image Text"
          />
          <TextControl
            control={control}
            name="assets.smallImage"
            label="small Image Key"
          />
          <TextControl
            control={control}
            name="assets.smallText"
            label="small Image Text"
          />
          <NumberControl
            control={control}
            name="party.currentSize"
            label="party Size"
          />
          <NumberControl
            control={control}
            name="party.maxSize"
            label="party Max"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-neutral-400">
              buttons (max 2)
            </span>
            {fields.length < 2 ? (
              <Button
                className="rounded bg-neutral-700 px-2 py-1 text-xs"
                onPress={() => append({ label: ``, url: `` })}
              >
                + Add button
              </Button>
            ) : null}
          </div>
          {fields.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
            >
              <TextControl
                control={control}
                name={`buttons.${i}.label`}
                label="label"
              />
              <TextControl
                control={control}
                name={`buttons.${i}.url`}
                label="url"
              />
              <Button
                className="rounded bg-neutral-700 px-2 py-2 text-xs"
                onPress={() => remove(i)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>

        <Button
          className="self-start rounded-md bg-[#5865f2] px-4 py-2 text-sm text-white"
          onPress={() => void window.discord.clearActivity()}
        >
          Clear presence
        </Button>
      </section>

      <section>
        <Tabs>
          <TabList
            aria-label="Preview"
            className="mb-3 flex gap-4 border-b border-neutral-700 text-sm"
          >
            <Tab
              id="profile"
              className="cursor-pointer pb-2 selected:border-b-2 selected:border-[#5865f2]"
            >
              Full Profile
            </Tab>
            <Tab
              id="code"
              className="cursor-pointer pb-2 selected:border-b-2 selected:border-[#5865f2]"
            >
              Show Code
            </Tab>
          </TabList>
          <TabPanel id="profile">
            <PreviewCard values={values} startedAt={startedAt} />
          </TabPanel>
          <TabPanel id="code">
            <pre className="overflow-auto rounded-md bg-[#2b2d31] p-4 text-xs leading-relaxed">
              {showCode(activity)}
            </pre>
          </TabPanel>
        </Tabs>
      </section>
    </main>
  );
};
