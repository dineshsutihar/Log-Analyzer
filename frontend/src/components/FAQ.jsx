import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function FAQ() {
  const [expanded, setExpanded] = React.useState([]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(
      isExpanded
        ? [...expanded, panel]
        : expanded.filter((item) => item !== panel)
    );
  };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        sx={{
          color: "text.primary",
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
        }}
      >
        ❓ Frequently Asked Questions (FAQ)
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Accordion
          expanded={expanded.includes("panel1")}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography component="span" variant="subtitle2">
              What is this log analyzer, and how does it work?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: "100%", md: "70%" } }}
            >
              Our log analyzer helps you
              <b>detect errors, troubleshoot issues, and gain insights</b> from
              system logs. Simply upload your logs, and our AI-powered engine
              will analyze them, highlighting potential problems and suggesting
              fixes.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes("panel2")}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2d-content"
            id="panel2d-header"
          >
            <Typography component="span" variant="subtitle2">
              What types of logs does it support?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: "100%", md: "70%" } }}
            >
              We support system logs, server logs, application logs, network
              logs, and more, including formats like CSV and log files from
              Linux, Windows, and cloud platforms.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes("panel3")}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3d-content"
            id="panel3d-header"
          >
            <Typography component="span" variant="subtitle2">
              Do I need technical expertise to use it?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: "100%", md: "70%" } }}
            >
              Not at all! Our tool is designed for both developers and
              non-technical users, providing an easy-to-use dashboard with
              simple explanations and actionable insights.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded.includes("panel4")}
          onChange={handleChange("panel4")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4d-content"
            id="panel4d-header"
          >
            <Typography component="span" variant="subtitle2">
              How do I get started?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: "100%", md: "70%" } }}
            >
              Click "Get Started", sign up, and upload your first log to begin
              analyzing errors and improving your system performance. It's that
              simple!
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}
