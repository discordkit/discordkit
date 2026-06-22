# Private SDK binary for CI (real-ABI verification)

> Status: **planned** — to wire up near the end of the `feat/social-sdk-native-bridge` branch when we update the CI workflows. This spec is the prep guide.

## Why this exists

The Discord Social SDK [Terms][terms] permit distributing the binary **only "as integrated into your Application"** (§2.a) and prohibit "redistribute / syndicate access to the Discord Social SDK" (§2.b.ii). So we **cannot** commit it to this public repo, publish it to npm, or host it publicly. But the **real-SDK verification job** (does Koffi load the genuine binary and resolve + call every `Discord_*` symbol our bindings declare, without crashing at the ABI boundary?) needs a real copy.

The solution: keep the maintainer-downloaded binaries in a **separate private repo**, and have CI check it out via a read-only secret — only on runs that have secret access. This is license-clean: it's _our_ private storage accessible only to our licensed CI, not redistribution to third parties.

### What this job does and does NOT verify

A GitHub-hosted runner has **no running Discord client**, so even with the real binary this job verifies **load + symbol resolution + call-without-crash** — i.e. it catches **ABI drift on an SDK version bump** (a renamed/removed symbol, a changed signature). It does **not** verify connected behavior. Full presence/auth E2E needs a real Discord client + a second account and stays **local/maintainer-driven** (same pattern as the OAuth examples). See [`docs/social-sdk-native-api-coverage-plan.md`] and the existing mock-backend unit tests for the layers below this.

## The hard constraint: fork PRs get no secrets

On a **public** repo, PRs from **external forks** run with **no secrets** and a read-only token (a GitHub security boundary). Therefore the real-SDK job is an **enhancement for trusted runs**, never a gate:

- **Runs everywhere (incl. fork PRs), binary-free:** typecheck, build, unit tests (mock backend), and the committable **stub-lib** symbol/ABI check.
- **Runs only where the secret exists** (pushes to org branches, `main`, org-member PRs): the real-binary job, **guarded** so it doesn't even start on fork PRs, plus test-level `skipIf(no binary)` as defense in depth.

If you forget the guard, every external contributor's PR goes red on a missing secret. The guard + `skipIf` are load-bearing, not polish.

## The private repo

Create a **private** repo in the org, e.g. `saeris/discord-social-sdk-binaries`. A free org gets unlimited private repos. Binaries are a few MB, so size is a non-issue.

### Layout — mirror this repo's `vendor/` exactly

Upload each manually-downloaded, versioned SDK **with the same shape `vendor/discord-social-sdk/<version>/` uses here**, so CI can point `DISCORD_SDK_PATH` at a checked-out version root and `@discordkit/native`'s `resolveLibraryPath` finds the per-platform file with **zero special-casing**. The resolver expects, under a version root:

- Windows: `bin/release/discord_partner_sdk.dll` (arm64: `bin/release/arm64/…`)
- macOS: `lib/release/libdiscord_partner_sdk.dylib` (arm64: `lib/release/arm64/…`)
- Linux: `lib/release/libdiscord_partner_sdk.so` (arm64: `lib/release/arm64/…`)

```
discord-social-sdk-binaries/
├── README.md                 # note: private, license terms, how to update
└── discord-social-sdk/
    ├── 1.9.16441/            # one dir per SDK version (match vendor/)
    │   ├── bin/release/…     # Windows .dll (+ arm64/)
    │   ├── lib/release/…     # macOS .dylib + Linux .so (+ arm64/)
    │   └── include/          # cdiscord.h etc. (optional in CI; handy to keep)
    └── <next-version>/…
```

> **To prepare it:** copy the contents of your local `vendor/discord-social-sdk/<version>/` into the private repo under `discord-social-sdk/<version>/`, verbatim. Same directory you already populate from the Developer Portal download. Keep the `include/` headers too — cheap, and useful for regenerating the stub-lib symbol list.

Updating on an SDK bump = drop the new `discord-social-sdk/<new-version>/` dir into the private repo (and bump the version the workflow checks out).

## Access: a fine-grained, read-only PAT

1. Create a **fine-grained Personal Access Token** (or a GitHub App / deploy key) scoped to **only** `saeris/discord-social-sdk-binaries`, permission **Contents: read-only**. Do not use a classic broad-scope token.
2. Add it as a repo (or org) **secret** on `discordkit`, e.g. `SDK_BINARIES_TOKEN`.
3. Pin the SDK version the workflow uses (env var or matrix), so a binaries-repo change can't silently change what CI tests.

## Workflow shape

```yaml
jobs:
  # Runs EVERYWHERE, including fork PRs — no binary, no secret needed.
  unit:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix: { os: [ubuntu-latest, windows-latest, macos-latest] }
    steps:
      - uses: actions/checkout@v4
      - run: vp install
      - run: vp check
      - run: vp test # mock backend + committable stub-lib

  # Real genuine-binary ABI check. Runs ONLY where secrets exist.
  real-sdk:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix: { os: [ubuntu-latest, windows-latest, macos-latest] }
    # Skip entirely on fork PRs (they have no secret) so they don't fail red.
    if: >-
      github.event_name != 'pull_request' ||
      github.event.pull_request.head.repo.full_name == github.repository
    env:
      SDK_VERSION: "1.9.16441"
    steps:
      - uses: actions/checkout@v4
      - name: Fetch private SDK binaries
        uses: actions/checkout@v4
        with:
          repository: saeris/discord-social-sdk-binaries
          token: ${{ secrets.SDK_BINARIES_TOKEN }}
          path: .sdk
      - run: vp install
      - name: Real-SDK ABI check
        env:
          # Point the resolver at the checked-out version root — no special-casing.
          DISCORD_SDK_PATH: .sdk/discord-social-sdk/${{ env.SDK_VERSION }}
        run: vp test --project real-sdk # the skipIf(no binary) real-ABI suite
```

Notes:

- The `if:` guard prevents the job starting on fork PRs; `skipIf(no binary)` inside the suite is the second layer.
- `DISCORD_SDK_PATH` already accepts a version root and derives the per-platform file (see `packages/native/src/resolveLibrary.ts`) — which is the entire reason the private repo mirrors `vendor/`.
- Cross-platform matrix is optional; ABI drift usually shows on any one OS, so a single `ubuntu-latest` real-sdk job is a reasonable start.

## Relationship to the stub-lib

Build the **committable stub-lib first** (a `.dll`/`.dylib`/`.so` we author exporting the `Discord_*` symbols, no real binary). It runs in _public_ CI and catches most symbol/signature bugs fork-safely. The private-binary job tests **nearly the same surface** but against the _genuine_ binary, so its marginal value is **catching real ABI drift on an SDK version bump** — treat it as a later enhancement layered on top of the stub-lib, not a prerequisite.

[terms]: https://support-dev.discord.com/hc/en-us/articles/30225844245271-Discord-Social-SDK-Terms
