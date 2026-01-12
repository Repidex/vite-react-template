// src/pages/NotFound.tsx
import React from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Stack spacing={4}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "6rem", md: "8rem" },
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontWeight: 300, color: "text.secondary", lineHeight: 1.5 }}
          >
            Oops! The page you are looking for does not exist.
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
            It might have been removed, had its name changed, or is temporarily
            unavailable.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/")}
            sx={{
              textTransform: "none",
              px: 5,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Go Back Home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default NotFound;
