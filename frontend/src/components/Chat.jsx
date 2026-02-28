import {
  Box,
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
  Avatar,
  InputAdornment,
  Fade,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
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
  const inputRef = useRef(null);

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
    inputRef.current?.focus();
  };

  const getSuggestions = () => {
    if (mode === "system") return SYSTEM_SUGGESTIONS;
    if (mode === "query") return QUERY_SUGGESTIONS;
    return [];
  };

  const getModeIcon = () => {
    if (mode === "system") return <MonitorHeartIcon sx={{ fontSize: 48, mb: 1 }} />;
    if (mode === "query") return <SearchIcon sx={{ fontSize: 48, mb: 1 }} />;
    return <DescriptionIcon sx={{ fontSize: 48, mb: 1 }} />;
  };

  const getModeTitle = () => {
    if (mode === "system") return "System Intelligence";
    if (mode === "query") return "Search Your Logs";
    return "Log Analysis";
  };

  const getModeSubtitle = () => {
    if (mode === "system") return "I have context of all your uploaded logs. Ask me about system health, error patterns, or get recommendations.";
    if (mode === "query") return "Search through your log entries. Ask about specific events, errors, or services.";
    return chatLog ? "Ask questions about this specific log entry." : "Select a log from Analytics to use this mode.";
  };

  const getPlaceholder = () => {
    switch (mode) {
      case "system":
        return "Ask about system health, error trends, recommendations...";
      case "query":
        return "Search your logs \u2014 e.g. \"show me authentication failures today\"";
      case "log":
        return "Ask about this specific log entry...";
      default:
        return "Type a message...";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: 960,
        mx: "auto",
        overflow: "hidden",
      }}
    >
      {/* Mode Selector Header */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                gap: 0.5,
                borderRadius: "20px !important",
                border: "none",
                mx: 0.3,
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: 600,
                },
              },
            }}
          >
            <ToggleButton value="system">
              <MonitorHeartIcon fontSize="small" />
              System
            </ToggleButton>
            <ToggleButton value="query">
              <SearchIcon fontSize="small" />
              Ask Logs
            </ToggleButton>
            <ToggleButton value="log" disabled={!chatLog}>
              <Badge color="primary" variant="dot" invisible={!chatLog}>
                <DescriptionIcon fontSize="small" />
              </Badge>
              Log Detail
            </ToggleButton>
          </ToggleButtonGroup>
          {mode === "log" && chatLog && (
            <Tooltip title="Clear log context">
              <IconButton size="small" onClick={handleClearLogContext}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {mode === "log" && chatLog && (
          <Alert severity="info" icon={<DescriptionIcon fontSize="small" />} sx={{ mt: 1, py: 0, "& .MuiAlert-message": { overflow: "hidden" } }}>
            <Typography variant="caption" noWrap>Analyzing: <strong>{chatLog.message}</strong></Typography>
          </Alert>
        )}
      </Paper>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Empty state */}
        {messages.length === 0 && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", px: 3, opacity: 0.85 }}>
            <Box sx={{ color: "primary.main", opacity: 0.6 }}>{getModeIcon()}</Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>{getModeTitle()}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480 }}>{getModeSubtitle()}</Typography>
            {getSuggestions().length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", maxWidth: 560 }}>
                {getSuggestions().map((s) => (
                  <Chip key={s} label={s} variant="outlined" clickable onClick={() => handleSuggestionClick(s)}
                    sx={{ borderRadius: "16px", fontSize: "0.8rem", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08), borderColor: "primary.main" } }} />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <Fade key={message.id} in timeout={300}>
              <Box sx={{ display: "flex", gap: 1.5, flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", maxWidth: 820, mx: "auto", width: "100%", px: { xs: 1, sm: 2 } }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: isUser ? "primary.main" : alpha(theme.palette.primary.main, 0.12), color: isUser ? "primary.contrastText" : "primary.main", flexShrink: 0, mt: 0.5 }}>
                  {isUser ? <PersonIcon sx={{ fontSize: 18 }} /> : <AutoAwesomeIcon sx={{ fontSize: 18 }} />}
                </Avatar>
                <Box sx={{ maxWidth: "80%", minWidth: 0 }}>
                  <Paper elevation={0} sx={{
                    p: 2,
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    bgcolor: isUser ? "primary.main" : (theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.05)),
                    color: isUser ? "primary.contrastText" : "text.primary",
                    border: isUser ? "none" : 1,
                    borderColor: "divider",
                  }}>
                    {isUser ? (
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.text}</Typography>
                    ) : (
                      <Box sx={{
                        "& p": { m: 0, mb: 1, "&:last-child": { mb: 0 } },
                        "& ul, & ol": { mt: 0.5, mb: 1, pl: 2.5 },
                        "& li": { mb: 0.3 },
                        "& h1,& h2,& h3,& h4,& h5,& h6": { mt: 1.5, mb: 0.5, "&:first-of-type": { mt: 0 } },
                        "& hr": { my: 1.5, borderColor: "divider" },
                        "& strong": { fontWeight: 700 },
                        "& a": { color: "primary.main" },
                      }}>
                        <ReactMarkdown
                          components={{
                            p: ({ ...props }) => <Typography variant="body2" {...props} sx={{ lineHeight: 1.7, wordBreak: "break-word" }} />,
                            code: ({ inline, children, className, ...props }) => {
                              const lang = (className || "").replace("language-", "");
                              return inline ? (
                                <Box component="code" sx={{ bgcolor: "action.selected", px: 0.8, py: 0.2, borderRadius: 0.5, fontFamily: "monospace", fontSize: "0.82rem" }} {...props}>{children}</Box>
                              ) : (
                                <SyntaxHighlighter language={lang || "text"} style={materialDark} PreTag="div" customStyle={{ borderRadius: "8px", fontSize: "0.85rem", padding: "1rem", margin: "8px 0" }} {...props}>
                                  {String(children).trim()}
                                </SyntaxHighlighter>
                              );
                            },
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </Box>
                    )}
                  </Paper>
                  {!isUser && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, ml: 0.5 }}>
                      <Tooltip title={copiedId === message.id ? "Copied!" : "Copy"}>
                        <IconButton size="small" onClick={() => copyToClipboard(message.text, message.id)} sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}>
                          {copiedId === message.id ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Regenerate">
                        <IconButton size="small" onClick={() => handleSend(lastUserText)} sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}>
                          <RefreshIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center", ml: 0.5, fontSize: "0.7rem" }}>{message.timestamp}</Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            </Fade>
          );
        })}

        {/* Typing Indicator */}
        {isLoading && (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", maxWidth: 820, mx: "auto", width: "100%", px: { xs: 1, sm: 2 } }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}>
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: "18px 18px 18px 4px", bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.05), border: 1, borderColor: "divider" }}>
              <Stack direction="row" spacing={0.5} sx={{ py: 0.5, px: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box key={i} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "text.secondary", animation: "typing-bounce 1.4s infinite ease-in-out both", animationDelay: `${i * 0.16}s`, "@keyframes typing-bounce": { "0%, 80%, 100%": { transform: "scale(0.4)", opacity: 0.4 }, "40%": { transform: "scale(1)", opacity: 1 } } }} />
                ))}
              </Stack>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper elevation={0} sx={{ p: 2, borderTop: 1, borderColor: "divider", flexShrink: 0, bgcolor: "background.paper" }}>
        <Box sx={{ maxWidth: 820, mx: "auto" }}>
          <TextField
            fullWidth
            inputRef={inputRef}
            multiline
            maxRows={4}
            variant="outlined"
            placeholder={getPlaceholder()}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={isLoading || (mode === "log" && !chatLog)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleSend()} disabled={isLoading || !newMessage.trim()} color="primary"
                      sx={{ bgcolor: newMessage.trim() ? "primary.main" : "transparent", color: newMessage.trim() ? "primary.contrastText" : "action.disabled", width: 36, height: 36, "&:hover": { bgcolor: newMessage.trim() ? "primary.dark" : "action.hover" }, transition: "all 0.2s" }}>
                      <SendIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: theme.palette.mode === "dark" ? "action.hover" : "grey.50" } }}
          />
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 0.5, fontSize: "0.7rem" }}>
            AI may produce inaccurate results. Verify important findings.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
