# Task list and development backlog

## Phase 1: conversational engine and clinical guardrails
- [x] Implement the system prompt from `AGENTS.md` in the LLM configuration.
- [x] Create the fast keyword and semantic detection module for red flags (vital emergency).
- [x] Write unit tests that simulate 20 serious-emergency cases to verify it NEVER routes to General Medicine.

## Phase 2: provider and guideline database
- [x] Create the database schema for the provider network (fields: `nombre`, `tipo_atencion`, `direccion`, `eps_convenio`, `requisitos`).
- [x] Load a seed dataset with symptom-classification guidelines and test sites.
- [x] Implement the RAG/SQL search that links the user's EPS with the available providers.

## Phase 3: user interface and integration
- [x] Build a mobile-friendly chat interface in Next.js.
- [x] Add quick-reply buttons for common symptoms ("headache", "fever", "abdominal pain", "blow or fall").
- [x] Design prominent visual cards for the final instruction ("where to go" and "what to bring").

## Phase 4: legal compliance testing
- [ ] Audit the agent's answers with a health professional or a quality auditor.
- [x] Verify the legal disclaimer is included at the top or bottom of the chat.
