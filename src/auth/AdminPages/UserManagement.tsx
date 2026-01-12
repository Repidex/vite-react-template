import { useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";
import {
  Box,
  Card,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Security";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  role: "admin" | "user";
}

const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("id", profile.id)
            .single();

          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            role: (roleData?.role || "user") as "admin" | "user",
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Header Card */}
      <Card>
        <CardHeader
          avatar={<ShieldIcon color="primary" />}
          title="User Management"
          subheader={`Total Users: ${users.length}`}
        />
      </Card>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      {getInitials(user.full_name)}
                    </Avatar>
                    <Typography fontWeight={500}>
                      {user.full_name || "Anonymous"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === "admin" ? "error" : "default"}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManager;
