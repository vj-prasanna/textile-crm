import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MuiThemeProvider } from "@/components/ui/MuiThemeProvider";
import { AuthProvider } from "@/components/ui/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Textile CRM",
  description: "Customer Relationship Management for the Textile Industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <MuiThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
