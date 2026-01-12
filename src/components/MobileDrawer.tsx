import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  Typography,
  Stack,
  Button,
  Avatar,
  alpha,
  IconButton,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Close,
  Instagram,
  Facebook,
  YouTube,
  WhatsApp,
  ChevronRight,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { supabase } from "../supabase/client";

const colors = {
  background: "rgb(246, 242, 238)",
  surface: "#FFFFFF",
  primary: "#3d3333",
  secondary: "#3d3333",
  accent: "#3d3333",
  border: "rgba(26, 26, 26, 0.08)",
  lightGray: "#F5F5F5",
  darkGray: "#333333",
};

// Styled components
const DrawerContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 480,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: colors.background,
  overflow: "hidden",
  position: "relative",
  boxShadow: "24px 0 48px rgba(0, 0, 0, 0.08)",
  [theme.breakpoints.down("md")]: {
    maxWidth: 440,
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: 400,
  },
}));

const CloseButton = styled(IconButton)(() => ({
  width: 36,
  height: 36,
  borderRadius: "8px",
  backgroundColor: "transparent",
  color: colors.primary,
  border: `1px solid ${colors.border}`,
  "&:hover": {
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const NavItem = styled(ListItemButton)<{
  component: React.ElementType;
  to: string;
  active?: boolean;
}>(({ active }) => ({
  padding: "12px 20px",
  margin: "0",
  borderRadius: "0",
  color: active ? colors.primary : colors.secondary,
  backgroundColor: "transparent",
  borderRight: `3px solid ${active ? colors.primary : "transparent"}`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(colors.primary, 0.03),
    borderRight: `3px solid ${alpha(colors.primary, 0.5)}`,
  },
}));

const CategoryItem = styled(ListItemButton)<{ active?: boolean }>(
  ({ active }) => ({
    padding: "12px 20px",
    margin: "0",
    borderRadius: "0",
    color: active ? colors.primary : colors.secondary,
    backgroundColor: "transparent",
    borderRight: `3px solid ${active ? colors.primary : "transparent"}`,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: alpha(colors.primary, 0.03),
      borderRight: `3px solid ${alpha(colors.primary, 0.5)}`,
    },
  })
);

interface NavItemType {
  path: string;
  label: string;
}

interface UserMenuItem {
  label: string;
  path: string;
}

interface Category {
  id: string;
  name: string;
}

interface MobileDrawerProps {
  onDrawerToggle: () => void;
  user: any;
  navItems: NavItemType[];
  userMenuItems: UserMenuItem[];
  onSignOut: () => void;
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  onDrawerToggle,
  user,
  navItems,
  userMenuItems,
  onSignOut,
  onCategorySelect,
  selectedCategory,
}) => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");

        if (!error && data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect?.(categoryId);
    onDrawerToggle();
  };

  // Separate "About" from other nav items
  const regularNavItems = navItems.filter((item) => item.label !== "About Us");
  const aboutItem = navItems.find((item) => item.label === "About Us");

  return (
    <DrawerContainer>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <CloseButton size="small" onClick={onDrawerToggle}>
          <Close sx={{ fontSize: 20 }} />
        </CloseButton>
      </Box>

      <Divider sx={{ borderColor: colors.border }} />

      {/* Navigation Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(colors.primary, 0.12),
            borderRadius: 2,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: alpha(colors.primary, 0.2),
          },
        }}
      >
        {/* Main Navigation Items (except About) */}
        <List sx={{ p: 0 }}>
          {/* Regular Nav Items (except About) */}
          {regularNavItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <React.Fragment key={item.path}>
                <NavItem
                  component={Link}
                  to={item.path}
                  onClick={onDrawerToggle}
                  active={isActive}
                  sx={{
                    animation: "slideIn 0.3s ease forwards",
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    transform: "translateX(-20px)",
                    "@keyframes slideIn": {
                      to: {
                        opacity: 1,
                        transform: "translateX(0)",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: isActive ? 500 : 400,
                            fontSize: "0.9375rem",
                            color: isActive ? colors.primary : colors.secondary,
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </Typography>
                        <ChevronRight
                          sx={{
                            color: isActive ? colors.primary : colors.secondary,
                            fontSize: "1.25rem",
                          }}
                        />
                      </Box>
                    }
                  />
                </NavItem>
                <Divider sx={{ borderColor: colors.border, my: 0 }} />
              </React.Fragment>
            );
          })}

          {/* Category List - Displayed Directly */}
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              <CategoryItem
                active={selectedCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
                sx={{
                  animation: "slideIn 0.3s ease forwards",
                  animationDelay: `${(regularNavItems.length + index) * 0.05}s`,
                  opacity: 0,
                  transform: "translateX(-20px)",
                  "@keyframes slideIn": {
                    to: {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: selectedCategory === category.id ? 500 : 400,
                      fontSize: "0.9375rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {category.name}
                  </Typography>
                  <ChevronRight
                    sx={{
                      color:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.secondary,
                      fontSize: "1.25rem",
                    }}
                  />
                </Box>
              </CategoryItem>
              <Divider sx={{ borderColor: colors.border, my: 0 }} />
            </React.Fragment>
          ))}

          {aboutItem && (
            <React.Fragment>
              <NavItem
                component={Link}
                to={aboutItem.path}
                onClick={onDrawerToggle}
                active={location.pathname === aboutItem.path}
                sx={{
                  animation: "slideIn 0.3s ease forwards",
                  animationDelay: `${
                    (regularNavItems.length + categories.length) * 0.05
                  }s`,
                  opacity: 0,
                  transform: "translateX(-20px)",
                  "@keyframes slideIn": {
                    to: {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight:
                            location.pathname === aboutItem.path ? 500 : 400,
                          fontSize: "0.9375rem",
                          color:
                            location.pathname === aboutItem.path
                              ? colors.primary
                              : colors.secondary,
                          textTransform: "uppercase",
                        }}
                      >
                        {aboutItem.label}
                      </Typography>
                      <ChevronRight
                        sx={{
                          color:
                            location.pathname === aboutItem.path
                              ? colors.primary
                              : colors.secondary,
                          fontSize: "1.25rem",
                        }}
                      />
                    </Box>
                  }
                />
              </NavItem>
              <Divider sx={{ borderColor: colors.border, my: 0 }} />
            </React.Fragment>
          )}
        </List>

        {/* User Menu - Only show if user exists */}
        {user && userMenuItems.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                padding: "12px 20px 8px",
                color: alpha(colors.primary, 0.5),
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
                fontSize: "0.6875rem",
              }}
            >
              Account
            </Typography>
            <List sx={{ p: 0 }}>
              {userMenuItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <NavItem
                    component={Link}
                    to={item.path}
                    onClick={onDrawerToggle}
                    sx={{
                      animation: "slideIn 0.3s ease forwards",
                      animationDelay: `${index * 0.05}s`,
                      opacity: 0,
                      transform: "translateX(-20px)",
                      "@keyframes slideIn": {
                        to: {
                          opacity: 1,
                          transform: "translateX(0)",
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 400,
                            fontSize: "0.9375rem",
                            color: colors.secondary,
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                  </NavItem>
                  <Divider sx={{ borderColor: colors.border, my: 0 }} />
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 3, backgroundColor: colors.background }}>
        {/* User Actions */}
        {user ? (
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: colors.surface,
                  color: colors.primary,
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  border: `1px solid ${colors.border}`,
                }}
              >
                {user.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    mb: 0.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email?.split("@")[0]}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.secondary, fontSize: "0.8125rem" }}
                >
                  Signed in
                </Typography>
              </Box>
            </Stack>
            <Button
              fullWidth
              variant="outlined"
              onClick={onSignOut}
              sx={{
                borderRadius: "8px",
                py: 1,
                borderColor: colors.border,
                color: colors.primary,
                fontWeight: 400,
                textTransform: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: colors.darkGray,
                  backgroundColor: alpha(colors.primary, 0.02),
                },
              }}
            >
              Sign Out
            </Button>
          </Stack>
        ) : (
          <Box>
            <Box
              component={Link}
              to="/login"
              onClick={onDrawerToggle}
              sx={{
                display: "block",
                textAlign: "left",
                py: 1,
                textDecoration: "none",
                color: colors.primary,
                fontSize: "0.9375rem",
                fontWeight: 500,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: colors.darkGray,
                  transform: "translateX(4px)",
                },
              }}
            >
              Log in
            </Box>
            <Divider sx={{ borderColor: colors.border, mt: 1, mb: 2 }} />
          </Box>
        )}

        {/* Social Media Icons */}
        <Stack
          direction="row"
          spacing={0}
          justifyContent="center"
          gap={1.5}
          sx={{
            mt: 2,
          }}
        >
          <IconButton
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.primary,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(colors.primary, 0.05),
                borderColor: colors.primary,
                transform: "translateY(-2px)",
              },
            }}
          >
            <Instagram sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.primary,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(colors.primary, 0.05),
                borderColor: colors.primary,
                transform: "translateY(-2px)",
              },
            }}
          >
            <WhatsApp sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.primary,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(colors.primary, 0.05),
                borderColor: colors.primary,
                transform: "translateY(-2px)",
              },
            }}
          >
            <Facebook sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.primary,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(colors.primary, 0.05),
                borderColor: colors.primary,
                transform: "translateY(-2px)",
              },
            }}
          >
            <YouTube sx={{ fontSize: 22 }} />
          </IconButton>
        </Stack>

        {/* Copyright */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2,
            color: alpha(colors.primary, 0.4),
            fontSize: "0.75rem",
            letterSpacing: "0.02em",
          }}
        >
          © {new Date().getFullYear()} Silverqala
        </Typography>
      </Box>
    </DrawerContainer>
  );
};

export default MobileDrawer;
