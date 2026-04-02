import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, featured, category")
    .eq("active", true)
    .order("featured", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-[#0B1020] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-14">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">
              Golf Charity Subscription Platform
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
              Play smarter. Win monthly. Support a cause that matters.
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Track your latest golf scores, join monthly prize draws, and
              contribute part of your subscription to your chosen charity.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-400"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-slate-500 px-6 py-3 font-medium text-slate-100 transition hover:bg-slate-800"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-700 bg-gradient-to-br from-[#121A2F] via-[#111827] to-[#0B1020] p-6 shadow-2xl shadow-blue-950/20">
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-500/20 bg-slate-900/60 p-4">
                <p className="text-sm text-blue-300">Step 1</p>
                <p className="mt-1 font-medium text-white">
                  Subscribe monthly or yearly
                </p>
              </div>

              <div className="rounded-2xl border border-teal-500/20 bg-slate-900/60 p-4">
                <p className="text-sm text-teal-300">Step 2</p>
                <p className="mt-1 font-medium text-white">
                  Enter your latest 5 golf scores
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4">
                <p className="text-sm text-amber-300">Step 3</p>
                <p className="mt-1 font-medium text-white">
                  Join monthly draw-based prizes
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-4">
                <p className="text-sm text-purple-300">Step 4</p>
                <p className="mt-1 font-medium text-white">
                  Support your selected charity
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">
              Track Performance
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Maintain your latest 5 Stableford scores with a clean, simple
              score flow.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">
              Win Monthly Rewards
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Participate in monthly 3-match, 4-match, and 5-match prize
              categories.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">
              Give with Impact
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Choose a charity and direct part of your subscription toward
              meaningful causes.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-white">
              Featured Charities
            </h2>
            <Link
              href="/charities"
              className="text-sm font-medium text-blue-300 underline underline-offset-4 hover:text-blue-200"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {charities?.map((charity) => (
              <div
                key={charity.id}
                className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20"
              >
                <p className="text-sm text-teal-300">{charity.category}</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {charity.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {charity.description}
                </p>

                {charity.featured && (
                  <span className="mt-5 inline-block rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-300">
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}