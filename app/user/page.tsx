import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(`
      plan_type,
      status,
      charity_percentage,
      charity_id
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  // charity
  let charityName = "Not selected";

  if (subscription?.charity_id) {
    const { data: charity } = await supabase
      .from("charities")
      .select("name")
      .eq("id", subscription.charity_id)
      .single();

    charityName = charity?.name || "Not selected";
  }

  // winnings summary
  const { data: winners } = await supabase
    .from("winners")
    .select("prize_amount")
    .eq("user_id", user.id);

  const totalWinnings =
    winners?.reduce(
      (sum, w) => sum + Number(w.prize_amount || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Welcome, {profile?.full_name}
          </h1>

          <form action="/logout" method="post">
            <button className="rounded-lg border border-slate-600 px-4 py-2 text-slate-100 hover:bg-slate-800">
              Logout
            </button>
          </form>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6">
          <h2 className="text-lg font-medium text-white mb-3">
            Profile
          </h2>

          <p className="text-slate-300 text-sm">
            Name: {profile?.full_name}
          </p>

          <p className="text-slate-300 text-sm">
            Email: {profile?.email}
          </p>

          <p className="text-slate-300 text-sm">
            Role: {profile?.role}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          
          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5">
            <p className="text-sm text-slate-300">
              Subscription
            </p>
            <p className="text-xl font-semibold text-white mt-2">
              {subscription?.status || "Inactive"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5">
            <p className="text-sm text-slate-300">
              Charity
            </p>
            <p className="text-xl font-semibold text-white mt-2">
              {charityName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5">
            <p className="text-sm text-slate-300">
              Total Winnings
            </p>
            <p className="text-xl font-semibold text-white mt-2">
              ₹ {totalWinnings.toFixed(2)}
            </p>
          </div>

        </div>

        {/* Subscription Details */}
        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6">
          <h2 className="text-lg font-medium text-white mb-3">
            Subscription Details
          </h2>

          <p className="text-sm text-slate-300">
            Plan Type: {subscription?.plan_type || "monthly"}
          </p>

          <p className="text-sm text-slate-300">
            Status: {subscription?.status || "inactive"}
          </p>
          <p className="text-sm text-slate-300">
            Charity Contribution:{" "}
            {subscription?.charity_percentage || 0}%
          </p>
        </div>

        {/* Navigation */}
        <div className="grid gap-4 md:grid-cols-3">

          <Link
            href="/user/charity"
            className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 hover:bg-slate-800"
          >
            <h3 className="text-white font-medium">
              Choose Charity
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Select charity & contribution %
            </p>
          </Link>

          <Link
            href="/user/winnings"
            className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 hover:bg-slate-800"
          >
            <h3 className="text-white font-medium">
              My Winnings
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Submit proof & track payments
            </p>
          </Link>

          <Link
            href="/user/scores"
            className="rounded-2xl border border-slate-700 bg-[#121A2F] p-5 hover:bg-slate-800"
          >
            <h3 className="text-white font-medium">
              My Scores
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              View your draw numbers
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
}