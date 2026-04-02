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
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Choose Your Charity
          </h1>
          <Link
            href="/user"
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-100 transition hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-xl font-medium text-white">
            Charity Preference
          </h2>

          <form action={saveCharitySelection} className="space-y-4">
            <select
              name="charity_id"
              defaultValue={subscription?.charity_id || ""}
              required
              className="w-full rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50"
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
              className="w-full rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-3 text-white transition hover:bg-blue-400"
            >
              Save Charity Preference
            </button>
          </form>
          <p className="mt-3 text-sm text-slate-300">
            Minimum charity contribution is 10%.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-xl font-medium text-white">
            Available Charities
          </h2>

          <div className="space-y-4">
            {charities?.map((charity) => (
              <div
                key={charity.id}
                className="rounded-xl border border-slate-700 bg-[#0F172A] p-4"
              >
                <p className="font-medium text-white">{charity.name}</p>
                <p className="text-sm text-teal-300">{charity.category}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {charity.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}