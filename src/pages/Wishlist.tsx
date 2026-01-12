import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  IconButton,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  DeleteOutline,
  ShoppingBagOutlined,
  FavoriteBorder,
  ChevronRight,
  Add,
} from "@mui/icons-material";
import { useCart } from "../providers/CartContext";
import { useNavigate } from "react-router-dom";

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image_url?: string[];
  original_price?: number;
  categories?: { name: string };
};

/* ---------- STORAGE HELPERS ---------- */
const getWishlist = (): WishlistItem[] =>
  JSON.parse(localStorage.getItem("wishlist") || "[]");

const saveWishlist = (items: WishlistItem[]) =>
  localStorage.setItem("wishlist", JSON.stringify(items));

/* ---------- COMPONENT ---------- */
const Wishlist: React.FC = () => {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  React.useEffect(() => {
    setItems(getWishlist());
  }, []);

  /* ---------- ACTIONS ---------- */
  const handleRemove = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    saveWishlist(updated);
    setItems(updated);
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url?.[0],
    });
    handleRemove(item.id);
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const addAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image_url?.[0],
      });
    });
    setItems([]);
    saveWishlist([]);
  };

  /* ---------- EMPTY STATE ---------- */
  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          px: 2,
          bgcolor: "rgb(246, 242, 238)",
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(0, 0, 0, 0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <FavoriteBorder
            sx={{
              fontSize: 48,
              color: "text.disabled",
            }}
          />
        </Box>
        <Typography variant="h5" fontWeight={400} gutterBottom sx={{ mb: 1.5 }}>
          Your wishlist is empty
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 300, mb: 4 }}
        >
          Save items you love for later
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/all-jewellery")}
          endIcon={<ChevronRight />}
          sx={{
            borderRadius: 25,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontSize: "0.875rem",
            borderWidth: 1,
            borderColor: "divider",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "rgba(0, 0, 0, 0.01)",
            },
          }}
        >
          Browse Collection
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 3, md: 5 },
        bgcolor: "rgb(246, 242, 238)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, md: 5 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          px: { xs: 0.5, sm: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={400}
            sx={{
              fontSize: { xs: "1.5rem", md: "1.75rem" },
              letterSpacing: "-0.5px",
              mb: 0.5,
            }}
          >
            Wishlist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Typography>
        </Box>

        {isDesktop && (
          <Button
            variant="outlined"
            onClick={addAllToCart}
            startIcon={<ShoppingBagOutlined />}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontSize: "0.875rem",
              px: 3.5,
              py: 1.5,
              borderWidth: 1,
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(0, 0, 0, 0.01)",
              },
            }}
          >
            Add All to Cart
          </Button>
        )}
      </Box>

      {/* Products Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
        {items.map((item) => {
          const discount = calculateDiscount(item.price, item.original_price);

          return (
            <Grid
              item
              xs={6} // 2 cards per row on mobile
              sm={4} // 3 cards per row on tablet
              md={3} // 4 cards per row on desktop
              key={item.id}
              sx={{
                display: "flex",
                height: "auto",
              }}
            >
              <Card
                elevation={0}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    borderColor: alpha(theme.palette.text.primary, 0.2),
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                    "& .product-image": {
                      transform: "scale(1.03)",
                    },
                  },
                }}
              >
                {/* Action Buttons - Top Right */}
                <Box
                  sx={{
                    position: "absolute",
                    top: isMobile ? 8 : 12,
                    right: isMobile ? 8 : 12,
                    zIndex: 10,
                    display: "flex",
                    gap: isMobile ? 0.5 : 1,
                  }}
                >
                  {/* Delete Button */}
                  <IconButton
                    size={isMobile ? "small" : "medium"}
                    onClick={() => handleRemove(item.id)}
                    sx={{
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        bgcolor: "error.lighter",
                        borderColor: "error.light",
                        color: "error.main",
                      },
                      width: isMobile ? 32 : 36,
                      height: isMobile ? 32 : 36,
                      backdropFilter: "blur(4px)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <DeleteOutline sx={{ fontSize: isMobile ? 18 : 20 }} />
                  </IconButton>

                  {/* Add to Cart Button (+) - Only on mobile */}
                  {isMobile && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      sx={{
                        bgcolor: "black",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#333",
                        },
                        width: 32,
                        height: 32,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Add sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                </Box>

                {/* Image Container */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 0,
                    paddingBottom: "100%", // Square aspect ratio
                    bgcolor: "grey.50",
                    cursor: "pointer",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <Chip
                      label={`-${discount}%`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: isMobile ? 8 : 12,
                        left: isMobile ? 8 : 12,
                        zIndex: 2,
                        fontWeight: 600,
                        fontSize: isMobile ? "0.65rem" : "0.75rem",
                        height: isMobile ? 20 : 22,
                        borderRadius: 1,
                        bgcolor: "error.main",
                        color: "white",
                        "& .MuiChip-label": {
                          px: isMobile ? 0.75 : 1,
                        },
                      }}
                    />
                  )}

                  <Box
                    component="img"
                    src={item.image_url?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    className="product-image"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      p: isMobile ? 1.5 : 2,
                      transition: "transform 0.4s ease",
                    }}
                  />
                </Box>

                {/* Content Area */}
                <Box
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                  }}
                >
                  {/* Product Name */}
                  <Typography
                    variant={isMobile ? "body2" : "body1"}
                    sx={{
                      fontWeight: 400,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flexGrow: 1,
                      fontSize: isMobile ? "0.8125rem" : "0.875rem",
                    }}
                  >
                    {item.name}
                  </Typography>

                  {/* Category - Desktop Only */}
                  {!isMobile && item.categories?.name && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: 400,
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        fontSize: "0.7rem",
                        opacity: 0.7,
                      }}
                    >
                      {item.categories.name}
                    </Typography>
                  )}

                  {/* Price */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant={isMobile ? "body2" : "body1"}
                        fontWeight={500}
                        sx={{
                          fontSize: isMobile ? "0.8125rem" : "0.95rem",
                          color: "text.primary",
                        }}
                      >
                        ₹{item.price.toLocaleString()}
                      </Typography>
                      {item.original_price &&
                        item.original_price > item.price && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              textDecoration: "line-through",
                              fontSize: isMobile ? "0.7rem" : "0.75rem",
                              opacity: 0.6,
                            }}
                          >
                            ₹{item.original_price.toLocaleString()}
                          </Typography>
                        )}
                    </Stack>
                  </Box>

                  {/* Add to Cart Button - Desktop Only */}
                  {!isMobile && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      sx={{
                        borderRadius: 1,
                        textTransform: "none",
                        fontSize: "0.8125rem",
                        py: 1.25,
                        mt: 1,
                        backgroundColor: "black",
                        color: "white",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: "#333",
                          boxShadow: "none",
                        },
                        minHeight: 40,
                        fontWeight: 400,
                        letterSpacing: "0.5px",
                      }}
                      startIcon={<ShoppingBagOutlined sx={{ fontSize: 16 }} />}
                    >
                      Add to Cart
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Mobile Add All Button */}
      {!isDesktop && items.length > 0 && (
        <Box sx={{ mt: 4, px: 1 }}>
          <Button
            variant="contained"
            onClick={addAllToCart}
            fullWidth
            startIcon={<ShoppingBagOutlined />}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontSize: "0.875rem",
              py: 1.5,
              backgroundColor: "black",
              color: "white",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#333",
                boxShadow: "none",
              },
            }}
          >
            Add All to Cart ({items.length})
          </Button>
        </Box>
      )}

      {/* Desktop Footer */}
      {isDesktop && items.length > 0 && (
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.875rem", opacity: 0.6 }}
          >
            Items are saved for 30 days
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="text"
              onClick={() => navigate("/all-jewellery")}
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "transparent",
                },
              }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="contained"
              onClick={addAllToCart}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontSize: "0.875rem",
                px: 4,
                py: 1.5,
                backgroundColor: "black",
                color: "white",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#333",
                  boxShadow: "none",
                },
              }}
            >
              Add All to Cart
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Wishlist;
