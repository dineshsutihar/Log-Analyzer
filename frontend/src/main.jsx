import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material/styles";
import App from "./App.jsx";
import "./index.css";
import Dashboard from "./old/Dashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </StyledEngineProvider>
  </StrictMode>
);
