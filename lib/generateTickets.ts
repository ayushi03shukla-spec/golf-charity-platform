import { createClient } from "@/lib/supabase/server";
import { generateNumbers } from "@/lib/generateNumbers";

export async function generateTickets(): Promise<void> {
  const supabase = await createClient();

  const { data: draw } = await supabase
    .from("draws")
    .select("id")
    .eq("status", "open")
    .single();

  if (!draw) return;

  const { data: users } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  if (!users) return;

  for (const user of users) {
    await supabase.from("tickets").insert({
      user_id: user.user_id,
      draw_id: draw.id,
      numbers: generateNumbers(),
    });
  }
}