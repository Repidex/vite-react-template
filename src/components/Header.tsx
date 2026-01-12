import React, { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  type LinkProps,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  Divider,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
  alpha,
  Stack,
  Button,
  Avatar,
  Chip,
  type BoxProps,
} from "@mui/material";
import {
  Menu as MenuIcon,
  SearchOutlined,
  ShoppingBagOutlined,
  PersonOutlined,
  FavoriteBorderOutlined,
  AccountCircleOutlined,
  ReceiptOutlined,
  LogoutOutlined,
  DiamondOutlined,
  Close,
  HomeOutlined,
  CollectionsOutlined,
  InfoOutlined,
  LoginOutlined,
  PersonAddOutlined,
  Add,
  Remove,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useCart } from "../providers/CartContext";
import logo from "../assets/logo_black.png";
import { useAuth } from "../providers/AuthProvider";
import SearchBar from "./SearchBar";
import MobileDrawer from "./MobileDrawer";

// Background color constant
const BACKGROUND_COLOR = "rgb(246, 242, 238)";

// Custom styled components
const MinimalBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    fontSize: "0.5rem",
    fontWeight: 500,
    minWidth: 16,
    height: 16,
    padding: 0,
    border: `1px solid ${BACKGROUND_COLOR}`,
  },
}));

const LogoBox = styled(Box)<BoxProps & LinkProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  textDecoration: "none",
  color: "inherit",
}));

const LogoImage = styled("img")({
  width: 25,
  height: 25,
  objectFit: "contain",
});

const LogoText = styled(Typography)(() => ({
  fontWeight: 300,
  color: "#000",
  fontSize: "1.1rem",
  textTransform: "uppercase",
}));

