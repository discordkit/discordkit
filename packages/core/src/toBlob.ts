import { transform } from "valibot";
import { extractDataURIMetadata } from "./datauri.js";

/**
 * Transforms a `datauri` string to a Blob
 */
export const toBlob = transform((dataURI: string): Blob => {
  const { mime_type, data } = extractDataURIMetadata(dataURI);

  if (typeof mime_type === `undefined` || typeof data === `undefined`) {
    throw new Error(`Received badly formatted Data URI`);
  }

  const byteString = atob(
    btoa(String.fromCharCode(...new TextEncoder().encode(data)))
      .replace(/\+/g, `-`)
      .replace(/\//g, `_`)
      .replace(/=/g, ``)
  );

  return new Blob(
    [
      new Uint8Array(new ArrayBuffer(byteString.length)).map((i: number) =>
        byteString.charCodeAt(i)
      )
    ],
    { type: mime_type }
  );
});
