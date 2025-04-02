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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "../utils/state";
import chatApi from "../utils/api/chatApi";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Chat() {
  const theme = useTheme();
  const user = useRecoilValue(userState);
  const logId = user.id;
  const logMessage = user.logMessage || "No context available";
  const messagesEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserText, setLastUserText] = useState("");

  const messages = useMemo(
    () => chatHistory[logId] || [],
    [chatHistory, logId]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      [logId]: [...(prev[logId] || []), userMsg],
    }));

    setIsLoading(true);

    try {
      const response = await chatApi({
        logId,
        userText: text,
        userId: user.id,
      });
      const botMsg = {
        id: Date.now() + 1,
        text: response.response || "No response",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatHistory((prev) => ({
        ...prev,
        [logId]: [...(prev[logId] || []), botMsg],
      }));
    } catch {
      setChatHistory((prev) => ({
        ...prev,
        [logId]: [
          ...(prev[logId] || []),
          {
            id: Date.now() + 1,
            text: "❌ Error fetching response",
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

  return (
    <Stack sx={{ p: 2, height: "100%", width: "100%" }}>
      <Paper
        elevation={3}
        sx={{
          height: "calc(100% - 120px)",
          overflowY: "auto",
          p: 2,
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.background.default,
        }}
      >
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

      <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
        @referring: <b>{logMessage}</b>
      </Typography>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton
          color="primary"
          onClick={() => handleSend()}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            borderRadius: 2,
          }}
        >
          <SendIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
