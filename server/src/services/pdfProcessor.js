const fs = require('fs');
const pdfParse = require('pdf-parse-fork');
const Chunk = require('../models/Chunk');
const Pdf = require('../models/Pdf');
const { getEmbedding } = require('./embedding');

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

async function processPdf(pdfId, filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);

    const pdfDoc = await Pdf.findById(pdfId);
    if (!pdfDoc) throw new Error('PDF record not found');

    pdfDoc.pageCount = data.numpages;
    await pdfDoc.save();

    const chunks = chunkText(data.text);

    for (let i = 0; i < chunks.length; i++) {
      const chunkTextContent = chunks[i];
      if (!chunkTextContent.trim()) continue;

      const vector = await getEmbedding(chunkTextContent);

      await Chunk.create({
        pdfId: pdfDoc._id,
        userId: pdfDoc.userId,
        text: chunkTextContent,
        vector,
        chunkIndex: i,
      });
    }

    pdfDoc.status = 'ready';
    await pdfDoc.save();

    console.log(`PDF ${pdfId} processed: ${chunks.length} chunks created`);
  } catch (error) {
    console.error(`Error processing PDF ${pdfId}:`, error.message);
    await Pdf.findByIdAndUpdate(pdfId, { status: 'failed' });
  }
}

module.exports = { processPdf, chunkText };
