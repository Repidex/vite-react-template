import React, { useState, type JSX } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
  Paper,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ShoppingCart as OrdersIcon,
  ViewCarousel as SlidersIcon,
  Category as CategoryIcon,
  Inventory as ItemsIcon,
  People as UsersIcon,
} from "@mui/icons-material";
import SliderManager from "./AdminPages/SliderManager";
import CategoryManager from "./AdminPages/CategoryImage";
import ItemManager from "./AdminPages/ItemManager";
import UserManager from "./AdminPages/UserManagement";
import AllOrdersManager from "./AdminPages/AllOrdersManager";

/* ================= TYPES ================= */
type TabKey = "overview" | "categories" | "items" | "users" | "orders";

interface TabConfig {
  key: TabKey;
  label: string;
  title: string;
  subtitle: string;
  component: JSX.Element;
  icon: JSX.Element;
}

/* ================= TAB CONFIG ================= */
const TABS: TabConfig[] = [
  {
    key: "orders",
    label: "All Orders",
    title: "Order Management",
    subtitle: "View and manage all customer orders",
    component: <AllOrdersManager />,
    icon: <OrdersIcon />,
  },
  {
    key: "overview",
    label: "Add Sliders",
    title: "Dashboard Overview",
    subtitle: "Manage sliders & featured content",
    component: <SliderManager />,
    icon: <SlidersIcon />,
  },
  {
    key: "categories",
    label: "Categories",
    title: "Category Management",
    subtitle: "Organize and manage product categories",
    component: <CategoryManager />,
    icon: <CategoryIcon />,
  },
  {
    key: "items",
    label: "Items",
    title: "Item Management",
    subtitle: "Manage products, pricing & inventory",
    component: <ItemManager />,
    icon: <ItemsIcon />,
  },
  {
    key: "users",
    label: "Users",
    title: "User Management",
    subtitle: "Control users, roles & access",
    component: <UserManager />,
    icon: <UsersIcon />,
  },
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 260;

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily: "Tenor Sans, serif",
            color: "#fff",
            mb: 0.5,
          }}
        >
          Admin Panel
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255, 255, 255, 0.6)" }}
        >
          v1.0
        </Typography>
      </Box>

      <List sx={{ px: 2, py: 2 }}>
        {TABS.map((tab) => (
          <ListItem key={tab.key} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                color:
                  activeTab === tab.key ? "#fff" : "rgba(255, 255, 255, 0.6)",
                bgcolor:
                  activeTab === tab.key
                    ? "rgba(99, 102, 241, 0.15)"
                    : "transparent",
                borderLeft:
                  activeTab === tab.key
                    ? "3px solid #6366f1"
                    : "3px solid transparent",
                "&:hover": {
                  bgcolor:
                    activeTab === tab.key
                      ? "rgba(99, 102, 241, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    activeTab === tab.key
                      ? "#6366f1"
                      : "rgba(255, 255, 255, 0.6)",
                  minWidth: 40,
                }}
              >
                {tab.icon}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* App Bar for Mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "#111827",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 600 }}
            >
              {currentTab.label}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#111827",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#111827",
              borderRight: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 },
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#111827",
                fontFamily: "Tenor Sans, serif",
                mb: 0.5,
              }}
            >
              {currentTab.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              {currentTab.subtitle}
            </Typography>
          </Box>

          {/* Page Content */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {currentTab.component}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
