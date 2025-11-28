export function buildChatPrompt(
  memorySummary: string | null,
  recentMessages: { role: string; content: string }[]
) {
  const memoryBlock = memorySummary
    ? `Memory summary:\n${memorySummary}\n\n`
    : "";
  const recent = recentMessages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `${memoryBlock}Use the memory summary above when helpful, but do not invent facts. Continue the conversation based on the recent messages:\n${recent}\nAssistant:`;
}

export function buildMemoryPrompt(
  messages: { role: string; content: string }[]
) {
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  return `Summarize the user's personality traits, preferences, goals, stable facts, and tone from the following conversation. Keep under 150 words. Be factual, do not invent details. Conversation:\n${transcript}`;
}

export function buildPersonalityPrompt(memorySummary: string) {
  return `Based only on the memory summary below, write a concise user personality profile (3-6 bullet points and a short paragraph). Be objective and do not invent facts. Memory:\n${memorySummary}`;
}
