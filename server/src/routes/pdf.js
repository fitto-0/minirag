const express = require('express');
const fs = require('fs');
const path = require('path');
const Pdf = require('../models/Pdf');
const Chunk = require('../models/Chunk');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { processPdf } = require('../services/pdfProcessor');

const router = express.Router();

router.post('/upload', protect, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const pdf = await Pdf.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      storedPath: req.file.path,
      fileSize: req.file.size,
    });

    processPdf(pdf._id, req.file.path);

    res.status(201).json({
      message: 'PDF uploaded and processing started',
      pdf: {
        id: pdf._id,
        originalName: pdf.originalName,
        fileSize: pdf.fileSize,
        status: pdf.status,
        createdAt: pdf.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const pdfs = await Pdf.find({ userId: req.user._id })
      .select('originalName fileSize pageCount status createdAt')
      .sort('-createdAt');

    res.json({ pdfs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const pdf = await Pdf.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    res.json({ pdf });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const pdf = await Pdf.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    await Chunk.deleteMany({ pdfId: pdf._id });

    fs.unlink(pdf.storedPath, () => {});

    res.json({ message: 'PDF deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/view', protect, async (req, res) => {
  try {
    const pdf = await Pdf.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.sendFile(path.resolve(pdf.storedPath));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
