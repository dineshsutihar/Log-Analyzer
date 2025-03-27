import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, how can I help you?", sender: "bot" },
    { id: 2, text: "I need help analyzing my logs", sender: "user" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: newMessage, sender: "user" },
      ]);
      setNewMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Stack
      sx={{
        p: 2,
        height: "100%",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
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
