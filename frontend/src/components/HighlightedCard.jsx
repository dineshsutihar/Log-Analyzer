import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useRecoilState } from "recoil";
import { activeViewState } from "../utils/state";

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [_, setActiveViewState] = useRecoilState(activeViewState);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <InsightsRoundedIcon />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: "600" }}
        >
          Explore your data
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: "8px" }}>
          Uncover performance and usage insights with our data analysis tools.
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
          onClick={() => {
            setActiveViewState("chat");
          }}
        >
          Get insights
        </Button>
      </CardContent>
    </Card>
  );
}
