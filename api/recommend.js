export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  try {
    const { messages } = req.body;
    const promptText = messages?.[0]?.content || '';

    const geminiBody = {
      contents: [{
        role: "user",
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 1.0
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    return res.status(200).json({
      content: [{ text: generatedText }]
    });
  } catch (err) {
    console.error('Vercel API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
