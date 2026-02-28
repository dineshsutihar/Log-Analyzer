import * as React from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import DashNavBar from "./DashNavbar";
import Header from "./Header";
import SideMenu from "./SideMenu";
import AppTheme from "../theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../theme/customizations";
import { useRecoilValue } from "recoil";
import { activeViewState } from "../utils/state";
import ErrorBoundary from "./ErrorBoundary";

// Lazy load views for code splitting
const MainGrid = React.lazy(() => import("./MainGrid"));
const Analytics = React.lazy(() => import("./Analytics"));
const Chat = React.lazy(() => import("./Chat"));
const Upload = React.lazy(() => import("./Upload"));
const About = React.lazy(() => import("./About"));
const SystemHealth = React.lazy(() => import("./SystemHealth"));
const LogInsights = React.lazy(() => import("./LogInsights"));

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const activeView = useRecoilValue(activeViewState);

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <MainGrid />;
      case "health":
        return <SystemHealth />;
      case "insights":
        return <LogInsights />;
      case "analytics":
        return <Analytics />;
      case "chat":
        return <Chat />;
      case "upload":
        return <Upload />;
      case "about":
        return <About />;
      default:
        return <MainGrid />;
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <DashNavBar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <ErrorBoundary>
              <React.Suspense
                fallback={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 300,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                {renderContent()}
              </React.Suspense>
            </ErrorBoundary>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
