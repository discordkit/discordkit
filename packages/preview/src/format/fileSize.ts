const units = [`KB`, `MB`, `GB`] as const;

/**
 * A file's size as a file row writes it under the name: whole bytes below 1 KB (`512 bytes`), otherwise to two decimal places in units of 1024 (`48.21 KB`, `7.50 MB`). The client formats this in JavaScript, so the wording, the base and the rounding are unverified.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${String(Math.max(0, Math.round(bytes)))} bytes`;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(2)} ${units[unit]}`;
};
