import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import severityInfo from "../utils/api/severityInfo";

export default function LogAnalyzedBarChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.info.main, // INFO
    (theme.vars || theme).palette.warning.main, // WARNING
    (theme.vars || theme).palette.error.main, // ERROR
    (theme.vars || theme).palette.error.dark, // CRITICAL
  ];

  const [logData, setLogData] = React.useState({
    info: [0, 0, 0, 0, 0, 0, 0],
    warning: [0, 0, 0, 0, 0, 0, 0],
    error: [0, 0, 0, 0, 0, 0, 0],
    critical: [0, 0, 0, 0, 0, 0, 0],
  });
  const [totalLogs, setTotalLogs] = React.useState(0);
  const [percentageChange, setPercentageChange] = React.useState(0);
  const [months, setMonths] = React.useState([]);

  React.useEffect(() => {
    // Get last 7 months
    const getLastSevenMonths = () => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const result = [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();

      for (let i = 6; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        result.push(monthNames[monthIndex]);
      }

      return result;
    };

    setMonths(getLastSevenMonths());

    // Fetch log data from backend
    const fetchLogData = async () => {
      try {
        const response = await severityInfo();
        setLogData(response);

        const total = Object.values(response)
          .flat()
          .reduce((sum, val) => sum + val, 0);
        setTotalLogs(total);

        if (response.percentageChange !== undefined) {
          setPercentageChange(response.percentageChange);
        }
      } catch (error) {
        console.error("Error fetching log data:", error);
      }
    };

    fetchLogData();
  }, []);

  // Format number with K suffix if >= 1000
  const formatNumber = (num) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();
  };

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
              {formatNumber(totalLogs)}
            </Typography>
            <Chip
              size="small"
              color="success"
              label={`+${percentageChange}%`}
            />
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
              data: months,
            },
          ]}
          series={[
            {
              id: "info",
              label: "INFO",
              data: logData.info,
              stack: "A",
            },
            {
              id: "warning",
              label: "WARNING",
              data: logData.warning,
              stack: "A",
            },
            {
              id: "error",
              label: "ERROR",
              data: logData.error,
              stack: "A",
            },
            {
              id: "critical",
              label: "CRITICAL",
              data: logData.critical,
              stack: "A",
            },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: false,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
