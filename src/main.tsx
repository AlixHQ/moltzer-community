import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QuickInput } from "./components/QuickInput";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Simple path-based routing for different windows
const path = window.location.pathname;
const isQuickInput = path === "/quickinput" || path.includes("quickinput");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>{isQuickInput ? <QuickInput /> : <App />}</ErrorBoundary>
  </React.StrictMode>,
);
