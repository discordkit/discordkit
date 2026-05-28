import * as v from "valibot";
import {
  collectFileUploads,
  fileUpload,
  isFileUpload,
  multipart,
  shouldSerializeAsMultipart,
  toMultipartBody,
  type FileUpload
} from "../fileUpload.js";
import { toSnakeKeys } from "../../utils/toSnakeKeys.js";

describe(`fileUpload`, () => {
  describe(`isFileUpload`, () => {
    it(`accepts the canonical shape`, () => {
      expect(
        isFileUpload({
          filename: `a.png`,
          content: new Blob([new Uint8Array([1, 2, 3])])
        })
      ).toBe(true);
    });

    it(`rejects an object missing filename`, () => {
      expect(isFileUpload({ content: new Blob() })).toBe(false);
    });

    it(`rejects a primitive`, () => {
      expect(isFileUpload(`hello`)).toBe(false);
      expect(isFileUpload(null)).toBe(false);
      expect(isFileUpload(undefined)).toBe(false);
    });
  });

  describe(`schema`, () => {
    it(`validates a FileUpload value`, () => {
      const input: FileUpload = {
        filename: `a.png`,
        content: new Blob([new Uint8Array([0])])
      };
      expect(v.parse(fileUpload, input)).toBe(input);
    });

    it(`rejects non-FileUpload values`, () => {
      expect(() => v.parse(fileUpload, { filename: `a.png` })).toThrow();
    });
  });

  describe(`collectFileUploads`, () => {
    it(`finds uploads nested anywhere in a body`, () => {
      const file: FileUpload = { filename: `a.png`, content: new Blob() };
      const body = {
        content: `hello`,
        attachments: [{ id: 0, description: `pic` }],
        files: [file, file]
      };
      const found = collectFileUploads(body);
      expect(found).toHaveLength(2);
      expect(found[0].path).toEqual([`files`, 0]);
      expect(found[1].path).toEqual([`files`, 1]);
    });

    it(`returns an empty array when no uploads are present`, () => {
      expect(
        collectFileUploads({ content: `hello`, attachments: [] })
      ).toHaveLength(0);
    });
  });

  describe(`toMultipartBody`, () => {
    it(`replaces uploads with placeholders and builds a FormData`, async () => {
      const file: FileUpload = {
        filename: `a.png`,
        content: new Blob([new Uint8Array([0xff])], { type: `image/png` })
      };
      const body = {
        content: `hello`,
        files: [file]
      };
      const form = toMultipartBody(body, toSnakeKeys);
      expect(form).toBeInstanceOf(FormData);
      const payloadJson = form.get(`payload_json`);
      expect(payloadJson).toBeInstanceOf(Blob);
      const text = await (payloadJson as Blob).text();
      const parsed = JSON.parse(text);
      // The file gets replaced with { id: 0 } as a placeholder.
      expect(parsed).toEqual({ content: `hello`, files: [{ id: 0 }] });
      // And the file part itself is appended as files[0].
      const filesEntry = form.get(`files[0]`);
      expect(filesEntry).toBeInstanceOf(Blob);
      // In spec-compliant FormData the entry would be a File with `name === "a.png"`;
      // happy-dom serializes it as a plain Blob, so we just confirm the part exists
      // and has content. The filename is preserved via the multipart boundary header
      // when the FormData is sent through fetch.
      expect((filesEntry as Blob).size).toBeGreaterThan(0);
    });

    it(`throws if there are no uploads`, () => {
      expect(() => toMultipartBody({ content: `hello` }, toSnakeKeys)).toThrow(
        /no FileUploads/
      );
    });
  });

  describe(`multipart`, () => {
    const schema = multipart({
      file: v.exactOptional(fileUpload),
      caption: v.exactOptional(v.string())
    });

    it(`validates the same shape as v.object`, () => {
      const parsed = v.parse(schema, { caption: `hello` });
      expect(parsed).toEqual({ caption: `hello` });
    });

    it(`stamps the multipart marker when a FileUpload is present`, () => {
      const parsed = v.parse(schema, {
        file: { filename: `a.png`, content: new Blob() }
      });
      expect(shouldSerializeAsMultipart(parsed)).toBe(true);
    });

    it(`does NOT stamp the marker when no FileUpload is present`, () => {
      const parsed = v.parse(schema, { caption: `no files here` });
      expect(shouldSerializeAsMultipart(parsed)).toBe(false);
    });

    it(`marker survives nested arrays of file uploads`, () => {
      const nestedSchema = multipart({
        files: v.array(fileUpload)
      });
      const parsed = v.parse(nestedSchema, {
        files: [{ filename: `a.png`, content: new Blob() }]
      });
      expect(shouldSerializeAsMultipart(parsed)).toBe(true);
    });

    describe(`{ partial: true }`, () => {
      const partialSchema = multipart(
        {
          content: v.string(),
          files: v.array(fileUpload)
        },
        { partial: true }
      );

      it(`accepts an empty body`, () => {
        expect(v.parse(partialSchema, {})).toEqual({});
      });

      it(`accepts a body with only the non-file field`, () => {
        expect(v.parse(partialSchema, { content: `hi` })).toEqual({
          content: `hi`
        });
      });

      it(`stamps the marker when files are present`, () => {
        const parsed = v.parse(partialSchema, {
          files: [{ filename: `a.png`, content: new Blob() }]
        });
        expect(shouldSerializeAsMultipart(parsed)).toBe(true);
      });

      it(`does not stamp the marker when files are absent`, () => {
        const parsed = v.parse(partialSchema, { content: `no files` });
        expect(shouldSerializeAsMultipart(parsed)).toBe(false);
      });
    });
  });

  describe(`shouldSerializeAsMultipart`, () => {
    it(`returns false for plain objects without files`, () => {
      expect(shouldSerializeAsMultipart({ a: 1 })).toBe(false);
    });

    it(`returns false for null/undefined`, () => {
      expect(shouldSerializeAsMultipart(null)).toBe(false);
      expect(shouldSerializeAsMultipart(undefined)).toBe(false);
    });

    it(`detects an unvalidated body that contains a FileUpload`, () => {
      // Bypasses the multipart() schema entirely — the value-detection
      // fallback should still trigger multipart serialization.
      expect(
        shouldSerializeAsMultipart({
          file: { filename: `a.png`, content: new Blob() }
        })
      ).toBe(true);
    });
  });
});
