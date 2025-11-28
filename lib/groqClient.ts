import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Safe wrapper around Groq chat completions
 */
export async function callGroqSystem(
  messages: ChatCompletionMessageParam[],
  opts?: { max_tokens?: number }
) {
  try {
    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "llama3-70b-8192",
      messages,
      max_tokens: opts?.max_tokens ?? 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? "";
  } catch (err: any) {
    console.error("Groq Error:", JSON.stringify(err, null, 2));

    if (err?.status === 400) {
      return "I couldn't understand the request. Please try rephrasing.";
    }

    if (err?.status === 409) {
      return "I'm receiving too many requests at once. Try again in a moment.";
    }

    if (err?.status === 401 || err?.status === 403) {
      return "Authentication issue with the AI provider. Please check API keys.";
    }

    if (err?.status === 429) {
      return "I'm being rate-limited. Try again in a few seconds.";
    }

    if (err?.status >= 500) {
      return "The AI provider is currently unavailable. Try again soon.";
    }

    return (
      err?.message ??
      "Something went wrong while generating a response. Try again."
    );
  }
}
