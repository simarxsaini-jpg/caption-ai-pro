const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Extract all captions from AI response even if JSON is broken
function extractCaptions(text) {
  const captions = [];
  const pattern = /"original"\s*:\s*"([^"]*)"\s*,\s*"translated"\s*:\s*"([^"]*)"/g;
  let match;
  let id = 1;
  while ((match = pattern.exec(text)) !== null) {
    const startMs = (id - 1) * 12000;
    const endMs = id * 12000;
    const startSec = Math.floor(startMs / 1000);
    const endSec = Math.floor(endMs / 1000);
    const startMin = Math.floor(startSec / 60);
    const endMin = Math.floor(endSec / 60);
    captions.push({
      id,
      start: `${startMin}:${String(startSec % 60).padStart(2, '0')}`,
      end: `${endMin}:${String(endSec % 60).padStart(2, '0')}`,
      startMs,
      endMs,
      original: match[1].trim(),
      translated: match[2].trim()
    });
    id++;
  }
  return captions;
}

app.post('/api/generate-captions', async (req, res) => {
  const { videoTitle, videoChannel, targetLang, langName, style, topic, mode } = req.body;

  if (!videoTitle || !targetLang) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const styleGuide = {
    natural: 'natural and fluent',
    literal: 'word-for-word literal',
    simplified: 'simple and easy to read',
    formal: 'formal and professional',
  }[style] || 'natural and fluent';

  const sourceInfo = mode === 'youtube'
    ? `YouTube video titled ${videoTitle} by ${videoChannel}`
    : `Local video named ${videoTitle} about ${topic || 'general topic'}`;

  const prompt = `You are a video captioning agent.

Video: ${sourceInfo}
Translate captions into: ${langName}
Style: ${styleGuide}

Generate 10 caption segments. Return them in this EXACT format:

"original": "English text here", "translated": "${langName} text here"

Repeat that line 10 times with real caption content.

Rules:
- No apostrophes - write do not instead of dont, it is instead of its
- No special characters
- Keep each caption short, one or two sentences
- Return ONLY the 10 lines, nothing else`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI service error. Check your API key and credits.' });
    }

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    console.log('Raw AI response preview:', raw.substring(0, 300));

    const captions = extractCaptions(raw);
    console.log('Extracted captions:', captions.length);

    if (captions.length === 0) {
      console.error('Full raw response:', raw);
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }

    const lastCaption = captions[captions.length - 1];
    const totalMs = lastCaption.endMs;
    const totalMin = Math.floor(totalMs / 60000);
    const totalSec = Math.floor((totalMs % 60000) / 1000);

    const result = {
      summary: `Captions for ${videoTitle}`,
      sourceLang: 'Auto-detected',
      totalDuration: `${totalMin}:${String(totalSec).padStart(2, '0')}`,
      wordCount: captions.reduce((a, c) => a + c.translated.split(' ').length, 0),
      captions
    };

    res.json({ success: true, data: result });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CaptionAI Pro running at http://localhost:${PORT}`);
});