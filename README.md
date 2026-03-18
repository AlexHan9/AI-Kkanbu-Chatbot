# AI Kkanbu Chatbot

A RAG-based Multi-Persona AI Chatbot backend.

## Architecture

This project implements a robust backend for an AI chatbot featuring multiple distinct personas, built with:

*   **Node.js / Express:** High-performance, event-driven server backend.
*   **Google Gemini Pro API:** Powering the conversational intelligence and persona emulation.
*   **Supabase (PostgreSQL + pgvector):** Used for storing user sessions, messages, and enabling Retrieval-Augmented Generation (RAG) through high-speed vector embeddings (cosine similarity).

## Features

*   **Multi-Persona Support:** Switch between distinct AI personalities seamlessly.
*   **Contextual Awareness (RAG):** Retrieves relevant past conversation history using semantic vector search to maintain long-term context within a session.
*   **Real-time Streaming:** Streams LLM responses back to the client using Server-Sent Events (SSE) for a fluid user experience.

## Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Copy `.env.example` to `.env` and populate your API keys (Supabase URL, Service Role Key, and Gemini API Key).
4.  Start the server: `npm start`
