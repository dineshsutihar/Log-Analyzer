import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material/styles";
import App from "./App.jsx";
import "./index.css";
import NotFound from "./components/NotFound.jsx";

function Dashboard() {
  return <h2>Dashboard</h2>;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </StyledEngineProvider>
  </StrictMode>
);
