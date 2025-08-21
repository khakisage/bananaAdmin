"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // (빠른 구축) 토큰/세션 클리어
    try {
      // localStorage 토큰 사용 시:
      if (typeof window !== "undefined") {
        localStorage.removeItem("banana_token");
      }
      // Express에서 세션쿠키를 썼다면, 서버 로그아웃 엔드포인트 호출:
      // await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, {
      //   method: "POST",
      //   credentials: "include",
      // });
    } finally {
      router.replace("/public/login");
    }
  };

  return (
    <Button size="sm" variant="destructive" onClick={handleLogout}>
      로그아웃
    </Button>
  );
}
