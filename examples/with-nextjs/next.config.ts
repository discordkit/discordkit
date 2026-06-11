import type { NextConfig } from "next";
import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

// Varlock validates env against `.env.schema`, redacts @sensitive values, and
// makes `ENV` available at runtime. The plugin wires it into Next; env types
// are generated separately by the `typegen` task.
const withVarlock = varlockNextConfigPlugin();

const config: NextConfig = {
  images: {
    remotePatterns: [{ protocol: `https`, hostname: `cdn.discordapp.com` }]
  }
};

export default withVarlock(config);
