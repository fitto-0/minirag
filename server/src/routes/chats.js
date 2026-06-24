const express = require('express');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title createdAt updatedAt')
      .sort('-updatedAt');
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, messages } = req.body;
    const chat = await Chat.create({
      userId: req.user._id,
      title: title || 'New Chat',
      messages: messages || [],
    });
    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { role, content, sources } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({ role, content, sources: sources || [] });
    await chat.save();

    res.status(201).json({ message: chat.messages[chat.messages.length - 1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/messages/:messageId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.content = content;
    message.isEdited = true;
    await chat.save();

    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
