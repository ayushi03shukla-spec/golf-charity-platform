import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserPage() {
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

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_type, status, renewal_date, charity_percentage, charity_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let selectedCharityName = "Not selected";

  if (subscription?.charity_id) {
    const { data: charity } = await supabase
      .from("charities")
      .select("name")
      .eq("id", subscription.charity_id)
      .maybeSingle();

    selectedCharityName = charity?.name || "Not selected";
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">User Dashboard</h1>
          <form action="/logout" method="post">
            <button className="rounded-lg border px-4 py-2">Logout</button>
          </form>
        </div>

        <div className="rounded-2xl border p-6">
          <p>Name: {profile?.full_name}</p>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="mb-3 text-xl font-medium">Subscription Status</h2>
          <p>Status: {subscription?.status || "inactive"}</p>
          <p>Plan: {subscription?.plan_type || "not selected"}</p>
          <p>
            Renewal Date:{" "}
            {subscription?.renewal_date
              ? String(subscription.renewal_date)
              : "not available"}
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="mb-3 text-xl font-medium">Charity Contribution</h2>
          <p>Selected Charity: {selectedCharityName}</p>
          <p>
            Contribution Percentage:{" "}
            {subscription?.charity_percentage || 10}%
          </p>

          <Link
            href="/user/charity"
            className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white"
          >
            Choose / Update Charity
          </Link>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-medium mb-3">Score Management</h2>
          <p className="mb-4">Add and manage your latest 5 golf scores.</p>
          <Link
            href="/user/scores"
            className="inline-block rounded-lg bg-black px-4 py-2 text-white"
          >
            Go to Scores
          </Link>
        </div>
           <div className="rounded-2xl border p-6">
               <h2 className="text-xl font-medium mb-3">Winnings</h2>
               <p className="mb-4">View prize status and submit winner proof.</p>
               <Link
                    href="/user/winnings"
                    className="inline-block rounded-lg bg-black px-4 py-2 text-white"
                >
                     View Winnings
                </Link>
            </div>
        </div>
    </div>
  );
}