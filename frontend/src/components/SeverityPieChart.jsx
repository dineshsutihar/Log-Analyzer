import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import severityInfo from "../utils/api/severityInfo";
import { useAuth } from "@clerk/clerk-react";

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: { variant: "primary" },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontSize: theme.typography.body2.fontSize,
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

export default function SeverityPieChart() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const colors = [
    (theme.vars || theme).palette.info.main,
    (theme.vars || theme).palette.warning.main,
    (theme.vars || theme).palette.error.main,
    (theme.vars || theme).palette.error.dark,
  ];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const response = await severityInfo(token);

        const totalInfo = response.info?.reduce((s, v) => s + v, 0) || 0;
        const totalWarning = response.warning?.reduce((s, v) => s + v, 0) || 0;
        const totalError = response.error?.reduce((s, v) => s + v, 0) || 0;
        const totalCritical = response.critical?.reduce((s, v) => s + v, 0) || 0;

        setData([
          { label: "Info", value: totalInfo },
          { label: "Warning", value: totalWarning },
          { label: "Error", value: totalError },
          { label: "Critical", value: totalCritical },
        ]);
      } catch (error) {
        console.error("Error fetching severity data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  const total = data?.reduce((s, d) => s + d.value, 0) || 0;
  const formatTotal = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent>
          <Skeleton variant="text" width="50%" height={24} />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Skeleton variant="circular" width={180} height={180} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Severity Distribution
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <PieChart
            colors={colors}
            margin={{ left: 60, right: 60, top: 60, bottom: 60 }}
            series={[
              {
                data: data || [],
                innerRadius: 60,
                outerRadius: 90,
                paddingAngle: 2,
                highlightScope: { fade: "global", highlight: "item" },
              },
            ]}
            height={240}
            width={240}
            slotProps={{ legend: { hidden: true } }}
          >
            <PieCenterLabel primaryText={formatTotal} secondaryText="Logs" />
          </PieChart>
        </Box>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {(data || []).map((item, i) => (
            <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: colors[i] }} />
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </Stack>
              <Typography variant="caption" fontWeight={600}>
                {total > 0 ? `${Math.round((item.value / total) * 100)}%` : "0%"}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
