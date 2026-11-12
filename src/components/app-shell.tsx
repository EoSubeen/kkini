"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  HeartPulse,
  Home,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/diagnosis/current", label: "진단", icon: HeartPulse },
  { href: "/recipe", label: "레시피", icon: BookOpenText },
  { href: "/check", label: "점검", icon: ShieldCheck },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/home") return pathname === href;
  return pathname.startsWith(href.split("/").slice(0, 2).join("/"));
}

export function ProductShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-viewport">
      <AppHeader />
      <main className="app-content">{children}</main>
      <nav className="bottom-nav" aria-label="주요 메뉴">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              className="bottom-nav__item"
              data-active={active}
              href={item.href}
              key={item.href}
              aria-current={active ? "page" : undefined}
            >
              <span className="bottom-nav__icon" aria-hidden="true">
                <Icon size={23} strokeWidth={active ? 2.3 : 1.8} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/home";

  return (
    <header className="app-header">
      <button
        className="icon-button"
        type="button"
        aria-label="이전 화면으로 돌아가기"
        onClick={() => router.back()}
        disabled={isHome}
      >
        <ArrowLeft size={24} aria-hidden="true" />
      </button>
      <Link className="brand-lockup" href="/home" aria-label="끼니 홈">
        <Image src="/kkini/logo-symbol.png" alt="" width={29} height={29} priority />
        <strong>끼니</strong>
      </Link>
      <span className="header-spacer" aria-hidden="true" />
    </header>
  );
}
