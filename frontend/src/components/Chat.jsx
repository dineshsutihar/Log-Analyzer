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
  Badge,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRecoilState } from "recoil";
import { chatLogState } from "../utils/state";
import chatApi, { chatSystemApi, chatQueryApi } from "../utils/api/chatApi";
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

const QUERY_SUGGESTIONS = [
  "Show me all authentication failures",
  "Find errors from today",
  "What happened with disk space?",
  "Any timeout or connection errors?",
  "Show critical events this week",
  "Find logs about memory usage",
];

export default function Chat() {
  const theme = useTheme();
  const [chatLog, setChatLog] = useRecoilState(chatLogState);
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);

  // Three modes: "system" | "query" | "log"
  const [mode, setMode] = useState(chatLog ? "log" : "system");
  const [chatHistory, setChatHistory] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserText, setLastUserText] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Chat key per mode for separate histories
  const chatKey = useMemo(() => {
    if (mode === "log" && chatLog) return `log-${chatLog.id}`;
    if (mode === "query") return "query";
    return "system";
  }, [mode, chatLog]);

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

  // When a log is selected from DataGrid, auto-switch to log mode
  useEffect(() => {
    if (chatLog) {
      setMode("log");
    }
  }, [chatLog]);

  const handleModeChange = (_, val) => {
    if (val) setMode(val);
  };

  const handleClearLogContext = () => {
    setChatLog(null);
    setMode("system");
  };

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
      } else if (mode === "query") {
        response = await chatQueryApi(text, token);
      } else {
        response = await chatApi(
          { logId: chatLog?.id, userText: text },
          token
        );
      }

      const botText = response.response || "No response";
      const extra =
        mode === "query" && response.matchCount !== undefined
          ? `\n\n---\n*Found ${response.matchCount} matching log(s)*`
          : "";

      const botMsg = {
        id: Date.now() + 1,
        text: botText + extra,
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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
  };

  const getModeDescription = () => {
    switch (mode) {
      case "system":
        return "Ask about overall system health, trends, and recommendations";
      case "query":
        return "Search through your logs — ask about specific events, errors, or services";
      case "log":
        return chatLog
          ? "Analyzing a specific log entry"
          : "Select a log from Analytics to use this mode";
      default:
        return "";
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case "system":
        return "Ask about system health, error trends, recommendations...";
      case "query":
        return 'Search your logs — e.g. "show me authentication failures today"';
      case "log":
        return "Ask about this specific log entry...";
      default:
        return "Type a message...";
    }
  };

  const getSuggestions = () => {
    if (mode === "system") return SYSTEM_SUGGESTIONS;
    if (mode === "query") return QUERY_SUGGESTIONS;
    return [];
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
          onChange={handleModeChange}
          size="small"
        >
          <ToggleButton value="system">
            <MonitorHeartIcon sx={{ mr: 0.5 }} fontSize="small" />
            System
          </ToggleButton>
          <ToggleButton value="query">
            <SearchIcon sx={{ mr: 0.5 }} fontSize="small" />
            Ask Logs
          </ToggleButton>
          <ToggleButton value="log" disabled={!chatLog}>
            <Badge
              color="primary"
              variant="dot"
              invisible={!chatLog}
              sx={{ mr: 0.5 }}
            >
              <DescriptionIcon fontSize="small" />
            </Badge>
            <Box component="span" sx={{ ml: 0.5 }}>
              Log Detail
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ alignSelf: "center" }}
        >
          {getModeDescription()}
        </Typography>
      </Stack>

      {/* Log Context Banner (when in log mode) */}
      {mode === "log" && chatLog && (
        <Alert
          severity="info"
          icon={<DescriptionIcon />}
          action={
            <Tooltip title="Clear log context">
              <IconButton size="small" onClick={handleClearLogContext}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 1 }}
        >
          <Typography variant="caption" noWrap>
            Analyzing: <strong>{chatLog.message}</strong>
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
        {messages.length === 0 && (mode === "system" || mode === "query") && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            {mode === "system" ? (
              <SmartToyIcon
                sx={{
                  fontSize: 48,
                  color: "primary.main",
                  mb: 1,
                  opacity: 0.7,
                }}
              />
            ) : (
              <SearchIcon
                sx={{
                  fontSize: 48,
                  color: "primary.main",
                  mb: 1,
                  opacity: 0.7,
                }}
              />
            )}
            <Typography variant="h6" gutterBottom>
              {mode === "system"
                ? "Ask About Your System"
                : "Search Your Logs"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 440, mx: "auto" }}
            >
              {mode === "system"
                ? "I have context of all your uploaded logs. Ask me about system health, errors, patterns, or get recommendations."
                : "I'll search through your log entries to find what you need. Ask about specific events, errors, services, or time periods."}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              useFlexGap
            >
              {getSuggestions().map((suggestion) => (
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
              sx={{
                fontSize: 48,
                color: "primary.main",
                mb: 1,
                opacity: 0.7,
              }}
            />
            <Typography variant="h6" gutterBottom>
              Analyze This Log
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 400, mx: "auto" }}
            >
              Ask questions about this specific log entry. I&apos;ll help
              diagnose issues, suggest fixes, and explain what happened.
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
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
                  <Tooltip
                    title={copiedId === message.id ? "Copied!" : "Copy"}
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        copyToClipboard(message.text, message.id)
                      }
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
          placeholder={getPlaceholder()}
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
