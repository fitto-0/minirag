const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function queryGroq(contextChunks, userQuestion, conversationHistory = []) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return generateFallbackResponse(contextChunks, userQuestion);
  }

  const contextText = contextChunks.map(c => c.text).join('\n\n');

  const systemPrompt = `You are an intelligent document analysis assistant with strong reasoning capabilities. Your task is to answer the user's question based primarily on the provided document context.

Guidelines:
1. Use the document context as your primary source of information
2. Synthesize information from multiple context chunks when relevant
3. Provide clear, well-structured answers with supporting details from the text
4. If the answer isn't explicitly in the context, state that clearly and provide the most relevant related information
5. Use conversation history to maintain context and reference previous exchanges
6. Be thorough but concise - focus on the most relevant information
7. When appropriate, organize complex answers with bullet points or numbered lists
8. If you need to make reasonable inferences, clearly state them as such

Remember: Your goal is to be helpful, accurate, and provide the best possible answer based on the available information.`;

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
        temperature: 0.3,
        max_tokens: 2048,
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
