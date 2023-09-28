import type { Config } from "@jest/types";
import { name } from "./package.json";

export default {
  displayName: name,
  coverageDirectory: `./coverage/`,
  collectCoverage: true,
  collectCoverageFrom: [
    // include
    `./src/**/*.ts`,
    // exclude
    `!**/index.ts`,
    `!**/__fixtures__/**/*`,
    `!**/__mocks__/**/*`,
    `!**/__test__/**/*`,
    `!**/node_modules/**`,
    `!**/vendor/**`
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": `@swc/jest`
  },
  setupFilesAfterEnv: [`./scripts/setup.ts`],
  testEnvironment: `jsdom`,
  verbose: true
} satisfies Config.InitialOptions;
