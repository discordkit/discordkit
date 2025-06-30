import { faker } from "@faker-js/faker";
import { is, mimeType, parse, pipe } from "valibot";
import { toBlob } from "../toBlob.js";
import { datauri } from "../datauri.js";

describe(`toBlob`, () => {
  it(`transforms a Data URI to a Blob`, { repeats: 5 }, () => {
    const value = faker.image.dataUri();
    const actual = () => parse(pipe(datauri, toBlob), value);

    expect(actual).not.toThrow();
    expect(actual()).toBeInstanceOf(Blob);
    expect(is(pipe(datauri, toBlob, mimeType([`image/svg+xml`])), value)).toBe(
      true
    );
  });
});
