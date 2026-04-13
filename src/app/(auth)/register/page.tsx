"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { registerWithEmail } from "@/lib/firebase/auth";
import { useThemeStore } from "@/store/useThemeStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function RegisterPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.name, form.role as "admin" | "sales");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered. Try signing in.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
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
    "& .MuiSelect-icon": {
      color: dark ? "#94A3B8" : "#64748B",
    },
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
      style={{
        background: dark
          ? "linear-gradient(135deg, #060B18 0%, #0D1B2A 50%, #060E1F 100%)"
          : "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #EDE9FE 100%)",
      }}
    >
      {/* Animated blobs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-blob"
        style={{ background: dark ? "#6366F1" : "#818CF8" }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-blob animation-delay-2000"
        style={{ background: dark ? "#8B5CF6" : "#C4B5FD" }}
      />
      <div
        className="absolute top-[30%] left-[20%] w-[350px] h-[350px] rounded-full blur-[100px] opacity-10 animate-blob animation-delay-4000"
        style={{ background: dark ? "#3B82F6" : "#93C5FD" }}
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
        <div className="flex items-center gap-3 mb-7">
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
          Create an account
        </Typography>
        <Typography style={{ color: dark ? "#94A3B8" : "#64748B", marginBottom: 24, fontSize: 15 }}>
          Set up your CRM in under a minute
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField
            label="Full Name" fullWidth required
            value={form.name} onChange={(e) => handleChange("name", e.target.value)}
            autoComplete="name" sx={inputSx}
          />
          <TextField
            label="Email address" type="email" fullWidth required
            value={form.email} onChange={(e) => handleChange("email", e.target.value)}
            autoComplete="email" sx={inputSx}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth required
            value={form.password} onChange={(e) => handleChange("password", e.target.value)}
            helperText="Minimum 8 characters"
            autoComplete="new-password"
            sx={{
              ...inputSx,
              "& .MuiFormHelperText-root": { color: dark ? "#475569" : "#94A3B8" },
            }}
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
          <TextField
            label="Confirm Password" type="password" fullWidth required
            value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)}
            autoComplete="new-password" sx={inputSx}
          />
          <TextField
            label="Your Role" select fullWidth required
            value={form.role} onChange={(e) => handleChange("role", e.target.value)}
            sx={{
              ...inputSx,
              "& .MuiSelect-select": { color: dark ? "#F1F5F9" : "#1E293B" },
            }}
            slotProps={{
              select: {
                MenuProps: {
                  slotProps: {
                    paper: {
                      sx: {
                        background: dark ? "rgba(15,23,42,0.95)" : "#FFFFFF",
                        backdropFilter: "blur(20px)",
                        border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 2,
                        "& .MuiMenuItem-root": {
                          color: dark ? "#F1F5F9" : "#1E293B",
                          "&:hover": { background: dark ? "rgba(79,142,247,0.12)" : "rgba(79,142,247,0.06)" },
                        },
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="admin">Admin — Full access</MenuItem>
            <MenuItem value="sales">Sales Rep — Limited access</MenuItem>
          </TextField>

          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={loading}
            sx={{
              mt: 0.5, py: 1.5, borderRadius: "10px", fontWeight: 700, fontSize: 15,
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
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <Typography sx={{ textAlign: "center", mt: 3, fontSize: 14, color: dark ? "#64748B" : "#94A3B8" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#4F8EF7", fontWeight: 600, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </Typography>
      </div>
    </div>
  );
}
