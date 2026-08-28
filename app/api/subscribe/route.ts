import { getSupabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  const subscription = await req.json();
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { endpoint: subscription.endpoint, subscription },
      { onConflict: "endpoint" }
    );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
