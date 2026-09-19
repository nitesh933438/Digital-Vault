import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./final-responsive.css";
import "./universal-auto-layout.css";
import "./ultimate-responsive.css";
import "./adaptive-device-final.css";
import "./final-stable-layout.css";
import "./route-scroll-stability.css";


if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn("Digital Vault offline shell could not be registered:", error);
      });
  });
}

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>

    <ThemeProvider>

      <AuthProvider>

        <App />

      </AuthProvider>

    </ThemeProvider>

  </React.StrictMode>

);