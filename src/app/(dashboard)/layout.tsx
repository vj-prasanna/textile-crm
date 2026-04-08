export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — Phase 3 */}
      <aside className="w-64 bg-[#1B4F72] text-white flex-shrink-0 flex items-center justify-center">
        <span className="text-sm opacity-60">Sidebar — Phase 3</span>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
