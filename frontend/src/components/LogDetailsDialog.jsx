import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  Divider,
  Tooltip,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BugReportIcon from "@mui/icons-material/BugReport";
import { useRecoilState } from "recoil";
import { chatLogState, activeViewState } from "../utils/state";

const SEVERITY_CONFIG = {
  CRITICAL: { color: "error", icon: <BugReportIcon fontSize="small" /> },
  ERROR: { color: "error", icon: <ErrorOutlineIcon fontSize="small" /> },
  WARNING: { color: "warning", icon: <WarningAmberIcon fontSize="small" /> },
  INFO: { color: "info", icon: <InfoOutlinedIcon fontSize="small" /> },
};

const HIDDEN_KEYS = new Set(["id", "_id", "bookmarked", "__v", "ownerId"]);

export default function LogDetailsDialog({ selectedRow, onClose, logMessage }) {
  const theme = useTheme();
  const [, setViewState] = useRecoilState(activeViewState);
  const [, setChatLog] = useRecoilState(chatLogState);
  const [copiedField, setCopiedField] = React.useState(null);

  if (!selectedRow) return null;

  const handleChatClick = () => {
    setChatLog({ id: selectedRow.id, message: logMessage });
    setViewState("chat");
  };

  const copyValue = (key, value) => {
    const text = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) {
      return (
        <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
          —
        </Typography>
      );
    }
    if (typeof value === "object") {
      return (
        <Box
          component="pre"
          sx={{
            bgcolor: "action.hover",
            color: "text.primary",
            p: 1.5,
            borderRadius: 1,
            overflow: "auto",
            maxHeight: 200,
            fontSize: "0.8rem",
            fontFamily: "monospace",
            m: 0,
            border: 1,
            borderColor: "divider",
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Box>
      );
    }
    if (typeof value === "boolean") {
      return (
        <Chip
          label={value ? "Yes" : "No"}
          size="small"
          color={value ? "success" : "default"}
          variant="outlined"
        />
      );
    }
    if (key.toLowerCase().includes("time") || key.toLowerCase().includes("date")) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return (
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              {d.toLocaleString()}
            </Typography>
          );
        }
      } catch {
        /* fall through */
      }
    }
    if (key === "severity") {
      const cfg = SEVERITY_CONFIG[String(value).toUpperCase()] || { color: "default" };
      return (
        <Chip
          icon={cfg.icon}
          label={String(value).toUpperCase()}
          size="small"
          color={cfg.color}
          variant="filled"
        />
      );
    }
    if (key === "analyzed") {
      return (
        <Chip
          label={value ? "Analyzed" : "Not Analyzed"}
          size="small"
          color={value ? "success" : "default"}
          variant="outlined"
        />
      );
    }
    // Long text (messages, rawLine)
    const str = String(value);
    if (str.length > 120) {
      return (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.6,
          }}
        >
          {str}
        </Typography>
      );
    }
    return <Typography variant="body2">{str}</Typography>;
  };

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();

  const entries = Object.entries(selectedRow)
    .filter(([key]) => !HIDDEN_KEYS.has(key))
    .map(([key, value]) => ({
      key,
      value,
      isWide: typeof value === "object" || String(value ?? "").length > 120,
    }));

  const severity = selectedRow.severity?.toUpperCase();
  const severityCfg = SEVERITY_CONFIG[severity];

  return (
    <Dialog
      open={Boolean(selectedRow)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: severityCfg
            ? `${severityCfg.color}.main`
            : "primary.main",
          color: (t) =>
            t.palette.getContrastText(
              severityCfg
                ? t.palette[severityCfg.color].main
                : t.palette.primary.main
            ),
          py: 2,
          px: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {severityCfg?.icon &&
              React.cloneElement(severityCfg.icon, { sx: { fontSize: 20 } })}
            <Typography variant="h6" component="div" fontWeight={600}>
              Log Details
            </Typography>
            {severity && (
              <Chip
                label={severity}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "inherit",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedRow.analyzed === false && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ChatIcon />}
                onClick={handleChatClick}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "inherit",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Analyze with AI
              </Button>
            )}
            <IconButton onClick={onClose} sx={{ color: "inherit" }} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        {/* Message Banner */}
        {logMessage && logMessage !== "No data available" && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "action.hover",
              borderLeft: 4,
              borderLeftColor: severityCfg
                ? `${severityCfg.color}.main`
                : "primary.main",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Message
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.6,
              }}
            >
              {logMessage}
            </Typography>
          </Paper>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Fields Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {entries.map(({ key, value, isWide }) => (
            <Paper
              key={key}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                gridColumn: isWide ? "1 / -1" : "auto",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "primary.main" },
                position: "relative",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.68rem", mb: 0.5 }}
                >
                  {key === "_id" ? "ID" : formatLabel(key)}
                </Typography>
                <Tooltip title={copiedField === key ? "Copied!" : "Copy"}>
                  <IconButton
                    size="small"
                    onClick={() => copyValue(key, value)}
                    sx={{ mt: -0.5, mr: -0.5, opacity: 0.5, "&:hover": { opacity: 1 } }}
                  >
                    {copiedField === key ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
              {formatValue(key, value)}
            </Paper>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
