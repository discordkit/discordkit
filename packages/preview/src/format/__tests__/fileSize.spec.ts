import { describe, expect, it } from "vite-plus/test";
import { formatFileSize } from "../fileSize.js";

/** A file row writes the size under the name, and an author checks it to see the right file went up. The wording and rounding are the client's, decided in JavaScript, and still to be confirmed in calibration. */
describe(`formatFileSize`, () => {
  it.each([
    [0, `0 bytes`],
    [84, `84 bytes`],
    [1023, `1023 bytes`],
    [1024, `1.00 KB`],
    [1594, `1.56 KB`],
    [4_718_592, `4.50 MB`],
    [3 * 1024 ** 3, `3.00 GB`]
  ])(`writes %i bytes as %s, in units of 1024`, (bytes, written) => {
    expect(formatFileSize(bytes)).toBe(written);
  });
});
