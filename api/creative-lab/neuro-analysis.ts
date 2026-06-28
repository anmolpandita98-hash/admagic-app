import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, mimeType } = req.body;

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: 'Missing fileData or mimeType' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server.' });
    }

    const prompt = `Analyze this ad creative using the perspective of Meta's Tribe V2 research and neuroscience principles.
    Tribe V2 focuses on real-time inference of brain activity, emotional valence, and stimulus response.

    Provide a detailed analysis including:
    1. Brain Activity Index (0-100)
    2. Emotional Resonance (Valence Score)
    3. Attention Spikes (Key moments that trigger cognitive load)
    4. Creative Effectiveness based on neuro-stimulus.
    5. Specific recommendations to improve the "Brain Hook".

    Format the response as JSON with the following structure:
    {
      "score": number,
      "valence": number,
      "attentionSpikes": [{ "time": "string", "reason": "string", "intensity": number }],
      "emotionalProfile": { "excitement": number, "trust": number, "fear": number, "joy": number },
      "neuroInsights": ["string"],
      "recommendations": ["string"]
    }
    Return ONLY the JSON object, no markdown, no explanation.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://app.admagic.cloud',
        'X-Title': 'AdMagic Neuro Analysis',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${fileData}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenRouter');
    }

    const data = typeof content === 'string' ? JSON.parse(content.trim()) : content;
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Neuro-analysis failure:', error);
    return res.status(500).json({ error: error.message || 'Failed to process neuro-analysis' });
  }
}
