import Link from "next/link";
import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {trailing}
    </header>
  );
}

export function Card({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "soft" | "green" | "warm";
  className?: string;
}) {
  return <section className={`card card--${tone} ${className}`}>{children}</section>;
}

export function SectionHeading({
  title,
  action,
  description,
}: {
  title: string;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Metric({
  label,
  value,
  hint,
  status,
}: {
  label: string;
  value: string;
  hint?: string;
  status?: "good" | "warn" | "risk";
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small data-status={status}>{hint}</small> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${safe}%` }} />
    </div>
  );
}

export function SegmentTabs({
  items,
  current,
}: {
  items: { href: string; label: string }[];
  current: string;
}) {
  return (
    <nav className="segment-tabs" aria-label="화면 보기">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={item.href === current}
          aria-current={item.href === current ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export const diagnosisTabs = [
  { href: "/diagnosis/current", label: "현재 진단" },
  { href: "/diagnosis/timeline", label: "미래 타임라인" },
  { href: "/diagnosis/family", label: "가족 안전망" },
];

export const recipeTabs = [
  { href: "/recipe", label: "추천 조합" },
  { href: "/recipe/alternatives", label: "분야별 대안" },
  { href: "/recipe/plan", label: "실행 계획" },
];

export const checkTabs = [
  { href: "/check/shock", label: "충격 테스트" },
  { href: "/check", label: "계획 추적" },
  { href: "/check/report", label: "근거·리포트" },
];
