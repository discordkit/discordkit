import type { NextConfig } from "next";
import * as v from "valibot";
import { envSchema } from "./src/env";

const { issues } = v.safeParse(envSchema, process.env);

if (issues) {
  throw new Error(v.summarize(issues));
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends v.InferOutput<typeof envSchema> {}
  }
}

const config: NextConfig = {
  images: {
    domains: [`cdn.discordapp.com`]
  }
};

export default config;
