import * as v from "valibot";
import { mockUtils } from "#mocks";
import { roleIcon, roleIconSchema } from "../roleIcon.js";

describe(`roleIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        roleIcon(mockUtils.schema(roleIconSchema))
      )
    ).not.toThrow();
  });
});
