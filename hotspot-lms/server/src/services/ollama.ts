const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b-instruct';

export async function ollamaGenerate(prompt: string): Promise<string> {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: { temperature: 0.4, num_predict: 1024 }
        })
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Ollama error (${res.status}): ${body}`);
    }

    const data = await res.json() as { response?: string };
    return (data.response || '').trim();
}

export async function ollamaStatus(): Promise<{ online: boolean; model: string; models: string[] }> {
    try {
        const res = await fetch(`${OLLAMA_URL}/api/tags`);
        if (!res.ok) {
            return { online: false, model: OLLAMA_MODEL, models: [] };
        }
        const data = await res.json() as { models?: { name: string }[] };
        const models = (data.models || []).map(m => m.name);
        return { online: true, model: OLLAMA_MODEL, models };
    } catch {
        return { online: false, model: OLLAMA_MODEL, models: [] };
    }
}
