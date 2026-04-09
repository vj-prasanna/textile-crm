"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
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

export default function LoginPage() {
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
      const msg = err instanceof Error ? err.message : "Login failed";
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
            Manage your textile business smarter
          </Typography>
          <Typography className="!text-blue-100 !text-lg">
            Track customers, orders, payments, and get AI-powered insights — all in one place.
          </Typography>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: "Customers", value: "500+" },
              { label: "Orders Tracked", value: "10K+" },
              { label: "Revenue Managed", value: "₹5Cr+" },
              { label: "AI Insights", value: "Daily" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <Typography className="!text-white !font-bold !text-2xl">{stat.value}</Typography>
                <Typography className="!text-blue-200 !text-sm">{stat.label}</Typography>
              </div>
            ))}
          </div>
        </div>

        <Typography className="!text-blue-300 !text-sm">
          © 2026 Textile CRM. Built for the textile industry.
        </Typography>
      </div>

      {/* Right Panel — Login Form */}
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
            Welcome back
          </Typography>
          <Typography className="!text-gray-500 !mb-8">
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" className="!mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Google Sign-In */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            startIcon={<Google />}
            sx={{
              borderColor: "#e2e8f0",
              color: "#374151",
              py: 1.5,
              mb: 3,
              "&:hover": { borderColor: "#1B4F72", bgcolor: "#f8fafc" },
            }}
          >
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <Divider className="!mb-3">
            <Typography className="!text-gray-400 !text-sm">or sign in with email</Typography>
          </Divider>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Typography className="!text-center !mt-6 !text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#1B4F72" }}>
              Create one
            </Link>
          </Typography>
        </Box>
      </div>
    </div>
  );
}
