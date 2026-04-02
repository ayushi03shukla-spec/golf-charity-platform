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
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <form action="/logout" method="post">
            <button className="rounded-lg border px-4 py-2">Logout</button>
          </form>
        </div>

        <div className="rounded-2xl border p-6">
          <p>Name: {profile?.full_name}</p>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{totalUsers || 0}</p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-600">Total Charities</p>
            <p className="mt-2 text-2xl font-semibold">{totalCharities || 0}</p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-600">Total Subscriptions</p>
            <p className="mt-2 text-2xl font-semibold">
              {totalSubscriptions || 0}
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-gray-600">Total Draws</p>
            <p className="mt-2 text-2xl font-semibold">{totalDraws || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <p className="text-sm text-gray-600">Charity Contribution Total</p>
          <p className="mt-2 text-2xl font-semibold">
            ₹ {totalDonationAmount.toFixed(2)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/charities"
            className="rounded-2xl border p-5 hover:bg-gray-50"
          >
            <h2 className="text-lg font-medium">Manage Charities</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add, view, and delete charity listings.
            </p>
          </Link>

          <Link
            href="/admin/draws"
            className="rounded-2xl border p-5 hover:bg-gray-50"
          >
            <h2 className="text-lg font-medium">Manage Draws</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create, simulate, and publish draw results.
            </p>
          </Link>

          <Link
            href="/admin/winners"
            className="rounded-2xl border p-5 hover:bg-gray-50"
          >
            <h2 className="text-lg font-medium">Winner Verification</h2>
            <p className="mt-2 text-sm text-gray-600">
              Review proof submissions and update payout status.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}