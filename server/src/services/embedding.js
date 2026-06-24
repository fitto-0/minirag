const axios = require('axios');

const GOOGLE_EMBEDDING_MODEL = 'text-embedding-004';

async function getGoogleEmbedding(text) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'your_google_api_key_here') {
    return generateFallbackEmbedding(text);
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        model: `models/${GOOGLE_EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      }
    );
    return response.data.embedding.values;
  } catch (error) {
    console.warn('Google embedding failed, using fallback:', error.message);
    return generateFallbackEmbedding(text);
  }
}

function generateFallbackEmbedding(text) {
  const dim = 128;
  const seed = hashText(text);
  const vector = [];

  for (let i = 0; i < dim; i++) {
    const val = Math.sin(seed * (i + 1) * 0.01) * 0.5 + 0.5;
    vector.push(val);
  }

  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / magnitude);
}

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function getEmbedding(text) {
  return getGoogleEmbedding(text);
}

module.exports = { getEmbedding };
