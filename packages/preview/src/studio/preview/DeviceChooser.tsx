import { useEffect, useRef, type ReactElement } from "react";
import {
  Autocomplete,
  Button,
  Header,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  SearchField,
  Select,
  SelectValue,
  useFilter,
  type Key
} from "react-aria-components";
import {
  devices,
  platformNames,
  type Device,
  type Platform
} from "../../devices.js";
import { ChevronIcon } from "../controls/icons.js";
import fields from "../controls/Fields.module.css";
import { responsiveKey } from "./viewOptions.js";
import styles from "./DeviceChooser.module.css";

const platforms: readonly Platform[] = [`desktop`, `ios`, `android`];

const groups = platforms.map((platform) => ({
  platform,
  name: platform === `desktop` ? `Desktop windows` : platformNames[platform],
  devices: devices.filter((device) => device.platform === platform)
}));

const sizeOf = (device: Device): string =>
  `${String(device.width)} × ${String(device.height)} · ${String(device.pixelRatio)}x${device.form === `tablet` ? ` · tablet` : ``}`;

/** The list's search field. It takes focus as the list opens, as a browser's device list does, so typing searches straight away; the arrow keys still move through the list from it. */
const DeviceSearch = (): ReactElement => {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  return (
    <SearchField aria-label="Search devices" className={styles.search}>
      <Input
        ref={input}
        className={fields.input}
        placeholder="Search devices"
        spellCheck={false}
      />
    </SearchField>
  );
};

/**
 * Picks the device a viewport shows, like the device list in a browser's device toolbar: a button showing the device, opening a list grouped by platform that can be searched by typing, with "Responsive" (a free width) first.
 */
export const DeviceChooser = ({
  value,
  onChange,
  isDisabled
}: {
  /** A device id, or `responsive`. */
  value: string;
  onChange: (key: string) => void;
  isDisabled?: boolean;
}): ReactElement => {
  const { contains } = useFilter({ sensitivity: `base` });
  return (
    <Select
      className={fields.field}
      value={value}
      onChange={(key: Key | null) => {
        if (key !== null) onChange(String(key));
      }}
      isDisabled={isDisabled}
    >
      <Label className={fields.label}>Device</Label>
      <Button className={`${fields.selectButton} ${styles.trigger}`}>
        {/* The chosen device's name alone: each item also lists its size, which the caption under the chooser already shows. */}
        <SelectValue className={fields.selectValue}>
          {({ selectedText }) => selectedText}
        </SelectValue>
        <ChevronIcon className={fields.chevron} />
      </Button>
      <Popover
        className={`${fields.popover} ${styles.popover}`}
        placement="bottom start"
      >
        <Autocomplete filter={contains}>
          <DeviceSearch />
          <ListBox
            className={`${fields.listBox} ${styles.list}`}
            aria-label="Devices"
            renderEmptyState={() => (
              <p className={styles.empty}>No device matches.</p>
            )}
          >
            <ListBoxSection className={styles.section}>
              <ListBoxItem
                id={responsiveKey}
                textValue="Responsive"
                className={fields.option}
              >
                <span>Responsive</span>
                <span className={fields.optionDetail}>
                  A free width, with no device
                </span>
              </ListBoxItem>
            </ListBoxSection>
            {groups.map((group) => (
              <ListBoxSection key={group.platform} className={styles.section}>
                <Header className={styles.header}>{group.name}</Header>
                {group.devices.map((device) => (
                  <ListBoxItem
                    key={device.id}
                    id={device.id}
                    textValue={device.name}
                    className={fields.option}
                  >
                    <span>{device.name}</span>
                    <span className={fields.optionDetail}>
                      {sizeOf(device)}
                    </span>
                  </ListBoxItem>
                ))}
              </ListBoxSection>
            ))}
          </ListBox>
        </Autocomplete>
      </Popover>
    </Select>
  );
};
