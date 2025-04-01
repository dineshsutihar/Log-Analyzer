import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";

export default function PageViewsBarChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];
  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Analyzed Logs
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              12K
            </Typography>
            <Chip size="small" color="success" label="+20%" />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Logs analyzed in the last 30 days
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "band",
              categoryGapRatio: 0.5,
              data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            },
          ]}
          series={[
            {
              id: "windows",
              label: "Windows Log",
              data: [3250, 4720, 2890, 3610, 5240, 4180, 3960],
              stack: "A",
            },
            {
              id: "linux",
              label: "Linux Log",
              data: [2140, 3680, 4210, 3570, 2980, 4520, 3790],
              stack: "A",
            },
            {
              id: "errors",
              label: "Errors",
              data: [780, 1240, 950, 1460, 1120, 860, 1320],
              stack: "A",
            },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
