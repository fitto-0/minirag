const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pdf',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  vector: {
    type: [Number],
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

chunkSchema.index({ pdfId: 1, chunkIndex: 1 });
chunkSchema.index({ userId: 1 });

module.exports = mongoose.model('Chunk', chunkSchema);
