// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabaseClient";
import { callGroqSystem } from "../../../lib/groqClient";
import { buildChatPrompt, buildPersonalityPrompt } from "../../../lib/prompts";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";

const bodySchema = z.object({
  userId: z.string().min(1),
  message: z.string().min(1),
});

// trigger phrases
const SELF_TRIGGERS = [
  "who am i",
  "tell me about myself",
  "describe me",
  "what did you learn about me",
];

async function updateMemoryIfNeeded(userId: string) {
  const { data: msgs } = await getSupabaseServiceClient()
    .from("messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!msgs) return;

  const userMsgCount = msgs.filter((m) => m.role === "user").length;

  if (userMsgCount >= 5) {
    await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      }/api/update-memory`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const json = await req.json();
    const parsed = bodySchema.parse(json);
    const { userId, message } = parsed;

    await supabase
      .from("messages")
      .insert([{ user_id: userId, role: "user", content: message }]);

    updateMemoryIfNeeded(userId).catch(console.error);

    const isSelfQuery = SELF_TRIGGERS.some((t) =>
      message.toLowerCase().includes(t)
    );

    const { data: recent } = await supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    const recentMessages = (recent ?? [])
      .reverse()
      .map((r: any) => ({ role: r.role, content: r.content }));

    const { data: memRows } = await supabase
      .from("memory")
      .select("summary")
      .eq("user_id", userId)
      .limit(1);

    let memorySummary = memRows?.[0]?.summary ?? null;

    let messagesForLLM: ChatCompletionMessageParam[] = [];

    if (isSelfQuery) {
      memorySummary = memRows?.[0]?.summary ?? null;
      if (!memorySummary) {
        const updateRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
          }/api/update-memory`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        const { summary } = await updateRes.json();
        memorySummary = summary;
      }

      const prompt = buildPersonalityPrompt(memorySummary);

      messagesForLLM = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ];
    } else {
      const prompt = buildChatPrompt(memorySummary, recentMessages.slice(-10));
      messagesForLLM = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ];
    }

    const responseText = await callGroqSystem(messagesForLLM);
    const reply = responseText.trim();

    // save chat response
    await supabase
      .from("messages")
      .insert([{ user_id: userId, role: "assistant", content: reply }]);

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
