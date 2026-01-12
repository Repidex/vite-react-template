import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

import {
  Avatar,
  Button,
  TextField,
  Chip,
  CircularProgress,
  AppBar,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";

import { Shield, Settings } from "lucide-react";

/* ================= TYPES ================= */

type Profile = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  updated_at?: string | null;
};

/* ================= COMPONENT ================= */

const Profile = () => {
  const { user, isLoading: authLoading, userRole, refreshUserRole } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  /* ================= FUNCTIONS ================= */

  const fetchProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data?.full_name || "");

      await refreshUserRole();
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated");
      fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  /* ================= LOADING ================= */

  if (authLoading || isLoading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      {/* ===== SIMPLE NAVIGATION ===== */}
      <AppBar position="fixed" elevation={0} sx={{ background: "#111827" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography fontWeight={600}>My App</Typography>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        minHeight="100vh"
        pt={12}
        px={2}
        sx={{
          background: "linear-gradient(135deg, #f8f5f0, #f3e9d7, #e9dcc9)",
        }}
      >
        <Box maxWidth={600} mx="auto">
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={700}
            mb={4}
            color="#3d2c13"
          >
            My Profile
          </Typography>

          <Box
            p={4}
            borderRadius={3}
            bgcolor="white"
            boxShadow="0 10px 30px rgba(0,0,0,0.12)"
          >
            {/* ===== HEADER ===== */}
            <Box display="flex" gap={3} alignItems="center" mb={4}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "#92400e",
                  fontSize: 32,
                }}
                src={profile?.avatar_url || undefined}
              >
                {profile?.full_name ? getInitials(profile.full_name) : "U"}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {profile?.full_name || "User"}
                </Typography>

                <Typography color="text.secondary">{user?.email}</Typography>

                {userRole && (
                  <Chip
                    icon={<Shield size={14} />}
                    label={userRole === "admin" ? "Admin" : "User"}
                    sx={{
                      mt: 1,
                      bgcolor: userRole === "admin" ? "#991b1b" : "#92400e",
                      color: "white",
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* ===== FORM ===== */}
            <TextField
              label="Full Name"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              margin="normal"
            />

            <TextField
              label="Email"
              fullWidth
              value={user?.email || ""}
              disabled
              margin="normal"
            />

            <TextField
              label="Role"
              fullWidth
              value={userRole === "admin" ? "Administrator" : "User"}
              disabled
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: "#92400e",
                "&:hover": { bgcolor: "#78350f" },
              }}
              onClick={updateProfile}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            {userRole === "admin" && (
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                startIcon={<Settings size={16} />}
                onClick={() => navigate("/admin-panel")}
              >
                Go to Admin Panel
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Profile;
