import { createClient } from "@/lib/supabase/server";
import { generateNumbers } from "@/lib/generateNumbers";

export async function POST() {
  const supabase = await createClient();

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("status", "open")
    .single();

  if (!draw) return Response.json({ error: "No draw" });

  const { data: users } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  for (const user of users || []) {
    await supabase.from("tickets").insert({
      user_id: user.user_id,
      draw_id: draw.id,
      numbers: generateNumbers(),
    });
  }

  return Response.json({ success: true });
}