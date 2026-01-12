// src/pages/CareGuide.tsx
import React from "react";
import { Box, Container, Typography, Stack, Divider, useTheme, alpha } from "@mui/material";

const CareGuide: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 3, color: "text.secondary" }}
          >
            Tips & Guidance
          </Typography>

          <Typography
            variant="h4"
            fontWeight={300}
            sx={{ letterSpacing: "0.5px" }}
          >
            Jewellery Care Guide
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 520, mx: "auto", lineHeight: 1.8 }}
          >
            Learn how to properly care for your jewellery to keep it shining and in perfect condition for years to come.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 6 }} />

        {/* Content Sections */}
        <Stack spacing={6}>
          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Cleaning Your Jewellery
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Clean your jewellery regularly with a soft cloth. Avoid harsh chemicals and ultrasonic cleaners for delicate gemstones.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Storage Tips
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Store your pieces in a soft pouch or a separate compartment to prevent scratches. Keep away from direct sunlight and moisture.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Wearing Guidelines
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Remove jewellery before swimming, exercising, or applying lotions and perfumes. Avoid wearing during heavy tasks to prevent damage.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Professional Maintenance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Schedule regular check-ups with a professional jeweller to ensure settings, clasps, and stones remain secure.
            </Typography>
          </Box>
        </Stack>

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
            Keep Your Jewellery Sparkling
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Following these simple steps will ensure your jewellery stays beautiful for generations.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CareGuide;
