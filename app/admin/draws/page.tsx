import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

function generateRandomNumbers(count: number, min: number, max: number) {
  const nums = new Set<number>();

  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return Array.from(nums).sort((a, b) => a - b);
}

async function createDraw(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/user");

  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const drawType = String(formData.get("draw_type"));

  if (!month  !year  !drawType) return;

  await supabase.from("draws").insert({
    month,
    year,
    draw_type: drawType,
    status: "draft",
    winning_numbers: [],
    jackpot_carried_forward: 0,
  });

  revalidatePath("/admin/draws");
}

async function simulateDraw(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/user");

  const drawId = String(formData.get("draw_id"));

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw) return;

  const winningNumbers = generateRandomNumbers(5, 1, 45);

  await supabase
    .from("draws")
    .update({
      winning_numbers: winningNumbers,
      status: "simulated",
    })
    .eq("id", drawId);

  revalidatePath("/admin/draws");
}

async function publishDraw(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/user");

  const drawId = String(formData.get("draw_id"));

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw || !draw.winning_numbers || draw.winning_numbers.length !== 5) {
    return;
  }

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("role", "subscriber");

  if (!allUsers) return;

  await supabase.from("winners").delete().eq("draw_id", drawId);

  const winners3: { user_id: string }[] = [];
  const winners4: { user_id: string }[] = [];
  const winners5: { user_id: string }[] = [];

  for (const subscriber of allUsers) {
    const { data: scores } = await supabase
      .from("golf_scores")
      .select("score, played_at, created_at")
      .eq("user_id", subscriber.id)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (!scores || scores.length < 5) continue;

    const userNumbers = scores.map((s) => s.score);
    const matches = userNumbers.filter((n) =>
      draw.winning_numbers.includes(n)
    ).length;

    if (matches === 3) winners3.push({ user_id: subscriber.id });
    if (matches === 4) winners4.push({ user_id: subscriber.id });
    if (matches === 5) winners5.push({ user_id: subscriber.id });
  }

  const { count: activeSubscriberCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const totalPool = (activeSubscriberCount || 0) * 100;
  const pool5 = totalPool * 0.4;
  const pool4 = totalPool * 0.35;
  const pool3 = totalPool * 0.25;
  const payout5 = winners5.length > 0 ? pool5 / winners5.length : 0;
  const payout4 = winners4.length > 0 ? pool4 / winners4.length : 0;
  const payout3 = winners3.length > 0 ? pool3 / winners3.length : 0;

  for (const winner of winners5) {
    await supabase.from("winners").insert({
      draw_id: drawId,
      user_id: winner.user_id,
      match_type: "5-match",
      prize_amount: payout5,
      verification_status: "pending",
      payment_status: "pending",
    });
  }

  for (const winner of winners4) {
    await supabase.from("winners").insert({
      draw_id: drawId,
      user_id: winner.user_id,
      match_type: "4-match",
      prize_amount: payout4,
      verification_status: "pending",
      payment_status: "pending",
    });
  }

  for (const winner of winners3) {
    await supabase.from("winners").insert({
      draw_id: drawId,
      user_id: winner.user_id,
      match_type: "3-match",
      prize_amount: payout3,
      verification_status: "pending",
      payment_status: "pending",
    });
  }

  await supabase.from("prize_pools").insert({
    draw_id: drawId,
    total_pool: totalPool,
    pool_5_match: pool5,
    pool_4_match: pool4,
    pool_3_match: pool3,
    rollover_amount: winners5.length === 0 ? pool5 : 0,
  });

  await supabase
    .from("draws")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      jackpot_carried_forward: winners5.length === 0 ? pool5 : 0,
    })
    .eq("id", drawId);

  revalidatePath("/admin/draws");
  revalidatePath("/admin");
}

export default async function AdminDrawsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/user");

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: winners } = await supabase
    .from("winners")
    .select("draw_id, match_type, prize_amount");

  return (
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Manage Draws</h1>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-100 transition hover:bg-slate-800"
          >
            Back to Admin
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-xl font-medium text-white">Create Draw</h2>

          <form action={createDraw} className="grid gap-4 md:grid-cols-3">
            <input
              type="number"
              name="month"
              min="1"
              max="12"
              placeholder="Month"
              required
              className="rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
            />

            <input
              type="number"
              name="year"
              placeholder="Year"
              required
              className="rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
            />

            <select
              name="draw_type"
              required
              className="rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50"
            >
              <option value="">Select draw type</option>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
            <button
              type="submit"
              className="md:col-span-3 rounded-lg bg-blue-500 px-4 py-3 text-white transition hover:bg-blue-400"
            >
              Create Draw
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-xl font-medium text-white">All Draws</h2>

          {!draws || draws.length === 0 ? (
            <p className="text-slate-300">No draws created yet.</p>
          ) : (
            <div className="space-y-4">
              {draws.map((draw) => {
                const drawWinners =
                  winners?.filter((winner) => winner.draw_id === draw.id) || [];

                return (
                  <div
                    key={draw.id}
                    className="rounded-xl border border-slate-700 bg-[#0F172A] p-4"
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-white">
                        Draw: {draw.month}/{draw.year}
                      </p>
                      <p className="text-sm text-slate-300">
                        Type: {draw.draw_type}
                      </p>
                      <p className="text-sm text-slate-300">
                        Status: {draw.status}
                      </p>
                      <p className="text-sm text-slate-300">
                        Winning Numbers:{" "}
                        {draw.winning_numbers?.length
                          ? draw.winning_numbers.join(", ")
                          : "Not generated"}
                      </p>
                      <p className="text-sm text-slate-300">
                        Jackpot Carried Forward: ₹{" "}
                        {Number(draw.jackpot_carried_forward || 0).toFixed(2)}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <form action={simulateDraw}>
                          <input type="hidden" name="draw_id" value={draw.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800"
                          >
                            Simulate
                          </button>
                        </form>

                        <form action={publishDraw}>
                          <input type="hidden" name="draw_id" value={draw.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition hover:bg-blue-400"
                          >
                            Publish
                          </button>
                        </form>
                      </div>

                      {drawWinners.length > 0 && (
                        <div className="pt-3">
                          <p className="font-medium text-white">Winners</p>
                          <div className="mt-2 space-y-1 text-sm text-slate-300">
                            {drawWinners.map((winner, index) => (
                              <p key={index}>
                                {winner.match_type} — ₹{" "}
                                {Number(winner.prize_amount).toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}