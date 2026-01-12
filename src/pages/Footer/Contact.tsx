// src/pages/Contact.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  useTheme,
  alpha,
} from "@mui/material";

const Contact: React.FC = () => {
  const theme = useTheme();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can handle form submission, e.g., send to API
    console.log({ name, email, message });
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="sm">
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 3, color: "text.secondary" }}
          >
            Get In Touch
          </Typography>

          <Typography
            variant="h4"
            fontWeight={300}
            sx={{ letterSpacing: "0.5px" }}
          >
            Contact Us
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.8 }}
          >
            Have a question or need assistance? Fill out the form below, and our
            support team will get back to you as soon as possible.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 6 }} />

        {/* Contact Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Button type="submit" variant="contained" size="large">
              Send Message
            </Button>

            {submitted && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{ textAlign: "center" }}
              >
                Your message has been sent successfully!
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Footer Note */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Typography variant="body1" fontWeight={500} gutterBottom>
            Need Immediate Assistance?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can also reach us via email at{" "}
            <strong>support@yourdomain.com</strong> or call us at{" "}
            <strong>+1 234 567 890</strong>.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
