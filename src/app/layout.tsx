import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MuiThemeProvider } from "@/components/ui/MuiThemeProvider";

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
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
