import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
type UserRole = "admin" | "user";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: UserRole | null;
  userName: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signInWithOtp: (email: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  verifyOtp: (
    email: string,
    token: string
  ) => Promise<{
    error: Error | null;
    data: { session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  refreshUserName: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Try to get initial values from localStorage
  const getInitialUserRole = () => {
    try {
      return localStorage.getItem("userRole") as UserRole | null;
    } catch {
      return null;
    }
  };
  const getInitialUserName = () => {
    try {
      return localStorage.getItem("userName") || null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(
    getInitialUserRole()
  );
  const [userName, setUserName] = useState<string | null>(getInitialUserName());
  const navigate = useNavigate();

  const refreshUserRole = async () => {
    if (!user) {
      setUserRole(null);
      localStorage.removeItem("userRole");
      return;
    }

    try {
      // First, try to get the user's role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        if (roleError.code === "PGRST116") {
          const { count } = await supabase
            .from("user_roles")
            .select("*", { count: "exact", head: true });
          const role = count === 0 ? "admin" : "user";
          const { error: insertError } = await supabase
            .from("user_roles")
            .insert([{ id: user.id, role }]);
          if (insertError) {
            console.error("Error creating role:", insertError);
            return;
          }
          setUserRole(role);
          localStorage.setItem("userRole", role);
          return;
        }
        console.error("Unexpected error:", roleError);
        return;
      }
      setUserRole((roleData?.role as UserRole) || "user");
      localStorage.setItem("userRole", (roleData?.role as UserRole) || "user");
    } catch (error) {
      console.error("Error in refreshUserRole:", error);
      setUserRole("user");
      localStorage.setItem("userRole", "user");
    }
  };

  // Fetch and store user name from profiles
  const refreshUserName = async () => {
    if (!user) {
      setUserName(null);
      localStorage.removeItem("userName");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error fetching user name:", error);
        return;
      }
      setUserName(data?.full_name || null);
      if (data?.full_name) {
        localStorage.setItem("userName", data.full_name);
      } else {
        localStorage.removeItem("userName");
      }
    } catch (error) {
      console.error("Error in refreshUserName:", error);
    }
  };

  // Add a real-time subscription to user_roles changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user_roles_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("User role changed:", payload);
          refreshUserRole();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          refreshUserRole();
          refreshUserName();
        }, 0);
      } else {
        setUserRole(null);
        setUserName(null);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshUserRole();
        refreshUserName();
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!response.error && response.data.session) {
      toast.success("Successfully signed in!");
      // Fetch and store user role and name
      setTimeout(() => {
        refreshUserRole();
        refreshUserName();
      }, 0);
      navigate("/");
    }
    return response;
  };

  const signInWithOtp = async (email: string) => {
    const response = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/verify-otp`,
      },
    });

    if (!response.error) {
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email } });
    }

    return response;
  };

  // AuthProvider.tsx
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      // 🔴 User already exists
      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already exists")
        ) {
          return {
            error: new Error("An account with this email already exists"),
            data: { user: null, session: null },
          };
        }

        return {
          error,
          data: { user: null, session: null },
        };
      }

      return {
        error: null,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (err) {
      return {
        error: new Error("Unexpected error during sign up"),
        data: { user: null, session: null },
      };
    }
  };

  // Add a new function to create profile after email verification
  const createUserProfile = async (
    userId: string,
    email: string,
    fullName: string
  ) => {
    try {
      // First try to update existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email: email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError && !updateError.message.includes("No rows found")) {
        console.error("Error updating profile:", updateError);
        return {
          error: updateError,
          data: null,
        };
      }

      // If no profile exists, create a new one
      if (updateError?.message.includes("No rows found")) {
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: userId,
            email: email,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return {
            error: insertError,
            data: null,
          };
        }
      }

      return { error: null, data: true };
    } catch (err) {
      console.error("Unexpected error in createUserProfile:", err);
      return {
        error: new Error("An unexpected error occurred while creating profile"),
        data: null,
      };
    }
  };

  // Update verifyOtp to create profile after successful verification
  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        console.error("OTP verification error:", error);
        return { error, data: { session: null } };
      }

      if (data?.user) {
        // Create profile after successful verification
        const profileResult = await createUserProfile(
          data.user.id,
          email,
          data.user.user_metadata.full_name
        );

        if (profileResult.error) {
          console.error("Profile creation error:", profileResult.error);
          return { error: profileResult.error, data: { session: null } };
        }

        // Get the session after verification
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          return { error: sessionError, data: { session: null } };
        }

        if (sessionData.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          toast.success("Successfully verified OTP!");
          navigate("/");
          return { error: null, data: { session: sessionData.session } };
        }
      }

      return { error: null, data: { session: null } };
    } catch (err) {
      console.error("Unexpected error during OTP verification:", err);
      return {
        error: new Error(
          "An unexpected error occurred during OTP verification"
        ),
        data: { session: null },
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully signed out");
    navigate("/login");
  };

  const value = {
    user,
    session,
    isLoading,
    userRole,
    userName,
    signIn,
    signUp,
    signInWithOtp,
    verifyOtp,
    signOut,
    refreshUserRole,
    refreshUserName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
