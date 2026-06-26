const express = require('express');
const Chunk = require('../models/Chunk');
const Pdf = require('../models/Pdf');
const { protect } = require('../middleware/auth');
const { getEmbedding } = require('../services/embedding');
const { queryGroq } = require('../services/inference');
const { cosineSimilarity } = require('../utils/cosineSimilarity');

const router = express.Router();

router.post('/query', protect, async (req, res) => {
  try {
    const { question, pdfId, conversationHistory } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    let chunks;
    if (pdfId) {
      const pdf = await Pdf.findOne({ _id: pdfId, userId: req.user._id });
      if (!pdf) {
        return res.status(404).json({ message: 'PDF not found' });
      }
      chunks = await Chunk.find({ pdfId, userId: req.user._id });
    } else {
      chunks = await Chunk.find({ userId: req.user._id });
    }

    if (chunks.length === 0) {
      return res.status(400).json({ message: 'No documents found to query against. Please upload a PDF first.' });
    }

    const questionVector = await getEmbedding(question);

    const scored = chunks.map(chunk => ({
      text: chunk.text,
      score: cosineSimilarity(questionVector, chunk.vector),
    }));

    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, 5);

    const answer = await queryGroq(topChunks, question, conversationHistory || []);

    res.json({
      answer,
      sources: topChunks.map(c => ({
        text: c.text.substring(0, 200),
        relevance: c.score,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
