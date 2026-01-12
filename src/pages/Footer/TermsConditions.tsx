// src/pages/TermsConditions.tsx
import React from "react";
import { Box, Container, Typography, Stack, Divider, useTheme, alpha } from "@mui/material";

const TermsConditions: React.FC = () => {
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
            Legal
          </Typography>

          <Typography
            variant="h4"
            fontWeight={300}
            sx={{ letterSpacing: "0.5px" }}
          >
            Terms & Conditions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 520, mx: "auto", lineHeight: 1.8 }}
          >
            Please read these terms and conditions carefully before using our website or purchasing our products.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 6 }} />

        {/* Content Sections */}
        <Stack spacing={6}>
          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              1. General
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              By accessing our website and purchasing our products, you agree to comply with these terms. We reserve the right to modify the terms at any time without prior notice.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              2. Products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              All products are subject to availability. We strive to ensure the accuracy of product descriptions, images, and prices, but we do not guarantee that all content is error-free.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              3. Orders & Payment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              By placing an order, you confirm that the information provided is accurate. Payment must be made at the time of order through our approved payment methods.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              4. Shipping & Returns
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Shipping and returns are subject to our Shipping & Returns policy. Please review it carefully to understand delivery times, costs, and conditions for returns.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              5. Liability
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We are not liable for any direct, indirect, or consequential damages resulting from the use of our website or products. Please read our policies carefully.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              6. Governing Law
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              These terms and conditions are governed by the laws of the country in which our company is registered. Any disputes will be resolved in accordance with local law.
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
            Need Assistance?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you have questions regarding these terms, please contact our support team.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TermsConditions;
