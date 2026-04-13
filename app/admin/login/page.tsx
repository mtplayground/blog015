import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string): string {
  switch (error) {
    case "missing_password":
      return "Enter your admin password.";
    case "invalid_credentials":
      return "Incorrect password.";
    case "server_config":
      return "Server authentication is not configured correctly.";
    default:
      return "";
  }
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const existingSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingSessionToken) {
    try {
      if (await verifySessionToken(existingSessionToken)) {
        redirect("/admin");
      }
    } catch (error) {
      console.error("Failed to verify existing admin session:", error);
    }
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12">
      <section className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Admin Login</h1>
        <p className="mt-2 text-sm text-zinc-600">Enter your admin password to continue.</p>

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form action={loginAction} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
