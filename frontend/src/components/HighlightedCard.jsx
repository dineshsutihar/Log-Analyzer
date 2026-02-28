import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [, setActiveViewState] = useRecoilState(activeViewState);

  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "primary.contrastText",
      }}
    >
      <CardContent>
        <InsightsRoundedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: "600", color: "inherit" }}
        >
          Quick Actions
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "inherit", opacity: 0.85, display: "block", mb: 2 }}
        >
          Monitor health, detect patterns, or upload new logs
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="contained"
            size="small"
            endIcon={<ChevronRightRoundedIcon />}
            fullWidth={isSmallScreen}
            onClick={() => setActiveViewState("health")}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "inherit",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            <MonitorHeartIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Health Score
          </Button>
          <Button
            variant="contained"
            size="small"
            endIcon={<ChevronRightRoundedIcon />}
            fullWidth={isSmallScreen}
            onClick={() => setActiveViewState("insights")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "inherit",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            AI Insights
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadIcon />}
            fullWidth={isSmallScreen}
            onClick={() => setActiveViewState("upload")}
            sx={{
              borderColor: "rgba(255,255,255,0.4)",
              color: "inherit",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.6)",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Upload Logs
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
