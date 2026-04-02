import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/user");
  }

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalCharities } = await supabase
    .from("charities")
    .select("*", { count: "exact", head: true });

  const { count: totalSubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true });

  const { count: totalDraws } = await supabase
    .from("draws")
    .select("*", { count: "exact", head: true });

  const { data: donations } = await supabase
    .from("donations")
    .select("amount");

  const totalDonationAmount =
    donations?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
          <form action="/logout" method="post">
            <button className="rounded-lg border border-slate-600 px-4 py-2 text-slate-100 transition hover:bg-slate-800">
              Logout
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
          <p>Name: {profile?.full_name}</p>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-500/30 bg-[#121A2F] p-5 shadow-lg shadow-black/20">
            <p className="text-sm text-slate-300">Total Users</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {totalUsers || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-teal-500/30 bg-[#121A2F] p-5 shadow-lg shadow-black/20">
            <p className="text-sm text-slate-300">Total Charities</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {totalCharities || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-[#121A2F] p-5 shadow-lg shadow-black/20">
            <p className="text-sm text-slate-300">Total Subscriptions</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {totalSubscriptions || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-[#121A2F] p-5 shadow-lg shadow-black/20">
            <p className="text-sm text-slate-300">Total Draws</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {totalDraws || 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 shadow-lg shadow-black/20">
          <p className="text-sm text-slate-300">Charity Contribution Total</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            ₹ {totalDonationAmount.toFixed(2)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/charities"
            className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 transition hover:bg-slate-800"
            >
            <h2 className="text-lg font-medium text-white">Manage Charities</h2>
            <p className="mt-2 text-sm text-slate-300">
              Add, view, and deactivate charity listings.
            </p>
          </Link>

          <Link
            href="/admin/draws"
            className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 transition hover:bg-slate-800"
          >
            <h2 className="text-lg font-medium text-white">Manage Draws</h2>
            <p className="mt-2 text-sm text-slate-300">
              Create, simulate, and publish draw results.
            </p>
          </Link>

          <Link
            href="/admin/winners"
            className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 transition hover:bg-slate-800"
          >
            <h2 className="text-lg font-medium text-white">Winner Verification</h2>
            <p className="mt-2 text-sm text-slate-300">
              Review proof submissions and update payout status.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}