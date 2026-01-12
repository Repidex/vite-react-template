// src/pages/ShippingReturns.tsx
import React from "react";
import { Box, Container, Typography, Stack, Divider, useTheme, alpha } from "@mui/material";

const ShippingReturns: React.FC = () => {
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
            Customer Support
          </Typography>

          <Typography
            variant="h4"
            fontWeight={300}
            sx={{ letterSpacing: "0.5px" }}
          >
            Shipping & Returns
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 520, mx: "auto", lineHeight: 1.8 }}
          >
            Everything you need to know about our shipping process and how to make returns easily and efficiently.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 6 }} />

        {/* Content Sections */}
        <Stack spacing={6}>
          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Shipping Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Orders are typically processed within 2–4 business days. Standard shipping times vary depending on your location and will be displayed during checkout.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Shipping Methods & Costs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We offer multiple shipping options including standard, express, and overnight delivery. Shipping costs are calculated at checkout based on your location and chosen method.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Tracking Your Order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Once your order is shipped, you will receive a confirmation email with a tracking number to monitor your package until it arrives.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Returns & Exchanges
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We accept returns and exchanges within 14 days of delivery, provided the item is unworn and in its original packaging. Customized items are non-returnable. Contact our support team to initiate a return.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={500} gutterBottom>
              Refunds
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Refunds are processed within 5–7 business days after we receive your returned items. You will be notified via email once your refund has been issued.
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
            Need More Help?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you have additional questions about shipping or returns, our support team is here to assist you.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ShippingReturns;
