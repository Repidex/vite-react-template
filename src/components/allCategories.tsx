import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
} from "@mui/material";

type Category = {
  id: string;
  name: string;
  image_url: string | null;
};

// Modern minimalist color palette
const colors = {
  background: "rgb(246, 242, 238)",
  surface: "#FFFFFF",
  primary: "#2C241C",
  secondary: "#6B6258",
  accent: "#4A6572",
  border: "rgba(44, 36, 28, 0.08)",
  overlay: "rgba(44, 36, 28, 0.75)",
};

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image_url")
        .order("name");

      if (!error) {
        setCategories(data || []);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/all-jewellery?category=${categoryId}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          py: { xs: 8, sm: 10, md: 12 },
          bgcolor: colors.background,
        }}
      >
        <Container>
          <Typography
            variant="h1"
            sx={{
              textAlign: "center",
              mb: { xs: 6, sm: 8, md: 10 },
              color: colors.primary,
              fontWeight: 300,
              letterSpacing: "0.1em",
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
            }}
          >
            <Skeleton
              width={280}
              sx={{ mx: "auto", bgcolor: alpha(colors.primary, 0.1) }}
            />
          </Typography>
        </Container>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(auto-fit, minmax(150px, 1fr))",
              sm: "repeat(auto-fit, minmax(180px, 1fr))",
              md: "repeat(auto-fit, minmax(200px, 1fr))",
            },
            gap: 0,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                aspectRatio: "1",
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                  bgcolor: alpha(colors.primary, 0.05),
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 8, sm: 10, md: 12 },
        bgcolor: colors.background,
        position: "relative",
      }}
    >
      {/* Section Title - Clean Modern */}
      <Container>
        <Typography
          variant="h1"
          sx={{
            textAlign: "center",
            mb: 1,
            color: "rgb(99 80 31)",
            fontWeight: 500,
            letterSpacing: "2px",
            fontSize: { xs: "clamp(25px, 4vw, 42px)" },
            lineHeight: 1.3,
            fontFamily: "Tenor Sans, sans-serif",
          }}
        >
          ALL COLLECTIONS
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            mb: { xs: 2, sm: 4, md: 6 },
            color: colors.secondary,
            fontWeight: 300,
            letterSpacing: "0.5px",
            fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
            lineHeight: 1.2,
            maxWidth: 600,
            mx: "auto",
            fontFamily: "Tenor Sans, sans-serif",
          }}
        >
          Explore our carefully curated selection of jewelry collections, each
          piece crafted with elegance and precision.
        </Typography>
      </Container>

      {/* Categories Grid - Modern Gallery */}
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(150px, 1fr))",
            sm: "repeat(auto-fit, minmax(180px, 1fr))",
            md: "repeat(auto-fit, minmax(200px, 1fr))",
          },
          gap: 0,
        }}
      >
        <AnimatePresence>
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <Box
                onClick={() => handleCategoryClick(category.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCategoryClick(category.id);
                  }
                }}
                role="button"
                tabIndex={0}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  aspectRatio: "1", // Perfect square cards
                  border: "none",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: `1px solid ${alpha(colors.primary, 0.05)}`,
                    pointerEvents: "none",
                    transition: "border-color 0.4s ease",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(90deg, transparent, ${alpha(
                      colors.surface,
                      0.2
                    )}, transparent)`,
                    transition: "left 0.5s ease",
                    zIndex: 1,
                    pointerEvents: "none",
                  },
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: `
                      0 4px 12px ${alpha(colors.primary, 0.06)},
                      0 8px 20px ${alpha(colors.primary, 0.08)},
                      0 12px 28px ${alpha(colors.primary, 0.06)}
                    `,
                    "&::after": {
                      borderColor: alpha(colors.primary, 0.12),
                    },
                    "&::before": {
                      left: "100%",
                    },
                    "& .category-image": {
                      transform: "scale(1.05)",
                      filter: "brightness(1.03)",
                    },
                    "& .category-overlay": {
                      opacity: 1,
                    },
                    "& .category-name-box": {
                      backgroundColor: alpha(colors.primary, 0.95),
                      "& .category-name-text": {
                        color: colors.surface,
                      },
                    },
                  },
                }}
              >
                {/* Image Container with Internal Padding */}
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: 12, sm: 16, md: 20 },
                    left: { xs: 12, sm: 16, md: 20 },
                    right: { xs: 12, sm: 16, md: 20 },
                    bottom: { xs: 12, sm: 16, md: 20 },
                    overflow: "hidden",
                    borderRadius: "1px",
                    backgroundColor: "transparent",
                  }}
                >
                  {category.image_url ? (
                    <Box
                      component="img"
                      src={category.image_url}
                      alt={category.name}
                      className="category-image"
                      sx={{
                        width: "100%",
                        height: { xs: "85%", sm: "85%", md: "80%" },
                        objectFit: "contain",
                        objectPosition: "center",
                        display: "block",
                        maxWidth: "100%",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        filter: "brightness(1)",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "transparent",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(colors.primary, 0.4),
                          fontStyle: "italic",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          textAlign: "center",
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Hover Overlay */}
                  <Box
                    className="category-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0,
                      transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </Box>

                {/* Static Name for Mobile (always visible) */}
                {isMobile && (
                  <Box
                    className="category-name-box"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      py: 1.5,
                      px: 2,
                      backgroundColor: alpha(colors.background, 0.95),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(8px)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: "translateY(0)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      className="category-name-text"
                      sx={{
                        color: colors.primary,
                        fontWeight: "bold",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: "0.6875rem",
                        textAlign: "center",
                        lineHeight: 1.2,
                        transition: "color 0.3s ease",
                        fontFamily: "Tenor Sans, sans-serif",
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                )}

                {/* Category Name for Desktop */}
                {!isMobile && (
                  <Box
                    className="category-name-box"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      py: { sm: 2, md: 2.5 },
                      px: { sm: 2, md: 2.5 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(8px)",
                      backgroundColor: alpha(colors.background, 0.9),
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <Typography
                      variant="body2"
                      className="category-name-text"
                      sx={{
                        color: colors.primary,
                        fontWeight: 400,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: { sm: "0.75rem", md: "0.825rem" },
                        textAlign: "center",
                        lineHeight: 1.2,
                        transition: "color 0.3s ease",
                        fontFamily: "Tenor Sans, sans-serif",
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Modern View All Button */}
      <Container>
        <Stack
          direction="column"
          alignItems="center"
          spacing={3}
          sx={{
            mt: { xs: 4, sm: 6, md: 8 },
            mb: { xs: -4, sm: -6, md: -8 },
            position: "relative",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/all-jewellery")}
            sx={{
              px: { xs: 5, sm: 7, md: 9 },
              py: { xs: 1.25, sm: 1.5, md: 1.75 },
              border: `1px solid ${colors.primary}`,
              color: colors.primary,
              borderRadius: "50px",
              fontSize: { xs: "0.8125rem", sm: "0.9375rem", md: "1rem" },
              fontWeight: 300,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              minWidth: { xs: 200, sm: 240 },
              position: "relative",
              overflow: "hidden",
              backgroundColor: "transparent",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                backgroundColor: colors.primary,
                transition: "transform 0.4s ease",
                zIndex: -1,
              },
              "&:hover": {
                color: colors.surface,
                borderColor: colors.primary,
                transform: "translateY(-2px)",
                "&::before": {
                  transform: "translateX(100%)",
                },
              },
            }}
          >
            Explore Collection
          </Button>
          <Box
            sx={{
              width: "100%",
              maxWidth: 600,
              height: "1px",
              backgroundColor: alpha(colors.primary, 0.1),
              mb: 1,
            }}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default CategorySection;
