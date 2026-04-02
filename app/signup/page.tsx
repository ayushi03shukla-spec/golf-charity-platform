"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    setMessage("Signup successful. Now login with your email and password.");
    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center px-4 text-slate-50">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-xl shadow-black/20"
      >
        <h1 className="text-2xl font-semibold text-white">Create Account</h1>

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
          required
        />

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
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {message && <p className="text-sm text-slate-300">{message}</p>}

        <p className="text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-300 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}