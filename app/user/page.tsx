import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function submitProof(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const winnerId = String(formData.get("winner_id"));
  const proofFileUrl = String(formData.get("proof_file_url"));

  if (!winnerId || !proofFileUrl) return;

  await supabase
    .from("winners")
    .update({
      proof_file_url: proofFileUrl,
      verification_status: "pending",
    })
    .eq("id", winnerId)
    .eq("user_id", user.id);

  revalidatePath("/user/winnings");
  revalidatePath("/admin/winners");
}

export default async function UserWinningsPage() {
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

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const { data: winners } = await supabase
    .from("winners")
    .select(`
      id,
      match_type,
      prize_amount,
      proof_file_url,
      verification_status,
      payment_status,
      created_at,
      draw_id
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">My Winnings</h1>
          <Link
            href="/user"
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-100 transition hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {!winners || winners.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20">
            <p className="text-slate-300">No winnings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6 shadow-lg shadow-black/20"
              >
                <p className="font-medium text-white">
                  Match Type: {winner.match_type}
                </p>
                <p className="text-sm text-slate-300">
                  Prize Amount: ₹ {Number(winner.prize_amount).toFixed(2)}
                </p>
                <p className="text-sm text-slate-300">
                  Verification Status: {winner.verification_status}
                </p>
                <p className="text-sm text-slate-300">
                  Payment Status: {winner.payment_status}
                </p>
                <p className="text-sm text-slate-300">
                  Proof: {winner.proof_file_url || "Not submitted"}
                </p>

                <form action={submitProof} className="mt-4 space-y-3">
                  <input type="hidden" name="winner_id" value={winner.id} />

                  <input
                    type="text"
                    name="proof_file_url"
                    placeholder="Paste screenshot link or proof text"
                    defaultValue={winner.proof_file_url || ""}
                    className="w-full rounded-lg border border-slate-600 bg-[#0F172A] p-3 text-slate-50 placeholder:text-slate-400"
                    required
                  />

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-400"
                  >
                    Submit / Update Proof
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}