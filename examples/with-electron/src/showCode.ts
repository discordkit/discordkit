/** Emit the equivalent `@discordkit/native` call for the current activity — the
 * "Show Code" tab, mirroring the Developer Portal visualizer's code view. Teaches
 * the API by showing exactly what the editor is doing. */
export const showCode = (activity: object): string =>
  `import { setActivity } from "@discordkit/native/presence";\n\n` +
  `await setActivity(${JSON.stringify(activity, null, 2)});`;
