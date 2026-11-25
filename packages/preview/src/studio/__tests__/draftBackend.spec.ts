import { describe, expect, it } from "vite-plus/test";
import {
  draftBackend,
  draftKey,
  starterDraft
} from "../backend/draftBackend.js";

/**
 * Opened without a file, Studio keeps a draft in the browser's storage. Storage can be missing, blocked or full (a private window, cleared site data), and the editor must keep working then: the draft lives as long as the page, and the person is told it will not outlive it.
 */

const memoryStorage = (): Storage => {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => items.delete(key),
    setItem: (key, value) => items.set(key, value)
  };
};

const blocked = (): Storage => {
  throw new Error(`The operation is insecure.`);
};

describe(`the draft backend`, () => {
  it(`starts a new draft from a starter message, and keeps saves in storage`, async () => {
    const storage = memoryStorage();
    const backend = draftBackend(() => storage);
    const first = await backend.load();
    expect(first).toMatchObject({ exists: true, text: starterDraft });
    if (!first.exists) throw new Error(`The draft should exist.`);
    const result = await backend.save(`{"content":"Mine"}`, first.version);
    expect(result.saved).toBe(true);
    expect(storage.getItem(draftKey)).toBe(`{"content":"Mine"}`);
    await expect(draftBackend(() => storage).load()).resolves.toMatchObject({
      text: `{"content":"Mine"}`
    });
  });

  it(`keeps working when storage is unavailable, and says the draft will not outlive the page`, async () => {
    const backend = draftBackend(blocked);
    const first = await backend.load();
    if (!first.exists) throw new Error(`The draft should exist.`);
    const result = await backend.save(`{"content":"Mine"}`, first.version);
    expect(result.saved).toBe(true);
    await expect(backend.load()).resolves.toMatchObject({
      text: `{"content":"Mine"}`
    });
    expect(backend.storageProblem?.()).toMatch(
      /lost when the page closes.*Export/
    );
  });
});
