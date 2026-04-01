import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

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
    .select(`
      id,
      user_id,
      draw_id,
      match_type,
      prize_amount,
      proof_file_url,
      verification_status,
      payment_status,
      created_at
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Winner Verification</h1>
          <Link href="/admin" className="rounded-lg border px-4 py-2">
            Back to Admin
          </Link>
        </div>

        {!winners || winners.length === 0 ? (
          <div className="rounded-2xl border p-6">
            <p>No winners yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((winner) => (
              <div key={winner.id} className="rounded-2xl border p-6 shadow-sm">
                <p className="font-medium">Match Type: {winner.match_type}</p>
                <p className="text-sm text-gray-600">
                  Prize Amount: ₹ {Number(winner.prize_amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Verification Status: {winner.verification_status}
                </p>
                <p className="text-sm text-gray-600">
                  Payment Status: {winner.payment_status}
                </p>
                <p className="text-sm text-gray-600 break-all">
                  Proof: {winner.proof_file_url || "Not submitted"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approveWinner}>
                    <input type="hidden" name="winner_id" value={winner.id} />
                    <button
                      type="submit"
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Approve
                    </button>
                  </form>

                  <form action={rejectWinner}>
                    <input type="hidden" name="winner_id" value={winner.id} />
                    <button
                      type="submit"
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Reject
                    </button>
                  </form>

                  <form action={markPaid}>
                    <input type="hidden" name="winner_id" value={winner.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                    >
                      Mark Paid
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}