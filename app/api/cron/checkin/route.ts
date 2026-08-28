import webpush from "web-push";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSupabaseServer } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/systemPrompt";

// This route is hit automatically by Vercel Cron (see vercel.json).
// It asks Gemini for a short check-in line, then pushes it to every
// subscribed device as a real browser notification.

export async function GET(req: Request) {
  // Protect the endpoint so randoms on the internet can't trigger it
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseServer();

  const { data: notes } = await supabase
    .from("memory_notes")
    .select("note, vertical")
    .order("created_at", { ascending: false })
    .limit(20);

  const memoryContext = (notes || [])
    .reverse()
    .map((n) => `- [${n.vertical}] ${n.note}`)
    .join("\n");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(memoryContext),
  });

  const result = await model.generateContent(
    "Give me a short (2-3 sentence) proactive check-in notification. Pull from memory if there's something worth flagging (a stalled project, a back flare-up mentioned recently, an overthinking pattern). If nothing stands out, just prompt me for today's status across the 3 verticals. Keep it tight — this is a push notification, not a report."
  );
  const text = result.response.text();

  webpush.setVapidDetails(
    "mailto:you@example.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const { data: subs } = await supabase.from("push_subscriptions").select("*");

  await Promise.all(
    (subs || []).map((s) =>
      webpush.sendNotification(s.subscription, JSON.stringify({
        title: "Jarvis",
        body: text,
      })).catch(() => null) // ignore dead/expired subscriptions
    )
  );

  return Response.json({ sent: text });
}
