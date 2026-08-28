import { getSupabaseServer } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("memory_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ notes: data });
}

export async function POST(req: Request) {
  const { note, vertical } = await req.json();
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("memory_notes")
    .insert([{ note, vertical: vertical || "general" }]);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
