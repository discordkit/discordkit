import { transform } from "valibot";
import { extractDataURIMetadata, toBase64 } from "./datauri.js";

/**
 * Transforms a `datauri` string to a Blob
 */
export const toBlob = transform((dataURI: string): Blob => {
  const { mimeType, data } = extractDataURIMetadata(dataURI);

  if (typeof mimeType === `undefined` || typeof data === `undefined`) {
    throw new Error(`Received badly formatted Data URI`);
  }

  const base64 = toBase64(data);

  const ab = new ArrayBuffer(base64.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < base64.length; i++) {
    ia[i] = base64.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeType });
});
