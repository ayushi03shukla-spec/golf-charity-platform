import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateTickets } from "../../../lib/generateTickets";

// ================== CREATE DRAW ==================
async function createDraw(formData: FormData) {
  "use server";

  console.log("CREATE DRAW TRIGGERED");

  const supabase = await createClient();

  const drawDateStr = String(formData.get("draw_date") || "");
  const jackpotStr = String(formData.get("jackpot") || "");
  const drawType = String(formData.get("draw_type") || "");

  const jackpot = Number(jackpotStr);

  console.log("FORM DATA RECEIVED:", { drawDateStr, jackpot, drawType });

  if (!drawDateStr || !jackpot || jackpot <= 0 || !drawType) {
    console.error("Missing or invalid required fields");
    return;
  }

  const drawDate = new Date(drawDateStr);
  if (isNaN(drawDate.getTime())) {
    console.error("Invalid draw_date format");
    return;
  }

  const month = drawDate.getMonth() + 1;
  const year = drawDate.getFullYear();

  const { data, error } = await supabase
    .from("draws")
    .insert({
      draw_date: drawDateStr,
      month: month,
      year: year,
      jackpot: jackpot,
      draw_type: drawType,
      status: "open",                    // ✅ Now allowed
    })
    .select();

  console.log("INSERT DATA:", data);
  console.log("INSERT ERROR:", error);

  if (error) {
    console.error("Failed to create draw:", error.message);
    return;
  }

  console.log("✅ Draw created successfully. Generating tickets...");
  await generateTickets();

  revalidatePath("/admin/draws");
}

// ================== SIMULATE DRAW ==================
async function simulateDraw(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const drawId = String(formData.get("draw_id"));

  if (!drawId) return;

  const winningNumbers = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 45) + 1
  ).sort((a, b) => a - b);

  const { error } = await supabase
    .from("draws")
    .update({
      winning_numbers: winningNumbers,
      status: "simulated",
    })
    .eq("id", drawId);

  if (error) console.error("Simulate error:", error.message);
  else console.log(`✅ Draw ${drawId} simulated`);

  revalidatePath("/admin/draws");
}

// ================== PUBLISH DRAW ==================
async function publishDraw(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const drawId = String(formData.get("draw_id"));

  if (!drawId) return;

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw?.winning_numbers) return;

  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("draw_id", drawId);

  if (tickets?.length) {
    for (const ticket of tickets) {
      const ticketNumbers = ticket.numbers as number[];
      const winningNumbers = draw.winning_numbers as number[];
      const matches = ticketNumbers.filter((n) => winningNumbers.includes(n)).length;

      if (matches >= 3) {
        await supabase.from("winners").insert({
          draw_id: drawId,
          user_id: ticket.user_id,
          match_type: `match_${matches}`,
          prize_amount: matches === 3 ? 100 : matches === 4 ? 500 : 1000,
          payment_status: "pending",
        });
      }
    }
  }

  await supabase
    .from("draws")
    .update({ status: "published" })
    .eq("id", drawId);

  revalidatePath("/admin/draws");
  revalidatePath("/admin/winners");
}

// ================== PAGE UI ==================
export default async function AdminDrawsPage() {
  const supabase = await createClient();

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6 text-white bg-[#0B1020] min-h-screen">
      <h1 className="text-2xl font-semibold">Draw Management</h1>

      {/* CREATE DRAW FORM */}
      <form action={createDraw} className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Draw Date</label>
          <input
            type="date"
            name="draw_date"
            required
            className="bg-black border border-slate-700 px-3 py-2 rounded w-40"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Jackpot (₹)</label>
          <input
            type="number"
            name="jackpot"
            placeholder="1000000"
            required
            className="bg-black border border-slate-700 px-3 py-2 rounded w-40"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Draw Type</label>
          <select
            name="draw_type"
            required
            className="bg-black border border-slate-700 px-3 py-2 rounded w-40"
          >
            <option value="random">Random</option>
            <option value="regular">Regular</option>
            <option value="charity">Charity</option>
            <option value="golf">Golf Special</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition-colors"
        >
          Create New Draw
        </button>
      </form>

      {/* DRAW LIST */}
      <div className="space-y-4">
        {draws?.length === 0 && <p className="text-gray-400">No draws yet.</p>}

        {draws?.map((draw) => (
          <div
            key={draw.id}
            className="bg-[#121A2F] p-5 rounded-2xl border border-slate-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium">
                  {new Date(draw.draw_date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-2xl font-semibold text-emerald-400">
                  ₹ {Number(draw.jackpot).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  draw.status === "published" ? "bg-green-500/20 text-green-400" :
                  draw.status === "simulated" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {draw.status.toUpperCase()}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Type: <span className="capitalize">{draw.draw_type}</span>
                </p>
              </div>
            </div>

            {draw.winning_numbers ? (
              <p className="mt-4 text-sm">
                <span className="text-gray-400">Winning Numbers:</span>{" "}
                <span className="font-mono text-lg tracking-widest">
                  {draw.winning_numbers.join(" • ")}
                </span>
              </p>
            ) : (
              <p className="mt-4 text-sm text-gray-400">Winning numbers not generated yet</p>
            )}

            <div className="flex gap-3 mt-6">
              {draw.status === "open" && (
                <form action={simulateDraw}>
                  <input type="hidden" name="draw_id" value={draw.id} />
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-lg font-medium">
                    Simulate Draw
                  </button>
                </form>
              )}

              {draw.status === "simulated" && (
                <form action={publishDraw}>
                  <input type="hidden" name="draw_id" value={draw.id} />
                  <button type="submit" className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg font-medium">
                    Publish Results
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}