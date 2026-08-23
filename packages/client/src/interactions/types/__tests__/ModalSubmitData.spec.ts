import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { modalSubmitData } from "../ModalSubmitData.js";
import { ComponentType } from "../../../components/types/ComponentType.js";

const actionRow = {
  type: ComponentType.ActionRow,
  components: [
    { type: ComponentType.Button, style: 2, label: `Yes`, customId: `yes` }
  ]
};

describe(`modalSubmitData`, () => {
  it(`accepts the flat components array a submission carries`, () => {
    expect(
      v.safeParse(modalSubmitData, {
        customId: `my-modal`,
        components: [actionRow]
      }).success
    ).toBe(true);
  });

  it(`rejects a doubly nested components array`, () => {
    // Pins the fix: `messageComponentSchema` is already an array, so an extra
    // `v.array()` around it must not come back.
    expect(
      v.safeParse(modalSubmitData, {
        customId: `my-modal`,
        components: [[actionRow]]
      }).success
    ).toBe(false);
  });
});
