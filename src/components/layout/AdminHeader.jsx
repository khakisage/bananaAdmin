"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "@/components/layout/LogoutButton";

export default function AdminHeader() {
  const pathname = usePathname();

  const NavLink = ({ href, children }) => {
    const active = pathname.startsWith(href);
    return (
      <Link href={href} className="no-underline">
        <Button variant={active ? "default" : "outline"} size="sm">
          {children}
        </Button>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* 왼쪽: 네비게이션 */}
        <div className="flex items-center gap-2">
          <Menubar className="border-none p-0">
            <MenubarMenu>
              <MenubarTrigger asChild>
                <NavLink href="/admin/products">상품 등록</NavLink>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger asChild>
                <NavLink href="/admin/sales">상품 판매내역</NavLink>
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* 오른쪽: 로그아웃 */}
        <div className="flex items-center gap-2">
          <Separator orientation="vertical" className="h-6" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
