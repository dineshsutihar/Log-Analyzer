import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Unknown from "@mui/icons-material/HelpOutline";
import System from "@mui/icons-material/Computer";
import Window from "@mui/icons-material/Window";
import Kernel from "@mui/icons-material/Memory";
import Auth from "@mui/icons-material/LockOpen";
import logtypeStatus from "../utils/api/logtypeStatus";

// const data = [
//   { label: "SYSLOG", value: 50000 },
//   { label: "WINDOWLOG", value: 35000 },
//   { label: "AUTHLOG", value: 10000 },
//   { label: "KERNEL", value: 10000 },
//   { label: "UNKNOWN", value: 5000 },
// ];

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: "primary",
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: "primary",
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

const colors = [
  "hsl(220, 20%, 65%)",
  "hsl(220, 20%, 42%)",
  "hsl(220, 20%, 35%)",
  "hsl(220, 20%, 25%)",
];

export default function LogTypeStatus() {
  const [data, setData] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState("0");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await logtypeStatus();
        setData(response);

        //convert to string with the K notation
        const total = response.reduce((acc, item) => acc + item.value, 0);
        const totalString =
          total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toString();
        setTotalCount(totalString);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const iconMap = {
    SYSLOG: { flag: <System />, color: "hsl(220, 25%, 65%)" },
    WINDOWLOG: { flag: <Window />, color: "hsl(220, 25%, 45%)" },
    AUTHLOG: { flag: <Auth />, color: "hsl(220, 25%, 30%)" },
    KERNEL: { flag: <Kernel />, color: "hsl(220, 25%, 30%)" },
    UNKNOWN: { flag: <Unknown />, color: "hsl(220, 25%, 20%)" },
  };

  const logData = data.map((item) => {
    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
    const defaultIcon = { flag: <Unknown />, color: "hsl(220, 25%, 20%)" };
    const { flag, color } = iconMap[item.label] || defaultIcon;

    return {
      name: item.label,
      value: percentage,
      flag,
      color,
      rawValue: item.value,
    };
  });

  if (loading) return <div>Loading...</div>;
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flexGrow: 1,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Log Type Status
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: { md: "space-evenly" },
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PieChart
              colors={colors}
              margin={{
                left: 80,
                right: 80,
                top: 80,
                bottom: 80,
              }}
              series={[
                {
                  data,
                  innerRadius: 75,
                  outerRadius: 100,
                  paddingAngle: 0,
                  highlightScope: { faded: "global", highlighted: "item" },
                },
              ]}
              height={260}
              width={260}
              slotProps={{
                legend: { hidden: true },
              }}
            >
              <PieCenterLabel primaryText={totalCount} secondaryText="Total" />
            </PieChart>
          </Box>
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            {logData.map((country, index) => (
              <Stack
                key={index}
                direction="row"
                sx={{ alignItems: "center", gap: 2, pb: 2 }}
              >
                {country.flag}
                <Stack sx={{ gap: 1, flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {country.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {country.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    aria-label="Number of users by country"
                    value={country.value}
                    sx={{
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: country.color,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
