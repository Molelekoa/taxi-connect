import { createRoot } from "react-dom/client";
import { validateEnv } from "./lib/validateEnv";
import App from "./App.tsx";
import "./index.css";

// Fail fast if required env vars are missing
validateEnv();

createRoot(document.getElementById("root")!).render(<App />);
