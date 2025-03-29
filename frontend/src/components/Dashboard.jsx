import * as React from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import DashNavBar from "./DashNavbar";
import Header from "./Header";
import MainGrid from "./MainGrid";
import SideMenu from "./SideMenu";
import AppTheme from "../theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../theme/customizations";
import Chat from "./Chat";
import Analytics from "./Analytics";
import { useRecoilValue } from "recoil";
import { activeViewState } from "../utils/state";
import Upload from "./Upload";

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
      case "analytics":
        return <Analytics />;
      case "chat":
        return <Chat />;
      case "upload":
        return <Upload />;
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
            {renderContent()}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
