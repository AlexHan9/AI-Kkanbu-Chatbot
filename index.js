import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { PERSONA_PROMPTS } from './personas.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve the frontend from the public directory

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CHAT_MODEL = 'gemini-2.5-flash'; 
const EMBEDDING_MODEL = 'gemini-embedding-001';

app.post('/api/chat', async (req, res) => {
    const { message, sessionId, personaId } = req.body;

    if (!message || !sessionId || !personaId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure we are sending an SSE stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // 1. Generate an embedding for the incoming user message
        const embedResponse = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: message,
        });
        const queryEmbedding = embedResponse.embeddings[0].values;

        // 2. Fetch relevant past context from Supabase using the RPC
        const { data: matchedMessages, error: matchError } = await supabase.rpc('match_messages', {
            query_embedding: queryEmbedding,
            match_session_id: sessionId,
            match_threshold: 0.5,
            match_count: 5
        });

        if (matchError) {
            console.error('Supabase RPC Error:', matchError);
            throw matchError;
        }

        // 3. Save the user's message and embedding to the database
        await supabase.from('messages').insert({
            session_id: sessionId,
            role: 'user',
            content: message,
            embedding: queryEmbedding
        });

        // 4. Construct the RAG Context
        let contextString = "";
        if (matchedMessages && matchedMessages.length > 0) {
            contextString = "Here is some relevant context from earlier in this conversation:\n";
            matchedMessages.forEach(msg => {
                contextString += `[${msg.role}]: ${msg.content}\n`;
            });
        }

        // 5. Construct the final prompt
        const systemPrompt = PERSONA_PROMPTS[personaId] || PERSONA_PROMPTS['empathetic'];
        
        const finalPrompt = `
${systemPrompt}

${contextString}

Reply to the user's latest message:
[user]: ${message}
`;

        // 6. Call Gemini API and STREAM the response
        const responseStream = await ai.models.generateContentStream({
            model: CHAT_MODEL,
            contents: finalPrompt,
            config: {
                temperature: personaId === 'quirky' ? 0.9 : 0.7, 
            }
        });

        let fullAssistantResponse = "";

        // 7. Stream response back using SSE
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            fullAssistantResponse += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

        // 8. Generate embedding for the assistant's response and save to DB
        const assistantEmbedResponse = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: fullAssistantResponse,
        });
        
        await supabase.from('messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: fullAssistantResponse,
            embedding: assistantEmbedResponse.embeddings[0].values
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Internal Server Error' })}\n\n`);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
