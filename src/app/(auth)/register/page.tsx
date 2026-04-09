"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
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
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered. Try signing in.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak. Use at least 8 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #1B4F72 0%, #2E86C1 100%)" }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <Typography variant="h6" className="!text-white !font-bold">
              Textile CRM
            </Typography>
          </div>
        </div>

        <div className="space-y-6">
          <Typography variant="h3" className="!text-white !font-bold !leading-tight">
            Start managing your business today
          </Typography>
          <Typography className="!text-blue-100 !text-lg">
            Join hundreds of textile businesses who use our CRM to grow their revenue and streamline operations.
          </Typography>

          <div className="space-y-4 pt-4">
            {[
              "Track all your customers & suppliers",
              "Manage orders from creation to delivery",
              "AI-powered sales forecasts & insights",
              "Real-time payment tracking",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <Typography className="!text-blue-100">{feature}</Typography>
              </div>
            ))}
          </div>
        </div>

        <Typography className="!text-blue-300 !text-sm">
          © 2026 Textile CRM. Built for the textile industry.
        </Typography>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Box className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1B4F72" }}>
              <span className="text-white font-bold">T</span>
            </div>
            <Typography variant="h6" className="!font-bold" style={{ color: "#1B4F72" }}>
              Textile CRM
            </Typography>
          </div>

          <Typography variant="h4" className="!font-bold !text-gray-900 !mb-2">
            Create an account
          </Typography>
          <Typography className="!text-gray-500 !mb-8">
            Set up your CRM in under a minute
          </Typography>

          {error && (
            <Alert severity="error" className="!mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <TextField
              label="Full Name"
              fullWidth
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              autoComplete="name"
            />
            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              helperText="Minimum 8 characters"
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              autoComplete="new-password"
            />
            <TextField
              label="Your Role"
              select
              fullWidth
              required
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
            >
              <MenuItem value="admin">Admin — Full access</MenuItem>
              <MenuItem value="sales">Sales Rep — Limited access</MenuItem>
            </TextField>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: "#1B4F72",
                py: 1.5,
                mt: 1,
                "&:hover": { bgcolor: "#154360" },
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <Typography className="!text-center !mt-6 !text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#1B4F72" }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </div>
    </div>
  );
}
