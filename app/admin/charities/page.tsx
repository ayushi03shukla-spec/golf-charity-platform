import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function addCharity(formData: FormData) {
  "use server";

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

  if (profile?.role !== "admin") {
    redirect("/user");
  }

  const name = String(formData.get("name"));
  const description = String(formData.get("description"));
  const category = String(formData.get("category"));
  const upcomingEvents = String(formData.get("upcoming_events"));
  const featured = formData.get("featured") === "on";

  if (!name || !description || !category) {
    return;
  }

  await supabase.from("charities").insert({
    name,
    description,
    category,
    upcoming_events: upcomingEvents,
    featured,
    active: true,
  });

  revalidatePath("/admin/charities");
  revalidatePath("/user/charity");
  redirect("/admin/charities");
}

async function deleteCharity(formData: FormData) {
  "use server";

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

  if (profile?.role !== "admin") {
    redirect("/user");
  }

  const charityId = String(formData.get("charity_id"));

  await supabase
    .from("charities")
    .update({ active: false })
    .eq("id", charityId);

  revalidatePath("/admin/charities");
  revalidatePath("/user/charity");
  redirect("/admin/charities");
}

export default async function AdminCharitiesPage() {
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

  if (profile?.role !== "admin") {
    redirect("/user");
  }

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Manage Charities</h1>
          <Link href="/admin" className="rounded-lg border px-4 py-2">
            Back to Admin
          </Link>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-medium">Add Charity</h2>

          <form action={addCharity} className="grid gap-4">
            <input
              type="text"
              name="name"
              placeholder="Charity name"
              required
              className="rounded-lg border p-3"
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              required
              className="rounded-lg border p-3"
            />

            <textarea
              name="description"
              placeholder="Description"
              required
              className="min-h-28 rounded-lg border p-3"
            />

            <input
              type="text"
              name="upcoming_events"
              placeholder="Upcoming events"
              className="rounded-lg border p-3"
            />

            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" />
              <span>Featured charity</span>
            </label>

            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-3 text-white"
            >
              Add Charity
            </button>
          </form>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-medium">All Charities</h2>

          {!charities || charities.length === 0 ? (
            <p>No charities found.</p>
          ) : (
            <div className="space-y-4">
              {charities.map((charity) => (
                <div key={charity.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{charity.name}</p>
                      <p className="text-sm text-gray-600">{charity.category}</p>
                      <p className="mt-2 text-sm">{charity.description}</p>
                      <p className="mt-2 text-sm text-gray-600">
                        Upcoming Events: {charity.upcoming_events || "N/A"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Featured: {charity.featured ? "Yes" : "No"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Active: {charity.active ? "Yes" : "No"}
                      </p>
                    </div>

                    <form action={deleteCharity}>
                      <input type="hidden" name="charity_id" value={charity.id} />
                      <button
                        type="submit"
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        Deactivate
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}