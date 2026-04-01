"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-semibold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black text-white p-3"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}