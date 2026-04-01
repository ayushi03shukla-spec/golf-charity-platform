"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Signup successful. Check your email if confirmation is enabled.");
    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSignup} className="w-full max-w-md space-y-4 rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-semibold">Create Account</h1>

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border p-3"
          required
        />

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
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}