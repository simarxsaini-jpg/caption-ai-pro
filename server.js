const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CaptionAI Pro is running' });
});

// Main caption generation endpoint
app.post('/api/generate-captions', async (req, res) => {
  const { videoTitle, videoChannel, videoId, targetLang, langName, style, topic, mode } = req.body;

  if (!videoTitle || !targetLang) {
    return res.status(400).json({ error: 'Missing required fields: videoTitle, targetLang' });
  }

  const styleGuide = {
    natural: 'natural, fluent — reads like a native speaker wrote it',
    literal: 'word-for-word, staying close to original meaning',
    simplified: 'simple and easy to read, suitable for all ages',
    formal: 'formal, professional tone',
  }[style] || 'natural and fluent';

  const sourceInfo = mode === 'youtube'
    ? `YouTube video titled "${videoTitle}" by "${videoChannel}"`
    : `A local video file named "${videoTitle}" — topic: ${topic || 'general'}`;

  const prompt = `You are a professional AI captioning and translation agent.

Source: ${sourceInfo}
Target language: ${langName}
Translation style: ${styleGuide}

Generate 12 realistic, high-quality caption segments that represent this video's content.
Each segment should feel authentic and contextually relevant to this specific video.

Return ONLY valid JSON (no markdown, no backticks):
{
  "summary": "One sentence about the video content",
  "sourceLang": "Detected source language",
  "totalDuration": "e.g. 4:32",
  "wordCount": 320,
  "captions": [
    {
      "id": 1,
      "start": "0:00",
      "end": "0:06",
      "startMs": 0,
      "endMs": 6000,
      "original": "Original spoken text",
      "translated": "Translated text in ${langName}"
    }
  ]
}

Make timestamps sequential and realistic. Each caption 1-2 sentences. Total ~12 segments covering the full estimated duration.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
   let parsed;
try {
  parsed = JSON.parse(clean);
} catch (e) {
  const fixed = clean
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');
  parsed = JSON.parse(fixed);
}

    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ CaptionAI Pro running at http://localhost:${PORT}`);
});
