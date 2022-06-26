// @ts-check

module.exports = {
  // https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md
  rules: {
    "body-leading-blank": [1, "always"],
    "subject-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test"
      ]
    ]
  }
};
