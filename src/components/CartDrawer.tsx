import React from "react";
import {
  Box,
  Button,
  IconButton,
  Drawer,
  Divider,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ShoppingBagOutlined,
  Close,
  DeleteOutline,
  Add,
  Remove,
  ArrowForward,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../providers/CartContext";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

/* ---------- THEME COLORS ---------- */
const colors = {
  cream: "#FAFAF8",
  creamDark: "#F5F3F0",
  brown: "#3A2F28",
  brownLight: "#7A6D63",
  brownMuted: "#D4CCCB",
  accent: "#2E7D32",
  white: "#FFFFFF",
  gray: "#9E9E9E",
};

const CartDrawer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const {
    items,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    closeCart,
  } = useCart();

  const { user } = useAuth();

  const [lastRemoved, setLastRemoved] = React.useState<any>(null);
  const [undoOpen, setUndoOpen] = React.useState(false);

  /* ---------- PRICE ---------- */
  const shipping = totalPrice > 100 ? 0 : 10;
  const tax = totalPrice * 0.1;
  const total = totalPrice + shipping + tax;

  /* ---------- ACTIONS ---------- */
  const handleRemove = (item: any) => {
    removeFromCart(item.id);
    setLastRemoved(item);
    setUndoOpen(true);
  };

  const handleUndo = () => {
    if (lastRemoved) incrementQuantity(lastRemoved.id);
    setUndoOpen(false);
  };

  const handleCheckout = () => {
    if (!user) return navigate("/login");
    closeCart();
    navigate("/cart");
  };

  return (
    <>
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={isCartOpen}
        onClose={closeCart}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 450 },
            height: isMobile ? "85vh" : "100vh",
            borderRadius: isMobile ? "28px 28px 0 0" : 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.cream,
            boxShadow: isMobile
              ? "0 -8px 40px rgba(0,0,0,0.08)"
              : "-8px 0 40px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 3,
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.brownMuted}20`,
          }}
        >
          {/* Drag indicator for mobile */}
          {isMobile && (
            <Box
              sx={{
                width: 40,
                height: 3,
                backgroundColor: colors.brownMuted,
                borderRadius: 2,
                mx: "auto",
                mb: 2,
              }}
            />
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <ShoppingBagOutlined sx={{ fontSize: 24, color: colors.brown }} />
              <Typography
                sx={{
                  fontSize: { xs: 18, sm: 19 },
                  fontWeight: 600,
                  color: colors.brown,
                  letterSpacing: "0.3px",
                }}
              >
                Cart
              </Typography>
              {totalItems > 0 && (
                <Box
                  sx={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    fontSize: 12,
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 12,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {totalItems}
                </Box>
              )}
            </Stack>
            <IconButton
              size="small"
              onClick={closeCart}
              sx={{
                backgroundColor: colors.creamDark,
                color: colors.brown,
                width: 40,
                height: 40,
                "&:hover": { backgroundColor: colors.brownMuted + "25" },
                transition: "all 0.2s ease",
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* CONTENT */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2.5, sm: 3 },
            py: 2.5,
            "&::-webkit-scrollbar": { width: 5 },
            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: colors.brownMuted + "60",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: colors.brownMuted,
            },
          }}
        >
          <AnimatePresence>
            {items.length === 0 ? (
              <EmptyState onBrowse={() => navigate("/all-jewellery")} />
            ) : (
              <List disablePadding>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ListItem
                      disableGutters
                      sx={{
                        py: 1.5,
                        px: 2,
                        mb: 1.5,
                        backgroundColor: colors.white,
                        borderRadius: 3,
                        border: `1px solid ${colors.brownMuted}15`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          border: `1px solid ${colors.brownMuted}25`,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.image}
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 2.5,
                            backgroundColor: colors.creamDark,
                            border: `1px solid ${colors.brownMuted}20`,
                          }}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={
                          <Typography
                            sx={{
                              fontSize: 13.5,
                              fontWeight: 500,
                              color: colors.brown,
                              lineHeight: 1.35,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: colors.accent,
                              mt: 0.75,
                              letterSpacing: "0.3px",
                            }}
                          >
                            ${item.price.toFixed(2)}
                          </Typography>
                        }
                      />

                      <Stack alignItems="flex-end" spacing={1.25}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{
                            backgroundColor: colors.creamDark,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: `1px solid ${colors.brownMuted}15`,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => decrementQuantity(item.id)}
                            sx={{
                              borderRadius: 0,
                              p: 0.6,
                              color: colors.brown,
                              "&:hover": { backgroundColor: colors.white },
                            }}
                          >
                            <Remove sx={{ fontSize: 17 }} />
                          </IconButton>

                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              width: 32,
                              textAlign: "center",
                              color: colors.brown,
                            }}
                          >
                            {item.quantity}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() => incrementQuantity(item.id)}
                            sx={{
                              borderRadius: 0,
                              p: 0.6,
                              color: colors.brown,
                              "&:hover": { backgroundColor: colors.white },
                            }}
                          >
                            <Add sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Stack>

                        <IconButton
                          size="small"
                          onClick={() => handleRemove(item)}
                          sx={{
                            p: 0.5,
                            color: colors.gray,
                            "&:hover": {
                              color: "#e53935",
                              backgroundColor: colors.creamDark,
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <DeleteOutline sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            )}
          </AnimatePresence>
        </Box>

        {/* FOOTER */}
        {items.length > 0 && (
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 3,
              backgroundColor: colors.white,
              borderTop: `1px solid ${colors.brownMuted}20`,
              borderRadius: isMobile ? 0 : 0,
            }}
          >
            <Box
              sx={{
                backgroundColor: colors.creamDark,
                borderRadius: 2.5,
                p: 2.5,
                mb: 2.5,
                border: `1px solid ${colors.brownMuted}15`,
              }}
            >
              <PriceRow label="Subtotal" value={`$${totalPrice.toFixed(2)}`} />
              <PriceRow
                label="Shipping"
                value={shipping ? `$${shipping}` : "Free"}
                highlight={!shipping}
              />
              <PriceRow label="Tax" value={`$${tax.toFixed(2)}`} />

              <Divider
                sx={{ my: 1.75, borderColor: colors.brownMuted + "40" }}
              />

              <PriceRow label="Total" value={`$${total.toFixed(2)}`} strong />
            </Box>

            <Button
              fullWidth
              size="large"
              variant="contained"
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              sx={{
                py: 1.6,
                textTransform: "none",
                borderRadius: 3,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.4px",
                backgroundColor: colors.brown,
                "&:hover": {
                  backgroundColor: "#2d2620",
                  boxShadow: "0 8px 20px rgba(58, 47, 40, 0.25)",
                },
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(58, 47, 40, 0.15)",
              }}
              onClick={handleCheckout}
            >
              Checkout
            </Button>

            <Typography
              sx={{
                fontSize: 12,
                color: colors.brownLight,
                textAlign: "center",
                mt: 2,
                fontWeight: 400,
                letterSpacing: "0.2px",
              }}
            >
              Free shipping on orders over $100
            </Typography>
          </Box>
        )}
      </Drawer>

      {/* UNDO */}
      <Snackbar
        open={undoOpen}
        autoHideDuration={4000}
        onClose={() => setUndoOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          sx={{
            backgroundColor: colors.brown,
            color: colors.white,
            borderRadius: 2,
            "& .MuiAlert-icon": { color: colors.white },
          }}
          action={
            <Button
              size="small"
              sx={{ color: colors.white, fontWeight: 600 }}
              onClick={handleUndo}
            >
              Undo
            </Button>
          }
        >
          Item removed from cart
        </Alert>
      </Snackbar>
    </>
  );
};

/* ---------- COMPONENTS ---------- */

const EmptyState = ({ onBrowse }: { onBrowse: () => void }) => (
  <Box textAlign="center" py={10}>
    <Box
      sx={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        backgroundColor: colors.creamDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 3,
        border: `1px solid ${colors.brownMuted}25`,
      }}
    >
      <ShoppingBagOutlined sx={{ fontSize: 40, color: colors.brownLight }} />
    </Box>
    <Typography
      sx={{
        fontWeight: 700,
        color: colors.brown,
        fontSize: 18,
        mb: 1,
        letterSpacing: "0.3px",
      }}
    >
      Your cart is empty
    </Typography>
    <Typography
      sx={{
        fontSize: 14,
        color: colors.brownLight,
        mb: 3.5,
        fontWeight: 400,
      }}
    >
      Discover our beautiful collection
    </Typography>
    <Button
      onClick={onBrowse}
      variant="contained"
      sx={{
        borderRadius: 3,
        textTransform: "none",
        px: 5,
        py: 1.3,
        backgroundColor: colors.brown,
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: "0.3px",
        "&:hover": {
          backgroundColor: "#2d2620",
          boxShadow: "0 8px 20px rgba(58, 47, 40, 0.25)",
        },
        boxShadow: "0 4px 12px rgba(58, 47, 40, 0.15)",
        transition: "all 0.3s ease",
      }}
    >
      Browse Products
    </Button>
  </Box>
);

const PriceRow = ({
  label,
  value,
  strong,
  highlight,
}: {
  label: string;
  value: string;
  strong?: boolean;
  highlight?: boolean;
}) => (
  <Stack direction="row" justifyContent="space-between" mb={strong ? 0 : 0.9}>
    <Typography
      sx={{
        fontSize: strong ? 16 : 13.5,
        fontWeight: strong ? 700 : 500,
        color: colors.brown,
        letterSpacing: strong ? "0.3px" : "0px",
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: strong ? 16 : 13.5,
        fontWeight: strong ? 700 : 500,
        color: highlight ? colors.accent : colors.brown,
        letterSpacing: strong ? "0.3px" : "0px",
      }}
    >
      {value}
    </Typography>
  </Stack>
);

export default CartDrawer;
