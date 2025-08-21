"use client";

import AdminHeader from "@/components/layout/AdminHeader";
import AdminGuard from "@/components/layout/AdminGuard";

export default function AdminShell({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-dvh flex flex-col">
        <AdminHeader />
        <main className="flex-1">{children}</main>
      </div>
    </AdminGuard>
  );
}
