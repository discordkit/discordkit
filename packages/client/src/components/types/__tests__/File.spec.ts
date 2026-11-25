import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { fileSchema } from "../File.js";
import { ComponentType } from "../ComponentType.js";

describe(`fileSchema`, () => {
  it(`accepts a File component authored for a request, without name or size`, () => {
    // Discord fills in `name` and `size` on the response and ignores them on a request. Requiring them meant a File component could not be sent at all.
    expect(
      v.safeParse(fileSchema, {
        type: ComponentType.File,
        file: { url: `attachment://report.pdf` }
      }).success
    ).toBe(true);
  });

  it(`keeps name and size when a response carries them`, () => {
    // The same schema parses messages Discord returns, which do include both fields; making them optional must not drop them.
    expect(
      v.parse(fileSchema, {
        type: ComponentType.File,
        file: { url: `attachment://report.pdf` },
        name: `report.pdf`,
        size: 2048
      })
    ).toMatchObject({ name: `report.pdf`, size: 2048 });
  });
});
