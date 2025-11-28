import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <header className="py-6 text-center font-bold text-2xl">
        Middleware — AI Chatbot POC
      </header>
      <ChatWindow />
    </main>
  );
}
