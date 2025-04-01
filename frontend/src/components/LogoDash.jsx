import * as React from "react";
import Divider from "@mui/material/Divider";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import { Box, Stack, Typography } from "@mui/material";

export default function Logo() {
  return (
    <Box>
      <Stack
        direction="row"
        flex={1}
        gap={1}
        alignItems="center"
        justifyContent="left"
      >
        <ConstructionRoundedIcon />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Log Analyzer
        </Typography>
        <Divider flexItem sx={{ mx: 1 }} />
      </Stack>
      <Typography variant="subtitle2" color="text.secondary" marginLeft={1}>
        A simple log analyzer for your application
      </Typography>
    </Box>
  );
}
