import { Link } from "react-router-dom";
import { ArrowBack, ErrorOutline } from "@mui/icons-material";
import { Button, Container, Typography, Box, Paper } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "black",
        color: "white",
        textAlign: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box position="relative" display="inline-block" mb={3}>
          <Box
            sx={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              bgcolor: "rgba(100, 100, 100, 0.4)",
              filter: "blur(12px)",
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: "50%",
              bgcolor: "#121212",
              boxShadow: 3,
            }}
          >
            <ErrorOutline sx={{ fontSize: 48, color: "gray" }} />
          </Box>
        </Box>

        <Typography variant="h1" fontWeight="bold" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" color="gray" gutterBottom>
          Page not found
        </Typography>
        <Typography variant="body1" color="gray">
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Box
          mt={4}
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          justifyContent="center"
        >
          <Button
            variant="outlined"
            sx={{
              borderColor: "gray",
              color: "white",
              "&:hover": { bgcolor: "gray" },
            }}
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
          >
            Back to home
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "white",
              color: "black",
              "&:hover": { bgcolor: "#ddd" },
            }}
            component={Link}
            to="/dashboard"
          >
            Go to dashboard
          </Button>
        </Box>

        <Paper
          sx={{
            mt: 4,
            p: 2,
            maxWidth: 400,
            mx: "auto",
            bgcolor: "rgba(20, 20, 20, 0.8)",
            border: "1px solid gray",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="gray">
            <strong>Error Code:</strong> 404_PAGE_NOT_FOUND
          </Typography>
          <Typography variant="body2" color="gray">
            <strong>Timestamp:</strong> {new Date().toISOString()}
          </Typography>
          <Typography variant="body2" color="gray">
            <strong>Path:</strong>{" "}
            {typeof window !== "undefined"
              ? window.location.pathname
              : "/unknown"}
          </Typography>
        </Paper>
      </Container>

      <Box
        component="footer"
        mt={6}
        width="100%"
        py={3}
        borderTop="1px solid gray"
      >
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography variant="body2" color="gray">
            &copy; {new Date().getFullYear()} Log Analyzer. All rights reserved.
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{
                textTransform: "none",
                color: "gray",
                "&:hover": { color: "white" },
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/dashboard"
              sx={{
                textTransform: "none",
                color: "gray",
                "&:hover": { color: "white" },
              }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/#contact"
              sx={{
                textTransform: "none",
                color: "gray",
                "&:hover": { color: "white" },
              }}
            >
              Contact
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
