import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { logoutAction } from "./actions";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  let showAdminShell = false;

  if (token) {
    try {
      showAdminShell = await verifySessionToken(token);
    } catch (error) {
      console.error("Failed to verify session token in admin layout:", error);
    }
  }

  if (!showAdminShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Admin</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
