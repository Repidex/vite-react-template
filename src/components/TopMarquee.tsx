import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const TopMarquee = () => {
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
        backgroundColor: "rgb(247, 245, 241)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden", // important for marquee
        position: "relative",
      }}
    >
      <Typography
        key={currentIndex}
        variant="body2"
        sx={{
          color: "#514242",
          whiteSpace: "nowrap",
          position: "absolute",
          animation: "marquee 8s linear infinite",
          fontFamily: '"Tenor Sans", sans-serif',
        }}
      >
        {messages[currentIndex]}
      </Typography>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </Box>
  );
};

export default TopMarquee;
