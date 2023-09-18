import type { Config } from "@jest/types";
import { name } from "./package.json";

const config: Config.InitialOptions = {
  displayName: name,
  coverageDirectory: `./coverage/`,
  collectCoverage: true,
  collectCoverageFrom: [
    // include
    `./src/**/*.ts`,
    `./server/**/*.ts`,
    // exclude
    `!**/__mocks__/**/*`,
    `!**/__test__/**/*`,
    `!**/node_modules/**`,
    `!**/vendor/**`
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      `babel-jest`,
      {
        presets: [`@babel/preset-typescript`, `@babel/preset-env`]
      }
    ]
  },
  setupFilesAfterEnv: [`./jest.setup.ts`],
  testEnvironment: `node`,
  verbose: true
};

export default config;
