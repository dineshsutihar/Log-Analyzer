import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const features = [
  {
    icon: <StorageIcon color="primary" />,
    title: "Multi-OS Log Parsing",
    description:
      "Parse Windows Event Logs (CSV) and Linux logs (syslog, auth.log, kernel.log) with automatic format detection.",
  },
  {
    icon: <SmartToyIcon color="primary" />,
    title: "AI-Powered Analysis",
    description:
      "Chat with Google Gemini AI about specific log entries for diagnosis, fix steps, and prevention advice.",
  },
  {
    icon: <SecurityIcon color="primary" />,
    title: "Enterprise Security",
    description:
      "Clerk authentication, data isolation by user, rate limiting, NoSQL injection protection, and HTTP security headers.",
  },
  {
    icon: <SpeedIcon color="primary" />,
    title: "Performance Optimized",
    description:
      "Redis caching, MongoDB compound indexes, background job queues, and code-split frontend bundles.",
  },
];

const techStack = [
  "React 18",
  "Vite",
  "Material UI v7",
  "Node.js",
  "Express",
  "TypeScript",
  "MongoDB",
  "Redis",
  "Clerk Auth",
  "Google Gemini AI",
  "Docker",
];

export default function About() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "800px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        About Log Analyzer
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" paragraph>
            Log Analyzer is a full-stack web application for uploading, parsing,
            analyzing, and visualizing system logs from Windows and Linux
            environments. It features AI-powered chat analysis, interactive
            dashboards, and enterprise-grade security.
          </Typography>
          <Link
            href="https://github.com/dineshsutihar/Log-Analyzer"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            <GitHubIcon fontSize="small" />
            View on GitHub
          </Link>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
        Features
      </Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {features.map((feature) => (
          <Card variant="outlined" key={feature.title}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {feature.icon}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
        Tech Stack
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        {techStack.map((tech) => (
          <Chip key={tech} label={tech} size="small" variant="outlined" />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Built with ❤️ by Dinesh Sutihar • MIT License
      </Typography>
    </Box>
  );
}
