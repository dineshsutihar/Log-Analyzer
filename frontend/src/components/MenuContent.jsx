import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import Chat from "@mui/icons-material/Chat";
import CloudUpload from "@mui/icons-material/CloudUpload";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon /> },
  { text: "Health", icon: <MonitorHeartIcon /> },
  { text: "Insights", icon: <TroubleshootIcon /> },
  { text: "Analytics", icon: <AnalyticsRoundedIcon /> },
  { text: "Chat", icon: <Chat /> },
  { text: "Upload", icon: <CloudUpload /> },
];

const secondaryListItems = [
  { text: "About", icon: <InfoRoundedIcon />, view: "about" },
];

export default function MenuContent() {
  const [activeView, setActiveView] = useRecoilState(activeViewState);
  const mainActiveIndex = mainListItems.findIndex(
    (item) => item.text.toLowerCase() === activeView
  );
  const secondaryActiveView = secondaryListItems.find(
    (item) => item.view === activeView
  );

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={mainActiveIndex === index && !secondaryActiveView}
              onClick={() => {
                setActiveView(item.text.toLowerCase());
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={activeView === item.view}
              onClick={() => {
                setActiveView(item.view);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
