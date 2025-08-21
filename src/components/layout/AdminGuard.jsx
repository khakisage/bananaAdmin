"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const MOCK = process.env.NEXT_PUBLIC_AUTH_MOCK === "true";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (MOCK) {
      setOk(true);
      return;
    }

    // 토큰 기반(빠른 구축):
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("banana_token")
        : null;
    if (!token) {
      const redirect = pathname || "/products";
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    // 서버 세션 기반일 경우(권장): 필요 시 /auth/me 같은 엔드포인트로 검증
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, { credentials: "include" })
    //  .then(r => r.ok ? setOk(true) : router.replace(`/login?redirect=${encodeURIComponent(pathname)}`));

    setOk(true);
  }, [router, pathname]);

  if (!ok) return null; // or 로딩 스피너
  return children;
}
