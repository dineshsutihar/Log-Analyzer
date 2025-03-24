import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "./theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function App(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Hero />
      <div>
        <Features />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
