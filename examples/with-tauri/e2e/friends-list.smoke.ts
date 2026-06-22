import { test, expect, INTERACTIVE } from "./fixtures.js";

/**
 * Maintainer-run smoke for Friends List Studio — attaches over CDP to an app launched with `vp run start:cdp` (see playwright.config.ts) and drives the connection + friends lifecycle modelled in `src/machine.ts`.
 *
 * Two tiers:
 * - **Always-on** (`vp run smoke`): the bridge wires up and the app boots to a settled state — no Discord auth needed (mirrors the Electron example's smoke).
 * - **Interactive** (`DISCORD_INTERACTIVE=1 vp run smoke`): the full flow matrix — approve, refresh, logout, decline, and Discord-not-running. These can't be automated (the Discord approval prompt / app state needs a human), so each prints the action to take and polls for the result.
 *
 * Re-run after changes to re-verify all the flows without hand-driving each one.
 */

test.describe(`Friends List Studio (live, over CDP)`, () => {
  test(`boots to a settled state (bridge wires up)`, async ({ studio }) => {
    // The status listener seeds the current status on attach, so we should leave
    // `starting…` quickly for a real state — never hang in `initializing`. This
    // alone catches a broken bridge/sidecar or the seed regression.
    await expect
      .poll(async () => studio.status(), { timeout: 30_000 })
      .not.toBe(`starting…`);

    const status = await studio.status();
    expect([`disconnected`, `connecting…`, `ready`]).toContain(status);
  });

  test(`clicking Connect immediately shows a non-flickering busy state`, async ({
    studio
  }) => {
    test.skip(
      (await studio.status()) !== `disconnected`,
      `needs the disconnected state (log out first, or no stored session)`
    );

    await studio.clickConnect();
    // The button must read "Connecting…" the instant it's clicked and stay busy
    // (disabled) — never flicker back to "Connect", which would imply it can be
    // clicked again mid-flow.
    const button = studio.page.getByTestId(`connect-discord`);
    await expect(button).toContainText(`Connecting…`);
    await expect(button).toBeDisabled();
  });

  // --- Interactive flows (need a human + the right Discord state) -------------

  test.describe(`interactive`, () => {
    test.skip(
      !INTERACTIVE,
      `set DISCORD_INTERACTIVE=1 (and be ready to approve/decline prompts) to run`
    );

    test(`happy path: connect → ready → friends load → refresh → logout`, async ({
      studio
    }) => {
      // Start clean if a session lingers from a previous run.
      if ((await studio.status()) === `ready`) {
        await studio.clickLogout();
        await studio.waitForStatus(`disconnected`);
      }

      studio.prompt(
        `APPROVE the Discord authorization prompt (client or browser)`
      );
      if ((await studio.status()) === `disconnected`)
        await studio.clickConnect();
      await studio.waitForStatus(`ready`, 120_000);

      // Friends auto-load on reaching ready (no manual refresh).
      await expect
        .poll(async () => studio.sectionCount(), { timeout: 30_000 })
        .toBeGreaterThan(0);

      // Refresh shows a skeleton, then the sections return.
      await studio.page.getByTestId(`refresh`).click();
      await expect
        .poll(async () => studio.hasSkeleton(), { timeout: 5_000 })
        .toBe(true);
      await expect
        .poll(async () => studio.sectionCount(), { timeout: 30_000 })
        .toBeGreaterThan(0);

      // Logout clears the list back to the connect prompt (no stale friends).
      await studio.clickLogout();
      await studio.waitForStatus(`disconnected`);
      expect(await studio.sectionCount()).toBe(0);
      expect(await studio.listText()).toContain(`Connect your Discord account`);
    });

    test(`decline: cancelling the prompt shows the "cancelled" panel`, async ({
      studio
    }) => {
      if ((await studio.status()) !== `disconnected`) {
        await studio.clickLogout();
        await studio.waitForStatus(`disconnected`);
      }

      studio.prompt(`DECLINE / CANCEL the Discord authorization prompt`);
      await studio.clickConnect();
      // Lands back at disconnected, with the declined error copy.
      await studio.waitForStatus(`disconnected`, 60_000);
      await expect
        .poll(async () => studio.listText(), { timeout: 5_000 })
        .toContain(`Connection cancelled`);
    });

    test(`Discord not running: shows an actionable error`, async ({
      studio
    }) => {
      if ((await studio.status()) !== `disconnected`) {
        await studio.clickLogout();
        await studio.waitForStatus(`disconnected`);
      }

      studio.prompt(
        `QUIT the Discord desktop app entirely (tray → Quit), then DECLINE/close ` +
          `the browser window if one opens`
      );
      await studio.clickConnect();
      await studio.waitForStatus(`disconnected`, 120_000);
      // Either the timeout panel (no response) or the redirect-URI panel — both
      // are the "couldn't connect via the browser fallback" family.
      const text = await studio.listText();
      expect(
        /Couldn't reach Discord|Redirect URI|Connection cancelled/.test(text)
      ).toBe(true);
    });
  });
});
