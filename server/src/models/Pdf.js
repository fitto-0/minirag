const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  storedPath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing',
  },
}, { timestamps: true });

module.exports = mongoose.model('Pdf', pdfSchema);
