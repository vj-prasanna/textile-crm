"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { PageTransition } from "@/components/animations/PageTransition";
import { useThemeStore } from "@/store/useThemeStore";
import { useContacts } from "@/hooks/useContacts";

/** Subscribes to contacts once for the entire authenticated session so
 *  the Topbar search can read from the Zustand store without creating
 *  its own duplicate Firestore listener. */
function ContactsSubscriber() {
  useContacts();
  return null;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleMenuToggle() {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setCollapsed((prev) => !prev);
    } else {
      setMobileOpen(true);
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: dark ? "#060B18" : "#F1F5F9" }}
    >
      {/* Subscribe to contacts once for global search */}
      <ContactsSubscriber />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Right: topbar + content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuToggle={handleMenuToggle} />
        <main className="flex-1 overflow-auto p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
