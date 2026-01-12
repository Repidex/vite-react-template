import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";

const About: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: "rgb(246, 242, 238)", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ mb: 8, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 3,
              color: "text.secondary",
            }}
          >
            About Us
          </Typography>

          <Typography
            variant="h3"
            fontWeight={300}
            sx={{ letterSpacing: "1px" }}
          >
            Crafted with Purpose
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            We create timeless jewellery that blends refined craftsmanship with
            modern design — pieces meant to be worn, loved, and remembered.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 8 }} />

        {/* Content Sections */}
        <Grid container spacing={8}>
          {/* Left */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={400}>
                Our Story
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.9 }}
              >
                Founded with a passion for fine design and authentic materials,
                our brand began with a simple idea — to make jewellery that
                feels personal, intentional, and enduring.
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.9 }}
              >
                Every piece is thoughtfully designed and responsibly crafted,
                balancing tradition with contemporary aesthetics. We believe
                true luxury lies in simplicity, detail, and meaning.
              </Typography>
            </Stack>
          </Grid>

          {/* Right */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={400}>
                What We Believe
              </Typography>

              <Stack spacing={2}>
                {[
                  "Minimal, timeless design over trends",
                  "Ethical sourcing and responsible craftsmanship",
                  "Quality materials that last a lifetime",
                  "Designs that tell a personal story",
                ].map((value, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 10 }} />

        {/* Closing Section */}
        <Stack spacing={3} textAlign="center">
          <Typography variant="h5" fontWeight={400}>
            Designed for Every Moment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            Whether it’s a celebration, a milestone, or a quiet everyday moment,
            our jewellery is designed to be part of your story — today and for
            years to come.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default About;
