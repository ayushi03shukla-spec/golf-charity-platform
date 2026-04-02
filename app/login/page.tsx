"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center px-4 text-slate-50">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-xl shadow-black/20"
      >
        <h1 className="text-2xl font-semibold text-white">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-500 p-3 text-white transition hover:bg-blue-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="text-sm text-slate-300">{message}</p>}

        <p className="text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-300 underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}