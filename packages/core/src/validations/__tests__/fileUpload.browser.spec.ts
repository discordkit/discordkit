import { describe, it, expect } from "vite-plus/test";
import { toMultipartBody, type FileUpload } from "../fileUpload.js";
import { toSnakeKeys } from "../../utils/toSnakeKeys.js";

/**
 * The client runs in a browser as well as on a server, and Discord takes an attachment's name and media type from its multipart part, not from `payload_json`. The Node spec can only inspect the `FormData` object; this one serializes it with the browser's own encoder, the way `fetch` does, and reads what would actually go over the wire.
 */
describe(`toMultipartBody in a browser`, () => {
  it(`sends the filename and content type Discord reads from the file part`, async () => {
    const file: FileUpload = {
      filename: `a.png`,
      content: new Blob([new Uint8Array([0xff])], { type: `image/png` })
    };
    const form = toMultipartBody(
      { content: `hello`, files: [file] },
      toSnakeKeys
    );

    const wire = await new Response(form).text();

    expect(wire).toContain(`name="files[0]"; filename="a.png"`);
    expect(wire).toContain(`Content-Type: image/png`);
  });
});
