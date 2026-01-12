import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const TopHeader = () => {
  const messages = [
    "Free shipping above INR 2000",
    "Certified Authentic Jewelry | 100% Genuine",
    "Get 10% OFF on your first order | Use code: FIRST10",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "40px",
        backgroundColor: "#e9e1d9", // darker cream
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        key={currentIndex}
        variant="body2"
        sx={{
          color: "#514242",
          textAlign: "center",
          animation: "fadeIn 0.4s ease-in-out",
          fontFamily: '"Tenor Sans", sans-serif',
        }}
      >
        {messages[currentIndex]}
      </Typography>
    </Box>
  );
};

export default TopHeader;
