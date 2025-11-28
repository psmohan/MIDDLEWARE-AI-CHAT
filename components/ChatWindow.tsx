"use client";

import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Loader2, User } from "lucide-react";

function getUserId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("chatUserId");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("chatUserId", id);
  }
  return id;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = getUserId();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const clientId = userIdRef.current!;
    const userMsg = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: clientId, message: userMsg.content }),
      });
      const payload = await res.json();
      const reply = payload.reply ?? payload.error ?? "Error";
      const aiMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Failed to reach server",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="border rounded-lg h-[70vh] p-4 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-auto space-y-3 pb-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl p-3 max-w-[70%] ${
                  m.role === "user"
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 text-slate-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin h-4 w-4" /> AI is typing...
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Say something..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={send}
            className="px-4 py-2 rounded bg-sky-600 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
