import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material/styles";
import App from "./App.jsx";
import "./index.css";
import NotFound from "./components/NotFound.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { RecoilRoot } from "recoil";
import { ClerkProvider, SignedOut, SignedIn, SignIn } from "@clerk/clerk-react";

// Clerk Sign In Keys
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log("Clerk Publishable Key:", PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY is not defined. Please set it in your .env file."
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <RecoilRoot>
          <Router>
            <Routes>
              <Route path="/" element={<App />} />
              <Route
                path="/dashboard"
                element={
                  <>
                    <SignedIn>
                      <Dashboard />
                    </SignedIn>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <SignedOut>
                        <SignIn forceRedirectUrl="/dashboard" />
                      </SignedOut>
                    </div>
                  </>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </RecoilRoot>
      </ClerkProvider>
    </StyledEngineProvider>
  </StrictMode>
);
