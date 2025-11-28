# Middleware AI Chatbot (Groq + Next.js + Tailwind + shadcn)

A production‑grade AI chat UI:

- Memory‑based AI chatbot
- Personality generation (“Who am I?”)
- Supabase persistence
- Groq LLM integration
- Next.js App Router
- Tailwind + shadcn modern UI
- Safe UUID client identity

---

## 🚀 Features

### ✔ Chat with AI

Real‑time chat with a Groq‑powered assistant using `llama-3.1-8b-instant` or any Groq model.

### ✔ Memory Storage

Every user message is stored in Supabase (`messages` table).

### ✔ Personality Summary

A memory summary is generated in `memory` table.  
When user asks _“Who am I?”_ → AI produces a profile from memory.

### ✔ Client‑Side UUID

Each user gets a persistent ID stored in `localStorage`.

### ✔ Modern UI

Built using TailwindCSS + shadcn UI components.

---

## 🧱 Tech Stack

| Layer   | Technology                        |
| ------- | --------------------------------- |
| UI      | Next.js 14, Tailwind, shadcn      |
| Backend | Next.js App Router                |
| LLM     | Groq SDK (`llama-3.1-8b-instant`) |
| DB      | Supabase (hosted Postgres)        |
| Hosting | Vercel                            |

---

## 🔧 Setup Instructions

### 1️⃣ Clone or create project directory

```bash
mkdir middleware-chatbot
cd middleware-chatbot
```

### 2️⃣ Install dependencies

```bash
npm install
```

Or after generating all files:

```bash
npm install next react react-dom @supabase/supabase-js groq-sdk uuid zod cross-fetch
npm install -D tailwindcss postcss autoprefixer typescript vitest supertest @testing-library/react
```

### 3️⃣ Initialize Tailwind (Ignore if using tailwind 4)

```bash
npx tailwindcss init -p
```

### 4️⃣ Initialize shadcn UI

```bash
npx shadcn init
```

### 5️⃣ Add environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
NEXT_PUBLIC_APP_NAME=Middleware Chatbot POC
```

### 6️⃣ Set up Supabase database

Open SQL Editor → paste:

```sql
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  role text not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists memory (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  summary text,
  updated_at timestamptz default now()
);
```

### 7️⃣ Run dev server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🛠 Commands

| Purpose | Command         |
| ------- | --------------- |
| Run Dev | `npm run dev`   |
| Build   | `npm run build` |
| Test    | `npm run test`  |

---

## 🧪 Running Tests

Vitest is configured. Add tests under:

```
tests/*.test.ts
```

Run:

```bash
npm run test
```

---

## 💬 Personality Query Examples

Ask:

- “Who am I?”
- “Describe my personality.”
- “What did you learn about me?”
- “Tell me about myself.”

---

## 📌 Notes

- No authentication needed (UUID is enough for POC)
- Memory can be auto-refreshed every N messages
- Can easily add streaming responses
- Replace Groq with OpenAI by swapping the client wrapper

---

## Author

Mohan Pualmolu
