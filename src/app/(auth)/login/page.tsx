"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { useThemeStore } from "@/store/useThemeStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
        setError("Invalid email or password.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(10px)",
      borderRadius: "10px",
      color: dark ? "#F1F5F9" : "#1E293B",
      "& fieldset": {
        borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
      },
      "&:hover fieldset": {
        borderColor: dark ? "rgba(79,142,247,0.5)" : "rgba(37,99,235,0.4)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4F8EF7",
        boxShadow: "0 0 0 3px rgba(79,142,247,0.15)",
      },
    },
    "& .MuiInputLabel-root": {
      color: dark ? "rgba(241,245,249,0.5)" : "rgba(30,41,59,0.5)",
      "&.Mui-focused": { color: "#4F8EF7" },
    },
    "& .MuiInputBase-input": {
      color: dark ? "#F1F5F9" : "#1E293B",
    },
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
      style={{
        background: dark
          ? "linear-gradient(135deg, #060B18 0%, #0D1B2A 50%, #060E1F 100%)"
          : "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #EDE9FE 100%)",
      }}
    >
      {/* Animated blobs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-blob"
        style={{ background: dark ? "#3B82F6" : "#818CF8" }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-blob animation-delay-2000"
        style={{ background: dark ? "#8B5CF6" : "#A78BFA" }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 animate-blob animation-delay-4000"
        style={{ background: dark ? "#06B6D4" : "#67E8F9" }}
      />

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8"
        style={{
          background: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.7)",
          boxShadow: dark
            ? "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 25px 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
              boxShadow: "0 4px 15px rgba(79,142,247,0.4)",
            }}
          >
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <Typography
            variant="h6"
            style={{ color: dark ? "#F1F5F9" : "#1E293B", fontWeight: 700 }}
          >
            Textile CRM
          </Typography>
        </div>

        <Typography
          variant="h4"
          style={{ color: dark ? "#F1F5F9" : "#1E293B", fontWeight: 700, marginBottom: 4 }}
        >
          Welcome back
        </Typography>
        <Typography style={{ color: dark ? "#94A3B8" : "#64748B", marginBottom: 28, fontSize: 15 }}>
          Sign in to your account to continue
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Google */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          startIcon={<Google />}
          sx={{
            mb: 3,
            py: 1.4,
            borderRadius: "10px",
            borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            color: dark ? "#F1F5F9" : "#1E293B",
            background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
            fontWeight: 500,
            "&:hover": {
              borderColor: "#4F8EF7",
              background: dark ? "rgba(79,142,247,0.08)" : "rgba(79,142,247,0.06)",
            },
          }}
        >
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </Button>

        <Divider sx={{ mb: 3, borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
          <Typography sx={{ fontSize: 12, color: dark ? "#475569" : "#94A3B8", px: 1 }}>
            or continue with email
          </Typography>
        </Divider>

        <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField label="Email address" type="email" fullWidth required
            value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" sx={inputSx}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth required
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            sx={inputSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)} edge="end" size="small"
                      sx={{ color: dark ? "#94A3B8" : "#64748B" }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={loading}
            sx={{
              mt: 1, py: 1.5, borderRadius: "10px", fontWeight: 700, fontSize: 15,
              background: "linear-gradient(135deg, #4F8EF7, #6366F1)",
              boxShadow: "0 4px 20px rgba(79,142,247,0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #3B82F6, #4F46E5)",
                boxShadow: "0 6px 25px rgba(79,142,247,0.5)",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "translateY(0)" },
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Typography sx={{ textAlign: "center", mt: 3, fontSize: 14, color: dark ? "#64748B" : "#94A3B8" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "#4F8EF7",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create one
          </Link>
        </Typography>
      </div>
    </div>
  );
}
