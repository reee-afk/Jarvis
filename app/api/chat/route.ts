import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSupabaseServer } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/systemPrompt";

export async function POST(req: Request) {
  const { message } = await req.json();
  const supabase = getSupabaseServer();

  // Pull recent memory notes + recent message history for continuity
  const { data: notes } = await supabase
    .from("memory_notes")
    .select("note, vertical, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .order("created_at", { ascending: false })
    .limit(20);

  const memoryContext = (notes || [])
    .reverse()
    .map((n) => `- [${n.vertical}] ${n.note}`)
    .join("\n");

  const recentMessages = (history || []).reverse();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(memoryContext),
  });

  // Gemini uses "model" instead of "assistant" for its own turns
  const chatHistory = recentMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  const reply = result.response.text();

  // Save both sides of the exchange
  await supabase.from("messages").insert([
    { role: "user", content: message },
    { role: "assistant", content: reply },
  ]);

  return Response.json({ reply });
}
