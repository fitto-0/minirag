const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function queryGroq(contextChunks, userQuestion, conversationHistory = []) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return generateFallbackResponse(contextChunks, userQuestion);
  }

  const contextText = contextChunks.map(c => c.text).join('\n\n');

  const systemPrompt = `You are a precise document analysis assistant. Answer the user's question based ONLY on the provided document context. If the answer cannot be found in the context, say "I cannot find information about that in the provided document." Do not make up or infer information beyond what is explicitly stated. Maintain context from the conversation history when relevant.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: `Document Context:\n${contextText}\n\nQuestion: ${userQuestion}` },
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.warn('Groq inference failed, using fallback:', error.message);
    return generateFallbackResponse(contextChunks, userQuestion);
  }
}

function generateFallbackResponse(contextChunks, userQuestion) {
  const relevantText = contextChunks.map(c => c.text.substring(0, 300)).join('\n...\n');
  return `Based on the document content, I found the following relevant information:\n\n${relevantText}\n\nNote: This is a fallback response as the AI inference service is currently unavailable. The above text is extracted directly from your document and may contain the answer to: "${userQuestion}"`;
}

module.exports = { queryGroq };
