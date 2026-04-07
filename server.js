const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CaptionAI Pro is running' });
});

// Main caption generation endpoint
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
    ? `YouTube video titled "${videoTitle}" by "${videoChannel}"`
    : `A local video file named "${videoTitle}" about ${topic || 'general topic'}`;

  const prompt = `You are a professional video captioning agent.

Source: ${sourceInfo}
Target language: ${langName}
Style: ${styleGuide}

Generate exactly 12 caption segments for this video.

STRICT RULES:
- Return ONLY a JSON object, nothing else
- No markdown, no backticks, no explanation
- Use only straight double quotes for JSON
- Do not use apostrophes in any text - use full words instead (do not = do not, it is = it is)
- Do not use special characters or symbols in caption text
- Keep caption text simple and clean

Return this exact structure:
{"summary":"one sentence about video","sourceLang":"detected language name","totalDuration":"3:45","wordCount":280,"captions":[{"id":1,"start":"0:00","end":"0:07","startMs":0,"endMs":7000,"original":"spoken text here","translated":"translated text here"},{"id":2,"start":"0:07","end":"0:14","startMs":7000,"endMs":14000,"original":"spoken text here","translated":"translated text here"},{"id":3,"start":"0:14","end":"0:21","startMs":14000,"endMs":21000,"original":"spoken text here","translated":"translated text here"},{"id":4,"start":"0:21","end":"0:30","startMs":21000,"endMs":30000,"original":"spoken text here","translated":"translated text here"},{"id":5,"start":"0:30","end":"0:40","startMs":30000,"endMs":40000,"original":"spoken text here","translated":"translated text here"},{"id":6,"start":"0:40","end":"0:52","startMs":40000,"endMs":52000,"original":"spoken text here","translated":"translated text here"},{"id":7,"start":"0:52","end":"1:05","startMs":52000,"endMs":65000,"original":"spoken text here","translated":"translated text here"},{"id":8,"start":"1:05","end":"1:18","startMs":65000,"endMs":78000,"original":"spoken text here","translated":"translated text here"},{"id":9,"start":"1:18","end":"1:32","startMs":78000,"endMs":92000,"original":"spoken text here","translated":"translated text here"},{"id":10,"start":"1:32","end":"1:48","startMs":92000,"endMs":108000,"original":"spoken text here","translated":"translated text here"},{"id":11,"start":"1:48","end":"2:05","startMs":108000,"endMs":125000,"original":"spoken text here","translated":"translated text here"},{"id":12,"start":"2:05","end":"2:20","startMs":125000,"endMs":140000,"original":"spoken text here","translated":"translated text here"}]}

Fill in the actual caption content relevant to the video. Keep text clean with no special characters.`;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI service error. Check your API key.' });
    }

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');

    // Clean the response thoroughly
    let clean = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Find JSON object boundaries
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }

    // Remove control characters that break JSON
    clean = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');

    console.log('Cleaned response length:', clean.length);

    const parsed = JSON.parse(clean);
    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error('Server error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CaptionAI Pro running at http://localhost:${PORT}`);
});