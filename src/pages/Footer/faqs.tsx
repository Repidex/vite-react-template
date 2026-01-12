import React, { useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    question: "What materials are used in your jewellery?",
    answer:
      "Our jewellery is crafted using high-quality materials including solid gold, sterling silver, ethically sourced diamonds, and carefully selected gemstones. Each piece is designed to meet our strict quality standards.",
  },
  {
    question: "Are your diamonds ethically sourced?",
    answer:
      "Yes. We are committed to ethical sourcing and work only with trusted suppliers who adhere to responsible mining and sourcing practices.",
  },
  {
    question: "How do I care for my jewellery?",
    answer:
      "We recommend storing your jewellery in a soft pouch when not in use, avoiding contact with chemicals or perfumes, and gently cleaning with a soft cloth to maintain its shine.",
  },
  {
    question: "Do you offer customization or engraving?",
    answer:
      "Yes, selected designs can be customized or engraved. Please contact our support team for available options and turnaround times.",
  },
  {
    question: "What is your return and exchange policy?",
    answer:
      "We offer a hassle-free return and exchange policy within 14 days of delivery, provided the item is unworn and in its original condition. Customized pieces are non-returnable.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders are typically processed within 2–4 business days. Delivery times vary based on location and will be shared during checkout.",
  },
];

const Faq: React.FC = () => {
  const theme = useTheme();

  const faqRefs = useRef<HTMLDivElement[]>([]);

  const scrollToFaq = (index: number) => {
    const ref = faqRefs.current[index];
    if (ref) {
      const yOffset = -80; // adjust for header height
      const y = ref.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 3, color: "text.secondary" }}
          >
            Help & Support
          </Typography>

          <Typography
            variant="h4"
            fontWeight={300}
            sx={{ letterSpacing: "0.5px" }}
          >
            Frequently Asked Questions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 520, mx: "auto", lineHeight: 1.8 }}
          >
            Find answers to common questions about our jewellery, materials,
            orders, and care.
          </Typography>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* FAQ Navigation Buttons */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{ mb: 6, justifyContent: "center" }}
        >
          {faqs.map((faq, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => scrollToFaq(index)}
            >
              {faq.question.length > 20
                ? faq.question.slice(0, 20) + "..."
                : faq.question}
            </Button>
          ))}
        </Stack>

        {/* FAQ List */}
        <Stack spacing={2}>
          {faqs.map((faq, index) => (
            <div key={index} ref={(el) => { if (el) faqRefs.current[index] = el; }}>
              <Accordion
                disableGutters
                elevation={0}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  borderRadius: 2,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body1" fontWeight={500} sx={{ pr: 2 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8 }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
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
            Still have questions?
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Our support team is always happy to help. Please reach out to us
            anytime.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Faq;
