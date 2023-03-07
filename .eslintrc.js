// @ts-check

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    `@saeris/eslint-config/base`,
    `@saeris/eslint-config/jest`,
    `@saeris/eslint-config/type-aware`,
    `@saeris/eslint-config/typescript`
  ],
  rules: {
    "import/no-named-as-default": `off`,
    "import/no-cycle": `off`,
    "import/no-unused-modules": `off`,
    "import/no-deprecated": `off`
  },
  ignorePatterns: [`*.js`],
  overrides: [
    {
      // Nextjs uses Default Exports as a convention in the pages directory
      files: [`src/pages/**/*{j,t}s?(x)`],
      rules: {
        "import/no-default-export": "off",
        "import/no-anonymous-default-export": "off"
      }
    },
    {
      // We can safely log from tests and our server
      files: [`server/**/*{j,t}s`, `**/*.spec.{j,t}s?(x)`],
      rules: {
        "no-console": "off"
      }
    }
  ]
};
