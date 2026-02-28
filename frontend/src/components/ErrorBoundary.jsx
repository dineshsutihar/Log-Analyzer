import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            p: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 480,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <ErrorOutlineIcon
              color="error"
              sx={{ fontSize: 56, mb: 2, opacity: 0.8 }}
            />
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