const MinimalIconButton = styled(IconButton)(() => ({
  padding: 2,
  color: "#000",
  "&:hover": {
    backgroundColor: alpha("#000", 0.05),
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontSize: "0.8rem",
  fontWeight: 400,
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, signOut } = useAuth();
  const {
    openCart,
    totalItems,
    cartItems = [],
    isCartOpen,
    closeCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
  } = useCart();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateToWishlist = () => {
    navigate("wishlist");
  };
  const handleSignOut = () => {
    signOut();
    handleUserMenuClose();
    navigate("/");
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  const navItems = [
    { path: "/", label: "Home", icon: <HomeOutlined /> },
    {
      path: "/all-jewellery",
      label: "All Jewellery",
      icon: <CollectionsOutlined />,
    },
    { path: "/about", label: "About Us", icon: <InfoOutlined /> },
  ];

  const userMenuItems = user
    ? [
        { label: "Profile", icon: <AccountCircleOutlined />, path: "/profile" },
        { label: "Orders", icon: <ReceiptOutlined />, path: "/orders" },
        {
          label: "Wishlist",
          icon: <FavoriteBorderOutlined />,
          path: "/wishlist",
        },
      ]
    : [
        { label: "Sign In", icon: <LoginOutlined />, path: "/login" },
        { label: "Register", icon: <PersonAddOutlined />, path: "/register" },
      ];

  // Mobile drawer content
  const mainDrawerContent = (
    <MobileDrawer
      onDrawerToggle={handleDrawerToggle}
      user={user}
      navItems={navItems}
      userMenuItems={userMenuItems}
      onSignOut={handleSignOut}
      onCategorySelect={(categoryId?: string | null) => {
        // Navigate to all-jewellery, optionally with a category query param
        if (categoryId) {
          navigate(`/all-jewellery?category=${encodeURIComponent(categoryId)}`);
        } else {
          navigate(`/all-jewellery`);
        }
      }}
    />
  );

  // Cart drawer content - Modern minimalist
  const cartDrawerContent = (
    <Box
      sx={{
        width: { xs: "100%", sm: 380 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: BACKGROUND_COLOR,
      }}
    >
      {/* Cart Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha("#000", 0.08)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h6" fontWeight={400}>
            Cart
          </Typography>
          {totalItems > 0 && (
            <Chip
              label={totalItems}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 400,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
          )}
        </Stack>
        <MinimalIconButton onClick={closeCart} size="small">
          <Close />
        </MinimalIconButton>
      </Box>

      {/* Cart Items */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {!cartItems || cartItems.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                border: `1px solid ${alpha("#000", 0.06)}`,
              }}
            >
              <ShoppingBagOutlined
                sx={{ fontSize: 32, color: alpha("#000", 0.3) }}
              />
            </Box>
            <Typography variant="body1" fontWeight={400} gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add items to get started
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                closeCart();
                navigate("/all-jewellery");
              }}
              sx={{
                borderRadius: "8px",
                borderColor: alpha("#000", 0.2),
                color: "#000",
                fontWeight: 400,
              }}
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {cartItems.map((item, index) => (
              <ListItem
                key={item.id || index}
                sx={{
                  py: 2,
                  px: 0,
                  borderBottom: `1px solid ${alpha("#000", 0.06)}`,
                }}
              >
                <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      border: `1px solid ${alpha("#000", 0.06)}`,
                      flexShrink: 0,
                    }}
                  >
                    {item.image ? (
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
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
                        }}
                      >
                        <DiamondOutlined
                          sx={{ color: alpha("#000", 0.3), fontSize: 20 }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        sx={{ flex: 1, pr: 1 }}
                      >
                        {item.name || "Product"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.id)}
                        sx={{
                          width: 20,
                          height: 20,
                          padding: 0,
                          color: alpha("#000", 0.4),
                          "&:hover": {
                            color: "error.main",
                            backgroundColor: alpha("#000", 0.04),
                          },
                        }}
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mt: "auto" }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                          backgroundColor: alpha("#000", 0.04),
                          borderRadius: "6px",
                          padding: "2px",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => decrementQuantity(item.id)}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            border: "none",
                            "&:hover": {
                              backgroundColor: alpha("#000", 0.08),
                            },
                          }}
                        >
                          <Remove sx={{ fontSize: 14 }} />
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{
                            minWidth: 28,
                            textAlign: "center",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          {item.quantity || 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => incrementQuantity(item.id)}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            border: "none",
                            "&:hover": {
                              backgroundColor: alpha("#000", 0.08),
                            },
                          }}
                        >
                          <Add sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Cart Footer */}
      {cartItems && cartItems.length > 0 && (
        <Box
          sx={{
            p: 3,
            borderTop: `1px solid ${alpha("#000", 0.08)}`,
            backgroundColor: "#fff",
          }}
        >
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                ₹
                {cartItems
                  .reduce(
                    (sum, item) =>
                      sum + (item.price || 0) * (item.quantity || 1),
                    0
                  )
                  .toFixed(2)}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Shipping calculated at checkout
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                closeCart();
                navigate("/cart");
              }}
              sx={{
                borderRadius: "8px",
                py: 1.25,
                backgroundColor: "#000",
                color: "#fff",
                fontWeight: 400,
                "&:hover": {
                  backgroundColor: alpha("#000", 0.9),
                },
              }}
            >
              Proceed to Checkout
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );

  // Mobile Header with user icon
  const mobileHeader = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        px: 2,
      }}
    >
      {/* Menu Icon */}
      <MinimalIconButton onClick={handleDrawerToggle} sx={{ mr: 1 }}>
        <MenuIcon />
      </MinimalIconButton>

      {/* Logo and Title - aligned to start */}
      <LogoBox component={Link} to="/" sx={{ mr: "auto" }}>
        <LogoImage src={logo} alt="SilverQala" />
        <LogoText>SILVERQALA</LogoText>
      </LogoBox>

      {/* Action Icons */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <MinimalIconButton onClick={handleSearchToggle}>
          <SearchOutlined />
        </MinimalIconButton>
        <MinimalIconButton onClick={navigateToWishlist}>
          <FavoriteBorderOutlined />
        </MinimalIconButton>
        <MinimalIconButton onClick={openCart}>
          <MinimalBadge badgeContent={totalItems || 0}>
            <ShoppingBagOutlined />
          </MinimalBadge>
        </MinimalIconButton>
        <MinimalIconButton onClick={handleUserMenuOpen}>
          {user ? (
            <UserAvatar>{user.email?.charAt(0).toUpperCase()}</UserAvatar>
          ) : (
            <PersonOutlined />
          )}
        </MinimalIconButton>
      </Stack>
    </Box>
  );

  // Desktop Header
  const desktopHeader = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ width: "100%" }}
    >
      {/* Logo */}
      <LogoBox component={Link} to="/">
        <LogoImage src={logo} alt="SilverQala" />
        <LogoText>SILVERQALA</LogoText>
      </LogoBox>

      {/* Navigation */}
      <Stack
        direction="row"
        spacing={3}
        sx={{ mx: 4, flex: 1, justifyContent: "center" }}
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: location.pathname === item.path ? 500 : 400,
                color:
                  location.pathname === item.path ? "#000" : alpha("#000", 0.7),
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  width: location.pathname === item.path ? "100%" : 0,
                  height: "1px",
                  backgroundColor: "#000",
                  transition: "width 0.2s ease",
                },
                "&:hover": {
                  color: "#000",
                  "&::after": {
                    width: "100%",
                  },
                },
              }}
            >
              {item.label}
            </Typography>
          </Link>
        ))}
      </Stack>

      {/* Action Icons */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <MinimalIconButton onClick={handleSearchToggle}>
          <SearchOutlined />
        </MinimalIconButton>
        <MinimalIconButton onClick={openCart}>
          <MinimalBadge badgeContent={totalItems || 0}>
            <ShoppingBagOutlined />
          </MinimalBadge>
        </MinimalIconButton>
        <MinimalIconButton onClick={handleUserMenuOpen}>
          {user ? (
            <UserAvatar>{user.email?.charAt(0).toUpperCase()}</UserAvatar>
          ) : (
            <PersonOutlined />
          )}
        </MinimalIconButton>
      </Stack>
    </Stack>
  );

  return (
    <>
      {/* Search Bar Modal */}
      <SearchBar open={showSearch} onClose={() => setShowSearch(false)} />

      {/* Main AppBar */}
      <AppBar
        position={isMobile ? "static" : "sticky"}
        elevation={0}
        sx={{
          bgcolor: BACKGROUND_COLOR,
          borderBottom: `1px solid ${alpha("#000", 0.08)}`,
          transition: "all 0.2s ease",
          top: isMobile ? "auto" : 0,
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg" disableGutters={isMobile}>
          <Toolbar
            sx={{
              px: { xs: 0, md: 0 },
              minHeight: { xs: 64, md: 72 },
              transition: "min-height 0.2s ease",
            }}
          >
            {isMobile ? mobileHeader : desktopHeader}
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu for mobile/desktop */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: "8px",
            backgroundColor: "#fff",
            border: `1px solid ${alpha("#000", 0.06)}`,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1,
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: alpha("#000", 0.04),
              },
            },
          },
        }}
      >
        {user
          ? [
              <Box
                key="user-info"
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${alpha("#000", 0.06)}`,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {user.email?.split("@")[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>,
              ...userMenuItems.map((item) => (
                <MenuItem
                  key={item.label}
                  component={Link}
                  to={item.path}
                  onClick={handleUserMenuClose}
                >
                  {item.icon}
                  <Typography variant="body2" sx={{ ml: 1.5 }}>
                    {item.label}
                  </Typography>
                </MenuItem>
              )),
              <Divider key="divider" sx={{ my: 1 }} />,
              <MenuItem key="sign-out" onClick={handleSignOut}>
                <LogoutOutlined fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1.5 }}>
                  Sign Out
                </Typography>
              </MenuItem>,
            ]
          : userMenuItems.map((item) => (
              <MenuItem
                key={item.label}
                component={Link}
                to={item.path}
                onClick={handleUserMenuClose}
              >
                {item.icon}
                <Typography variant="body2" sx={{ ml: 1.5 }}>
                  {item.label}
                </Typography>
              </MenuItem>
            ))}
      </Menu>

      {/* Main Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            // Slightly wider responsive sidebar on mobile, with fixed widths on larger breakpoints (+10px)
            width: { xs: "85%", sm: 390, md: 430 },
            maxWidth: 490,
            boxSizing: "border-box",
            bgcolor: BACKGROUND_COLOR,
          },
        }}
      >
        {mainDrawerContent}
      </Drawer>

      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={closeCart}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 380 },
            boxSizing: "border-box",
            bgcolor: BACKGROUND_COLOR,
          },
        }}
      >
        {cartDrawerContent}
      </Drawer>
    </>
  );
};

export default Header;
