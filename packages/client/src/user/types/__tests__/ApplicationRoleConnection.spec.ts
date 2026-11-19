import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { applicationRoleConnectionSchema } from "../ApplicationRoleConnection.js";

describe(`applicationRoleConnectionSchema`, () => {
  it(`parses a role connection that has nothing set yet`, () => {
    // Every field is optional in Discord's structure, and a user who has authorized the app but has no data stored comes back as an empty object.
    expect(v.safeParse(applicationRoleConnectionSchema, {}).success).toBe(true);
  });
});
