import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function addScore(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const scoreValue = Number(formData.get("score"));
  const playedAt = String(formData.get("played_at"));

  if (!scoreValue || scoreValue < 1 || scoreValue > 45 || !playedAt) {
    return;
  }

  const { data: existingScores } = await supabase
    .from("golf_scores")
    .select("id, played_at, created_at")
    .eq("user_id", user.id)
    .order("played_at", { ascending: true })
    .order("created_at", { ascending: true });

  if (existingScores && existingScores.length >= 5) {
    const oldestScore = existingScores[0];
    await supabase.from("golf_scores").delete().eq("id", oldestScore.id);
  }

  await supabase.from("golf_scores").insert({
    user_id: user.id,
    score: scoreValue,
    played_at: playedAt,
  });

  revalidatePath("/user/scores");
}

export default async function UserScoresPage() {
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

  const { data: scores } = await supabase
    .from("golf_scores")
    .select("id, score, played_at, created_at")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0B1020] p-6 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            My Golf Scores
          </h1>

          <Link
            href="/user"
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Add Score */}
        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6">
          <h2 className="mb-4 text-xl font-medium text-white">
            Add New Score
          </h2>

          <form action={addScore} className="grid gap-4 sm:grid-cols-2">
            
            <input
              type="number"
              name="score"
              min="1"
              max="45"
              placeholder="Enter score (1-45)"
              required
              className="rounded-lg border border-slate-700 bg-[#0B1020] p-3 text-slate-200 placeholder:text-slate-400"
            />

            <input
              type="date"
              name="played_at"
              required
              className="rounded-lg border border-slate-700 bg-[#0B1020] p-3 text-slate-200"
            />

            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-indigo-600 p-3 font-medium text-white hover:bg-indigo-500"
            >
              Save Score
            </button>

          </form>

          <p className="mt-3 text-sm text-slate-400">
            Only your latest 5 scores are kept.
          </p>
        </div>

        {/* Scores List */}
        <div className="rounded-2xl border border-slate-700 bg-[#121A2F] p-6">
          <h2 className="mb-4 text-xl font-medium text-white">
            Latest Scores
          </h2>

          {!scores || scores.length === 0 ? (
            <p className="text-slate-400">
              No scores added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0B1020] p-4"
                >
                  <div>
                    <p className="font-medium text-white">
                      Score: {score.score}
                    </p>

                    <p className="text-sm text-slate-400">
                      Date: {score.played_at}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white">
                      {score.score}
                    </span>
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