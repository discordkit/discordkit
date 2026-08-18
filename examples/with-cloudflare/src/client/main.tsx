import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./styles.css";

const root = document.querySelector(`#root`);
if (!root) throw new Error(`Missing #root element in index.html`);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
