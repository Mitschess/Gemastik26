const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';

interface OllamaGenerateResponse {
    response?: string;
}

interface OllamaChatResponse {
    message?: { content?: string };
}

export async function askAI(prompt: string): Promise<string> {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: MODEL,
            prompt,
            stream: false,
            options: { temperature: 0.3, num_predict: 512 }
        })
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = (await res.json()) as OllamaGenerateResponse;
    return data.response?.trim() || '';
}

export async function chatAI(messages: { role: string; content: string }[]): Promise<string> {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: MODEL,
            messages,
            stream: false,
            options: { temperature: 0.7, num_predict: 512 }
        })
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = (await res.json()) as OllamaChatResponse;
    return data.message?.content?.trim() || '';
}

export async function checkOllamaHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${OLLAMA_URL}/api/tags`);
        return res.ok;
    } catch {
        return false;
    }
}

export function getModelName(): string {
    return MODEL;
}
