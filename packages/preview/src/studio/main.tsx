import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// The preview draws with the bundled Noto Sans, as the Node renderer does when no gg sans is given, so Studio shows what `render` writes.
import "@fontsource-variable/noto-sans/wght.css";
import "@fontsource-variable/noto-sans/wght-italic.css";
import "./global.css";
import { bridgeBackend, hasBridge } from "./backend/bridgeBackend.js";
import { draftBackend } from "./backend/draftBackend.js";
import { Studio } from "./Studio.js";

// Served by `discordkit-preview studio` with a file, the page carries the bridge's marker; opened any other way, Studio keeps a draft in the browser.
const backend = hasBridge() ? bridgeBackend() : draftBackend();

const root = document.getElementById(`root`);
if (root === null) {
  throw new Error(
    `Studio could not start, because its page has no element with the id "root" to draw into. The page is damaged; rebuild the package or reinstall it.`
  );
}
createRoot(root).render(
  <StrictMode>
    <Studio backend={backend} />
  </StrictMode>
);
