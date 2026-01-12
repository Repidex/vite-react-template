// src/pages/Sustainability.tsx
import React from "react";
import { Box, Container, Typography, Stack, Divider, useTheme, alpha } from "@mui/material";

const Sustainability: React.FC = () => {
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
            Our Commitment
          </Typography>

          <Typography
            variant="h4"
            fontWeight={300}
            sx={{ letterSpacing: "0.5px" }}
          >
            Sustainability
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 520, mx: "auto", lineHeight: 1.8 }}
          >
            We care about the planet and are committed to sustainable practices in every aspect of our jewellery production and business operations.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 6 }} />

        {/* Content Sections */}
        <Stack spacing={6}>
          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Ethical Sourcing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              All our diamonds and gemstones are ethically sourced. We partner with trusted suppliers that follow responsible mining practices, ensuring that our materials do no harm to the environment or communities.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Eco-Friendly Materials
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We use recycled metals wherever possible, including gold and silver, and minimize waste during production. Our packaging is fully recyclable and designed with sustainability in mind.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Reducing Carbon Footprint
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We continuously work to reduce our carbon footprint by optimizing shipping methods, supporting renewable energy in our offices, and encouraging sustainable practices among our partners.
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
            Join Us in Our Mission
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Together, we can make a positive impact. Learn more about our initiatives and how you can contribute to a sustainable future.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Sustainability;
