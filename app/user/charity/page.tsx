import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function saveCharitySelection(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const charityId = String(formData.get("charity_id"));
  const charityPercentage = Number(formData.get("charity_percentage"));

  if (!charityId || charityPercentage < 10) {
    return;
  }

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingSubscription) {
    await supabase
      .from("subscriptions")
      .update({
        charity_id: charityId,
        charity_percentage: charityPercentage,
      })
      .eq("user_id", user.id);
  } else {
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_type: "monthly",
      status: "inactive",
      charity_id: charityId,
      charity_percentage: charityPercentage,
    });
  }

  revalidatePath("/user");
  revalidatePath("/user/charity");
}

export default async function CharityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, category, featured, active")
    .eq("active", true)
    .order("featured", { ascending: false });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("charity_id, charity_percentage, plan_type, status")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Choose Your Charity</h1>
          <Link href="/user" className="rounded-lg border px-4 py-2">
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-medium">Charity Preference</h2>

          <form action={saveCharitySelection} className="space-y-4">
            <select
              name="charity_id"
              defaultValue={subscription?.charity_id || ""}
              required
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select a charity</option>
              {charities?.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name} — {charity.category}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="charity_percentage"
              min="10"
              max="100"
              defaultValue={subscription?.charity_percentage || 10}
              required
              className="w-full rounded-lg border p-3"
            />

            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-3 text-white"
            >
              Save Charity Preference
            </button>
          </form>

          <p className="mt-3 text-sm text-gray-600">
            Minimum charity contribution is 10%.
          </p>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-medium">Available Charities</h2>

          <div className="space-y-4">
            {charities?.map((charity) => (
              <div key={charity.id} className="rounded-xl border p-4">
                <p className="font-medium">{charity.name}</p>
                <p className="text-sm text-gray-600">{charity.category}</p>
                <p className="mt-2 text-sm">{charity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}