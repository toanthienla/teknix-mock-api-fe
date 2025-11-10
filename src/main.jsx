// import { StrictMode } from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from "./App.jsx";
import "./styles/index.css";
import "@/styles/themes/theme.css";
import "@/styles/globals.css";
import {ThemeProvider} from "@/services/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ThemeProvider>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </ThemeProvider>
  // </StrictMode>
);
