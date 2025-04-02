import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "../utils/state";
import chatApi from "../utils/api/chatApi";

export default function Chat({ logId }) {
  const user = useRecoilValue(userState);
  const messagesEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState({});
  const [newMessage, setNewMessage] = useState("");

  const messages = useMemo(
    () => chatHistory[logId] || [],
    [chatHistory, logId]
  );

  const handleSend = async () => {
    const userText = newMessage.trim();
    if (!userText) return;

    const userMsg = {
      id: Date.now(),
      text: userText,
      sender: "user",
    };

    setChatHistory((prev) => ({
      ...prev,
      [logId]: [...(prev[logId] || []), userMsg],
    }));

    setNewMessage("");

    try {
      const response = await chatApi({ logId, userText, userId: user.id });
      const botMsg = {
        id: Date.now() + 1,
        text: response.response || "No response from AI",
        sender: "bot",
      };

      setChatHistory((prev) => ({
        ...prev,
        [logId]: [...(prev[logId] || []), userMsg, botMsg],
      }));
    } catch {
      const errorMsg = {
        id: Date.now() + 2,
        text: "❌ Error fetching AI response.",
        sender: "bot",
      };
      setChatHistory((prev) => ({
        ...prev,
        [logId]: [...(prev[logId] || []), errorMsg],
      }));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Stack sx={{ p: 2, height: "100%", width: "100%" }}>
      <Paper
        elevation={3}
        sx={{
          height: "calc(100% - 70px)",
          overflowY: "auto",
          p: 2,
          mb: 2,
          bgcolor: "background.default",
        }}
      >
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
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: "70%",
                bgcolor:
                  message.sender === "user" ? "primary.light" : "grey.100",
                color: message.sender === "user" ? "white" : "text.primary",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
