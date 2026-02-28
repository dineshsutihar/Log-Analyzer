import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "../utils/state";
import chatApi, { chatSystemApi } from "../utils/api/chatApi";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "@clerk/clerk-react";

const SYSTEM_SUGGESTIONS = [
  "What's the overall health of my system?",
  "What are the most critical issues right now?",
  "Summarize the errors from the last 24 hours",
  "What patterns do you see in my logs?",
  "How can I reduce the error rate?",
  "Are there any recurring issues I should fix?",
];

export default function Chat() {
  const theme = useTheme();
  const user = useRecoilValue(userState);
  const { getToken } = useAuth();
  const logId = user.id;
  const logMessage = user.logMessage || "";
  const messagesEndRef = useRef(null);

  // Two modes: "log" (single log context) or "system" (system-wide)
  const [mode, setMode] = useState(logMessage ? "log" : "system");
  const [chatHistory, setChatHistory] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserText, setLastUserText] = useState("");

  // Use different chat key per mode
  const chatKey = mode === "log" ? `log-${logId}` : "system";
  const messages = useMemo(
    () => chatHistory[chatKey] || [],
    [chatHistory, chatKey]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When user navigates from a log detail, auto-switch to log mode
  useEffect(() => {
    if (logMessage && logId) {
      setMode("log");
    }
  }, [logMessage, logId]);

  const handleSend = async (regenerateText = null) => {
    const text = (regenerateText || newMessage).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    if (!regenerateText) {
      setNewMessage("");
      setLastUserText(text);
    }

    setChatHistory((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), userMsg],
    }));

    setIsLoading(true);

    try {
      const token = await getToken();
      let response;

      if (mode === "system") {
        response = await chatSystemApi(text, token);
      } else {
        response = await chatApi({ logId, userText: text }, token);
      }

      const botMsg = {
        id: Date.now() + 1,
        text: response.response || "No response",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatHistory((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), botMsg],
      }));
    } catch {
      setChatHistory((prev) => ({
        ...prev,
        [chatKey]: [
          ...(prev[chatKey] || []),
          {
            id: Date.now() + 1,
            text: "❌ Error fetching response. Please try again.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      }));
    }

    setIsLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
  };

  return (
    <Stack sx={{ p: 2, height: "100%", width: "100%" }}>
      {/* Mode Selector */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, val) => val && setMode(val)}
          size="small"
        >
          <ToggleButton value="system">
            <MonitorHeartIcon sx={{ mr: 0.5 }} fontSize="small" />
            System Analysis
          </ToggleButton>
          <ToggleButton value="log" disabled={!logMessage}>
            <DescriptionIcon sx={{ mr: 0.5 }} fontSize="small" />
            Log Analysis
          </ToggleButton>
        </ToggleButtonGroup>

        {mode === "system" && (
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
            Ask anything about your system — AI has full context of your logs
          </Typography>
        )}
      </Stack>

      {/* Log Context Banner (when in log mode) */}
      {mode === "log" && logMessage && (
        <Alert severity="info" icon={<DescriptionIcon />} sx={{ mb: 1 }}>
          <Typography variant="caption" noWrap>
            Analyzing: <strong>{logMessage}</strong>
          </Typography>
        </Alert>
      )}

      {/* Chat Messages */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.background.default,
        }}
      >
        {/* Empty state with suggestions */}
        {messages.length === 0 && mode === "system" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SmartToyIcon
              sx={{ fontSize: 48, color: "primary.main", mb: 1, opacity: 0.7 }}
            />
            <Typography variant="h6" gutterBottom>
              Ask About Your System
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
            >
              I have context of all your uploaded logs. Ask me about system health,
              errors, patterns, or get recommendations.
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              useFlexGap
            >
              {SYSTEM_SUGGESTIONS.map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  variant="outlined"
                  clickable
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {messages.length === 0 && mode === "log" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <DescriptionIcon
              sx={{ fontSize: 48, color: "primary.main", mb: 1, opacity: 0.7 }}
            />
            <Typography variant="h6" gutterBottom>
              Analyze This Log
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
              Ask questions about this specific log entry. I&apos;ll help diagnose issues,
              suggest fixes, and explain what happened.
            </Typography>
          </Box>
        )}

        {messages.map((message, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 2,
                maxWidth: "75%",
                bgcolor:
                  message.sender === "user"
                    ? theme.palette.primary.main
                    : theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : theme.palette.grey[100],
                color:
                  message.sender === "user"
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <ReactMarkdown
                children={message.text}
                components={{
                  p: ({ ...props }) => (
                    <Typography
                      variant="body1"
                      {...props}
                      sx={{ wordBreak: "break-word", mb: 1 }}
                    />
                  ),
                  code: ({ inline, children, ...props }) =>
                    inline ? (
                      <Box
                        component="code"
                        sx={{
                          backgroundColor: theme.palette.grey[800],
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                        }}
                        {...props}
                      >
                        {children}
                      </Box>
                    ) : (
                      <SyntaxHighlighter
                        language="javascript"
                        style={materialDark}
                        PreTag="div"
                        customStyle={{
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          padding: "1rem",
                          marginTop: "8px",
                        }}
                        {...props}
                      >
                        {String(children).trim()}
                      </SyntaxHighlighter>
                    ),
                }}
              />
              <Typography
                variant="caption"
                sx={{ display: "block", textAlign: "right", mt: 1 }}
              >
                {message.timestamp}
              </Typography>

              {message.sender === "bot" && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Tooltip title="Copy">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(message.text)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Regenerate">
                    <IconButton
                      size="small"
                      onClick={() => handleSend(lastUserText)}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Paper>
          </Box>
        ))}

        {isLoading && (
          <Box display="flex" justifyContent="flex-start" mt={1}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input */}
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={
            mode === "system"
              ? "Ask about your system health, errors, patterns..."
              : "Ask about this log entry..."
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <IconButton
          color="primary"
          onClick={() => handleSend()}
          disabled={isLoading || !newMessage.trim()}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "action.disabledBackground" },
            borderRadius: 2,
          }}
        >
          <SendIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
