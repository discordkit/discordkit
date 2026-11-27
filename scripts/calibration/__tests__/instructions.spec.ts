import { readFileSync } from "node:fs";
import { describe, it, expect } from "vite-plus/test";
import { captureSet, manualSteps, totalScreenshots } from "../captureSet.ts";
import {
  botPermissions,
  instructionsPath,
  renderInstructions
} from "../instructions.ts";

describe(`the instructions for the person taking screenshots`, () => {
  it(`are exactly what the capture set produces, so they cannot drift from what is posted`, () => {
    // If this fails, run `vp run calibration:instructions` and commit CAPTURE.md.
    expect(readFileSync(instructionsPath, `utf8`)).toBe(renderInstructions());
  });

  it(`list every fixture and every step only the person can do, with the screenshot counts`, () => {
    const text = renderInstructions();
    for (const fixture of captureSet)
      expect(text).toContain(`**${fixture.code}** ${fixture.title}`);
    for (const step of manualSteps)
      expect(text).toContain(`**${step.title}.**`);
  });

  it(`lead with the essential tier as the whole job, with its counts, before the optional tiers`, () => {
    const text = renderInstructions();
    const desktop = String(totalScreenshots(`desktop`, `essential`));
    const ios = String(totalScreenshots(`ios`, `essential`));
    expect(text).toContain(
      `then ${desktop} screenshots on your computer and ${ios} on your phone.**`
    );
    expect(
      text.indexOf(`On your computer: ${desktop} screenshots`)
    ).toBeLessThan(text.indexOf(`## Optional follow-ups`));
    expect(text).toContain(
      `screenshots on your computer, ${String(totalScreenshots(`ios`, `extended`))} on your phone`
    );
    expect(text).toContain(`--tier extended`);
    expect(text).toContain(`--tier markdown`);
  });

  it(`invite the bot with only the permissions posting needs`, () => {
    // View Channels, Send Messages, Embed Links, Attach Files, Read Message History.
    expect(botPermissions).toBe(1024 + 2048 + 16_384 + 32_768 + 65_536);
  });
});
