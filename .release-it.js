module.exports = {
  git: {
    commitMessage: "chore: Publish v${version}"
  },
  github: {
    releaseName: "v${version}",
    release: true,
    autoGenerate: true,
    web: true
  },
  plugins: {
    "@release-it/conventional-changelog": {
      infile: "CHANGELOG.md",
      preset: {
        name: "conventionalcommits",
        types: [
          {
            type: "feat",
            section: "Features"
          },
          {
            type: "fix",
            section: "Bug Fixes"
          }
        ]
      }
    }
  }
};
