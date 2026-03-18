# AI Kkanbu Chatbot

A highly realistic, RAG-based Multi-Persona AI Chatbot.

## Current Status
**Fully Functional & Ready for Deployment**
The application currently features a complete Node.js backend integrating the Google Gemini Pro API and Supabase (pgvector), serving a modern Tailwind CSS frontend interface. Five distinct, highly human-like personas have been engineered to respond in a natural, intimate Millennial/Gen Z texting style.

## Architecture

This project implements a robust, full-stack application built with:

*   **Frontend (Vanilla JS + Tailwind CSS):** A sleek, modern chat interface with persona selection and real-time streaming text effects.
*   **Backend (Node.js / Express):** High-performance, event-driven server managing API routing and Server-Sent Events (SSE).
*   **AI Engine (Google Gemini API):** Powering the conversational intelligence (`gemini-2.5-flash`) and vector embedding generation (`gemini-embedding-001`).
*   **Database & Memory (Supabase + pgvector):** PostgreSQL database storing user sessions and messages. It enables Retrieval-Augmented Generation (RAG) through high-speed vector semantic search (cosine similarity) to maintain contextual long-term memory.

## Features

*   **Multi-Persona Support:** Seamlessly switch between 5 distinct, highly realistic AI personalities:
    *   🤍 Empathetic Supporter
    *   🚀 Energetic Motivator
    *   📚 Intellectual Partner
    *   🙄 Playful Tsundere
    *   🪩 Quirky Free Spirit
*   **Contextual Awareness (RAG):** Retrieves relevant past conversation history using semantic vector search to maintain long-term context within a specific chat session.
*   **Real-time Streaming:** Streams LLM responses back to the client using Server-Sent Events (SSE) for a fluid, natural typing experience.
*   **Anti-AI Prompt Engineering:** Personas are strictly instructed to use casual grammar, never over-question, avoid "therapist-speak", and never reveal they are an AI.

## Setup & Local Development

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Copy `.env.example` to `.env` and populate your API keys (Supabase URL, Service Role Key, and Gemini API Key).
4.  Configure Supabase by running the provided SQL schema in your Supabase SQL Editor to set up `pgvector`, tables, and the `match_messages` RPC function.
5.  Start the server: `npm start`
6.  Visit `http://localhost:3000` in your browser.