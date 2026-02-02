
import { AnalysisType, SemanticAnalysis } from './types';

const API_KEY = import.meta.env.VITE_DOUBAO_SECRET_ACCESS_KEY || import.meta.env.VITE_DOUBAO_ACCESS_KEY_ID;
const MODEL_ENDPOINT = import.meta.env.VITE_DOUBAO_MODEL_ENDPOINT;
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export async function analyzeTerm(term: string, context: string = "", imageBase64?: string): Promise<SemanticAnalysis> {
    const startTime = Date.now();

    if (!API_KEY || !MODEL_ENDPOINT) {
        throw new Error("Doubao API configuration missing. Please check .env.local");
    }

    const systemPrompt = `You are an expert linguistic analyst. Analyze the term deeply.
  Return ONLY valid JSON matching:
  {
    "id": "uuid",
    "term": "term",
    "rootForm": "root",
    "partOfSpeech": "pos",
    "context": "ctx",
    "type": "Word" | "Idiom" | "Metaphor" | "Slang" | "Term",
    "tags": ["tag"],
    "semanticCore": { "en": "def", "cn": "def", "contextualMeaning": { "en": "...", "cn": "..." } },
    "pragmatics": { "tone": "...", "register": "...", "nuance_cn": "..." },
    "originStory": "...",
    "synonyms": ["..."],
    "collocations": ["..."],
    "usageExamples": [{ "category": "...", "en": "...", "cn": "..." }],
    "impactScore": 1-10
  }`;

    const userPrompt = context
        ? `Analyze "${term}" in this context: "${context}"`
        : `Analyze "${term}"`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_ENDPOINT,
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (!content) throw new Error("No content");

        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanContent) as SemanticAnalysis;

        analysis.timestamp = new Date().toISOString();
        analysis.meta = { provider: 'doubao', model: MODEL_ENDPOINT, latencyMs: Date.now() - startTime };
        if (!analysis.id) analysis.id = crypto.randomUUID();

        return analysis;
    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
}

export async function generateMoreExamples(term: string, context: string): Promise<{ category: string, en: string, cn: string }[]> {
    if (!API_KEY || !MODEL_ENDPOINT) throw new Error("Doubao API configuration missing");

    const systemPrompt = `You are an expert linguist. Generate 3-5 diverse usage examples for the term.
    Return ONLY a valid JSON array of objects:
    [
      { "category": "Daily/Business/Academic/etc", "en": "English sentence", "cn": "Chinese translation" }
    ]`;

    const userPrompt = `Generate more examples for "${term}" in context: "${context}"`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_ENDPOINT,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (!content) throw new Error("No content");

        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("Generate examples failed:", error);
        throw error;
    }
}

export async function chatWithAI(message: string, currentAnalysis?: SemanticAnalysis): Promise<string> {
    if (!API_KEY || !MODEL_ENDPOINT) throw new Error("Doubao API configuration missing");

    const systemPrompt = `You are SmartLex AI, a helpful linguistic assistant.
    Current analysis context: ${currentAnalysis ? JSON.stringify(currentAnalysis) : "None"}
    Answer the user's questions about the term or general language questions. Keep answers concise and helpful.`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_ENDPOINT,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content || "No response";
    } catch (error) {
        console.error("Chat failed:", error);
        throw error;
    }
}
