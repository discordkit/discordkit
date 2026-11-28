import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type {
  FileSnapshot,
  RenderRequest,
  RenderStatus,
  SaveResult
} from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * The PNG export in the app. The renderer runs in the studio command, not the browser, so what a person relies on is being told plainly when it cannot run (a draft in the browser, a machine with no browser to drive), and, when it can, getting the file as saved, drawn for the viewports they are looking at.
 */

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const text = json({ messages: [{ payload: { content: `Hello` } }] });

/** A one-pixel PNG's header: width 1, height 1. */
const onePixel = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44,
  0x52, 0, 0, 2, 0, 0, 0, 1, 0x2c
]);

const backendFor = (
  extra: Partial<Backend>
): { backend: Backend; requests: RenderRequest[] } => {
  const requests: RenderRequest[] = [];
  const snapshot: FileSnapshot = {
    exists: true,
    name: `card.json`,
    path: `/work/card.json`,
    version: `v1`,
    text
  };
  return {
    requests,
    backend: {
      kind: `file`,
      load: async () => {
        await Promise.resolve();
        return snapshot;
      },
      save: async (): Promise<SaveResult> => {
        await Promise.resolve();
        return { saved: true, version: `v2` };
      },
      subscribe: () => () => undefined,
      attachmentUrl: () => null,
      ...extra,
      ...(extra.renderPng === undefined
        ? {}
        : {
            renderPng: async (request) => {
              requests.push(request);
              return extra.renderPng?.(request) ?? new Blob();
            }
          })
    }
  };
};

const mount = (backend: Backend): void => {
  const host = document.createElement(`div`);
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  flushSync(() => root.render(<Studio backend={backend} />));
};

const available: () => Promise<RenderStatus> = async () => {
  await Promise.resolve();
  return { available: true };
};

describe(`the PNG export`, () => {
  it(`draws the saved file for the viewports on screen, and offers the image to save`, async () => {
    const { backend, requests } = backendFor({
      renderStatus: available,
      renderPng: async () => {
        await Promise.resolve();
        return new Blob([onePixel], { type: `image/png` });
      }
    });
    mount(backend);
    await userEvent.click(page.getByRole(`button`, { name: `Export PNG` }));
    await userEvent.click(page.getByRole(`button`, { name: `Draw the PNG` }));
    await expect
      .element(page.getByRole(`link`, { name: `Save card.png` }))
      .toBeVisible();
    await expect
      .element(page.getByText(/Drawn: 512 × 300 pixels/))
      .toBeVisible();
    // The file names no viewports, so the ones Studio shows are sent as the command line's --device would be.
    expect(requests).toStrictEqual([
      {
        baseVersion: `v1`,
        viewports: [{ device: `desktop-1280x800` }, { device: `iphone-14-pro` }]
      }
    ]);
  });

  it(`says why the machine cannot draw, before anyone presses a button that would fail`, async () => {
    mount(
      backendFor({
        renderStatus: async () => {
          await Promise.resolve();
          return {
            available: false,
            reason: `This machine cannot draw a PNG yet: Playwright's Chromium has not been downloaded.`
          };
        },
        renderPng: async () => {
          await Promise.resolve();
          return new Blob();
        }
      }).backend
    );
    await userEvent.click(page.getByRole(`button`, { name: `Export PNG` }));
    await vi.waitFor(() =>
      expect(page.getByRole(`alert`).element().textContent).toMatch(
        /Chromium has not been downloaded/
      )
    );
    await expect
      .element(page.getByRole(`button`, { name: `Draw the PNG` }))
      .toBeDisabled();
  });

  it(`says a draft in the browser cannot draw a PNG, and how to get one`, async () => {
    mount(backendFor({}).backend);
    await userEvent.click(page.getByRole(`button`, { name: `Export PNG` }));
    await vi.waitFor(() =>
      expect(page.getByRole(`alert`).element().textContent).toMatch(
        /needs the studio command/
      )
    );
    await expect
      .element(page.getByRole(`button`, { name: `Draw the PNG` }))
      .toBeDisabled();
  });

  it(`shows the renderer's reason when a drawing fails`, async () => {
    mount(
      backendFor({
        renderStatus: available,
        renderPng: async () => {
          await Promise.resolve();
          throw new Error(
            `The scene was not drawn: it holds a modal component.`
          );
        }
      }).backend
    );
    await userEvent.click(page.getByRole(`button`, { name: `Export PNG` }));
    await userEvent.click(page.getByRole(`button`, { name: `Draw the PNG` }));
    await expect
      .element(page.getByText(/it holds a modal component/))
      .toBeVisible();
  });
});
