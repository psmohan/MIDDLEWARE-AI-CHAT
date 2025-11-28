// app/api/update-memory/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "../../../lib/supabaseClient";
import { callGroqSystem } from "../../../lib/groqClient";
import { buildMemoryPrompt } from "../../../lib/prompts";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";

const bodySchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { userId } = bodySchema.parse(json);

    // fetch messages for summarization
    const { data: rows } = await supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    const messages = (rows ?? [])
      .reverse()
      .map((r: any) => ({ role: r.role, content: r.content }));

    if (messages.length === 0) {
      return NextResponse.json({ ok: true, message: "No messages yet" });
    }

    const memoryPrompt = buildMemoryPrompt(messages);

    const llmMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a summarizer." },
      { role: "user", content: memoryPrompt },
    ];

    const summary = (await callGroqSystem(llmMessages)).trim();

    // upsert memory
    const { data: existing } = await supabase
      .from("memory")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from("memory")
        .update({
          summary,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else {
      await supabase.from("memory").insert([{ user_id: userId, summary }]);
    }

    return NextResponse.json({ ok: true, summary });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
