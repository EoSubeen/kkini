import "@/styles/kkini.css";

// Auth pages may read URL parameters such as `next` at request time.
export const instant = false;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell">{children}</main>;
}
