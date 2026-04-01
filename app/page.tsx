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
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Golf Charity Subscription Platform
            </p>

            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Play smarter. Win monthly. Support a cause that matters.
            </h1>

            <p className="text-lg text-gray-600">
              Track your latest golf scores, join monthly prize draws, and
              contribute part of your subscription to your chosen charity.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-black px-5 py-3 text-white"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-lg border px-5 py-3"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border p-6 shadow-sm">
            <div className="space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-gray-600">Step 1</p>
                <p className="mt-1 font-medium">Subscribe monthly or yearly</p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-gray-600">Step 2</p>
                <p className="mt-1 font-medium">Enter your latest 5 golf scores</p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-gray-600">Step 3</p>
                <p className="mt-1 font-medium">Join monthly draw-based prizes</p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-gray-600">Step 4</p>
                <p className="mt-1 font-medium">Support your selected charity</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Track Performance</h2>
            <p className="mt-3 text-sm text-gray-600">
              Maintain your latest 5 Stableford scores with a clean, simple score flow.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Win Monthly Rewards</h2>
            <p className="mt-3 text-sm text-gray-600">
              Participate in monthly 3-match, 4-match, and 5-match prize categories.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Give with Impact</h2>
            <p className="mt-3 text-sm text-gray-600">
              Choose a charity and direct part of your subscription toward meaningful causes.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Charities</h2>
            <Link href="/charities" className="text-sm underline">
              View all
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {charities?.map((charity) => (
              <div key={charity.id} className="rounded-2xl border p-6">
                <p className="text-sm text-gray-500">{charity.category}</p>
                <h3 className="mt-2 text-lg font-semibold">{charity.name}</h3>
                <p className="mt-3 text-sm text-gray-600">
                  {charity.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}