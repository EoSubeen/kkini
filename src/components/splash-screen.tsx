"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/login");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(() => router.replace("/login"), media.matches ? 250 : 1100);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash-shell" aria-label="끼니 시작 화면">
      <div className="splash-mark" aria-hidden="true">
        <Image src="/kkini/logo-symbol.png" alt="" width={82} height={76} priority />
      </div>
      <div className="splash-copy">
        <h1>끼니</h1>
        <p>세대 사이 끼인 당신을 위한<br />맞춤형 재무설계</p>
      </div>
      <button className="splash-skip" type="button" onClick={() => router.replace("/login")}>바로 시작하기</button>
    </main>
  );
}
