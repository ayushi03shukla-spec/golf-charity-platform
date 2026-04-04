import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

// ✅ APPROVE
async function approveWinner(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const winnerId = String(formData.get("winner_id"));

  await supabase
    .from("winners")
    .update({ verification_status: "approved" })
    .eq("id", winnerId);

  revalidatePath("/admin/winners");
  revalidatePath("/user/winnings");
}

// ❌ REJECT
async function rejectWinner(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const winnerId = String(formData.get("winner_id"));

  await supabase
    .from("winners")
    .update({ verification_status: "rejected" })
    .eq("id", winnerId);

  revalidatePath("/admin/winners");
  revalidatePath("/user/winnings");
}

// 💰 MARK PAID
async function markPaid(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const winnerId = String(formData.get("winner_id"));

  await supabase
    .from("winners")
    .update({ payment_status: "paid" })
    .eq("id", winnerId);

  revalidatePath("/admin/winners");
  revalidatePath("/user/winnings");
}

// 🧾 PAGE
export default async function AdminWinnersPage() {
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

  const { data: winners } = await supabase
    .from("winners")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Winner Verification
          </h1>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800"
          >
            Back to Admin
          </Link>
        </div>

        {!winners || winners.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6">
            <p>No winners yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg"
              >
                <p className="font-medium text-white">
                  Match Type: {winner.match_type}
                </p>

                <p className="text-sm text-slate-300">
                  Prize Amount: ₹{" "}
                  {Number(winner.prize_amount || 0).toFixed(2)}
                </p>

                <p className="text-sm text-slate-300">
                  Verification Status: {winner.verification_status}
                </p>

                <p className="text-sm text-slate-300">
                  Payment Status: {winner.payment_status}
                </p>

                <p className="text-sm text-slate-300 break-all">
                  Proof: {winner.proof_file_url || "Not submitted"}
                </p>

                {/* ✅ BUTTONS */}
                <div className="mt-4 flex flex-wrap gap-2">

                  {/* APPROVE */}
                  {winner.verification_status !== "approved" && (
                    <form action={approveWinner}>
                      <input
                        type="hidden"
                        name="winner_id"
                        value={winner.id}
                      />
                      <button className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">
                        Approve
                      </button>
                    </form>
                  )}
                  {/* REJECT */}
                  {winner.verification_status !== "approved" && (
                    <form action={rejectWinner}>
                      <input
                        type="hidden"
                        name="winner_id"
                        value={winner.id}
                      />
                      <button className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">
                        Reject
                      </button>
                    </form>
                  )}

                  {/* MARK PAID */}
                  {winner.verification_status === "approved" &&
                    winner.payment_status !== "paid" && (
                      <form action={markPaid}>
                        <input
                          type="hidden"
                          name="winner_id"
                          value={winner.id}
                        />
                        <button className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-400">
                          Mark Paid
                        </button>
                      </form>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}