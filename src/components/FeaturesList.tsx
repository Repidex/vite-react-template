import React from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import Hand from "../assets/hand.png";
import Custom from "../assets/custum.png";
import Express from "../assets/express.png";

const FeaturesList: React.FC = () => {
  const features = [
    {
      id: 1,
      image: Custom,
      title: "Custom Design",
      color: "#2E7D32",
    },
    {
      id: 2,
      image: Hand,
      title: "Hand Crafted",
      color: "#1565C0",
    },
    {
      id: 3,
      image: Express,
      title: "Express Delivery",
      color: "#C62828",
    },
  ];

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={0}
          sx={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "stretch",
            display: "flex",
          }}
        >
          {features.map((feature, index) => {
            return (
              <React.Fragment key={feature.id}>
                <Box
                  sx={{
                    flex: 1,
                    padding: { xs: "20px", sm: "24px", md: "32px" },
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Stack
                    spacing={{ xs: 1.5, sm: 2 }}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
                    {/* Image Container */}
                    <Box
                      sx={{
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: 13, sm: 14, md: 15 },
                        fontWeight: 700,
                        color: "#514242",
                        letterSpacing: "0.3px",
                        lineHeight: 1.4,
                        fontFamily: '"Tenor Sans", sans-serif',
                      }}
                    >
                      {feature.title}
                    </Typography>
                  </Stack>
                </Box>

                {/* Divider - show between items, not after last item */}
                {index < features.length - 1 && (
                  <Box
                    sx={{
                      width: "1px",
                      height: "100px",
                      backgroundColor: "#D9D9D9",
                      flexShrink: 0,
                      marginTop: "25px",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    backgroundColor: "#FAFAFA",
  },
};

export default FeaturesList;
