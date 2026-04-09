"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#4F8EF7" : "#2563EB",
            light: "#6BA3F9",
            dark: "#1D4ED8",
          },
          secondary: {
            main: "#F7924F",
          },
          background: {
            default: mode === "dark" ? "#060B18" : "#EEF2FF",
            paper: mode === "dark" ? "#0F172A" : "#FFFFFF",
          },
          text: {
            primary: mode === "dark" ? "#F1F5F9" : "#1E293B",
            secondary: mode === "dark" ? "#94A3B8" : "#64748B",
          },
        },
        typography: {
          fontFamily: "var(--font-inter), sans-serif",
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
