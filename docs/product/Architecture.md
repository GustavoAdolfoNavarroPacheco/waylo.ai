# Technical architecture: Patient Navigator

## 1. Technology stack
- **Frontend / chat UI:** Next.js (React) + Tailwind CSS + icons (accessible design, large and clear text for patients).
- **Backend / API:** Next.js API routes / Node.js.
- **AI orchestration:** Vercel AI SDK or LangChain.
- **Guidance LLM:** Grok 4.7 / Claude 3.5 Sonnet / GPT-4o (at low temperature, 0.1, to avoid hallucinations).
- **Database / search:** PostgreSQL + pgvector or Supabase (to store logs and for RAG over providers and guidelines).

## 2. Data sources (knowledge base / RAG)
1. **Clinical practice guidelines and triage protocols (for example the Manchester Triage System, adapted locally):** used
   to parametrize the warning-sign screening questions.
2. **Health provider network:** a relational or vector database with:
   - Site or IPS name.
   - Type of care provided (24h emergency, priority, outpatient appointments).
   - Agreements with EPS and insurers.
   - Hours, address and entry requirements.

## 3. Agent flow diagram
```
[Patient message]
       │
       ▼
[Safety filter / red-flag guardrails] ──► (if vital danger is detected) ──► [Red alert: go to the ER / call emergency services]
       │ (no immediate danger)
       ▼
[Symptom evaluation in everyday language]
       │
       ▼
[RAG query: triage guidelines + provider network]
       │
       ▼
[Final answer: level of care + where to go + what to bring]
```

## 4. Security and privacy requirements
- Do not store sensitive health data tied to real identities without explicit consent.
- Anonymize conversation logs.
