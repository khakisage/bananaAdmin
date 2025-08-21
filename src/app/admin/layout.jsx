// app/(admin)/layout.jsx
import AdminShell from "@/components/layout/AdminShell";

export default function AdminLayout({ children }) {
  // 이 파일은 서버 컴포넌트(기본). 클라이언트 로직은 AdminShell에서 처리.
  return <AdminShell>{children}</AdminShell>;
}
