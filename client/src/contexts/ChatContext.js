import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { chatsAPI } from '../api/axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

const STORAGE_KEY = 'minirag_chats';

function generateId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  // Always points at the latest current chat, so several calls made in a row
  // (e.g. the question and then the answer) build on each other instead of
  // on the stale value captured when the component last rendered.
  const currentChatRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChats(parsed.chats || []);
        if (parsed.currentId) {
          const found = parsed.chats.find(c => c._id === parsed.currentId);
          if (found) {
            currentChatRef.current = found;
            setCurrentChat(found);
          }
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const saveToStorage = useCallback((chatsList, currentId) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats: chatsList, currentId }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) {
      setChats([]);
      currentChatRef.current = null;
      setCurrentChat(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadChats = async () => {
      try {
        const res = await chatsAPI.getAll();
        setChats(res.data.chats || []);
        saveToStorage(res.data.chats || [], null);
      } catch {
        loadFromStorage();
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user, loadFromStorage, saveToStorage]);

  useEffect(() => {
    if (!user) return;
    const currentId = currentChat?._id;
    saveToStorage(chats, currentId);
  }, [chats, currentChat, user, saveToStorage]);

  const setCurrent = useCallback((chat) => {
    currentChatRef.current = chat;
    setCurrentChat(chat);
  }, []);

  const upsertChat = useCallback((chat) => {
    setChats(prev => (
      prev.some(c => c._id === chat._id)
        ? prev.map(c => (c._id === chat._id ? chat : c))
        : [chat, ...prev]
    ));
  }, []);

  const newChat = useCallback(async () => {
    let chat = {
      _id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        const res = await chatsAPI.create({ title: 'New Chat' });
        chat = { ...res.data.chat, messages: res.data.chat.messages || [] };
      } catch { /* keep the local chat */ }
    }

    setCurrent(chat);
    upsertChat(chat);
    return chat;
  }, [user, setCurrent, upsertChat]);

  const closeChat = useCallback(() => {
    setCurrent(null);
  }, [setCurrent]);

  const selectChat = useCallback(async (chatId) => {
    const local = chats.find(c => c._id === chatId);
    if (local && local._id && !local._id.startsWith('local_')) {
      try {
        const res = await chatsAPI.getOne(chatId);
        const full = res.data.chat;
        setCurrent(full);
        setChats(prev => prev.map(c => c._id === chatId ? full : c));
      } catch {
        setCurrent(local);
      }
    } else {
      setCurrent(local || null);
    }
  }, [chats, setCurrent]);

  const addMessage = useCallback(async (role, content, sources) => {
    const chat = currentChatRef.current;
    if (!chat) return null;

    const tempMsg = {
      _id: generateId(),
      role,
      content,
      sources: sources || [],
      isEdited: false,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...chat,
      messages: [...(chat.messages || []), tempMsg],
      updatedAt: new Date().toISOString(),
    };

    if (chat.title === 'New Chat' && role === 'user') {
      updated.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    setCurrent(updated);
    upsertChat(updated);

    if (user && !chat._id.startsWith('local_')) {
      try {
        const res = await chatsAPI.addMessage(chat._id, { role, content, sources });
        const saved = res.data.message;
        // Swap the temporary id for the server one so the message can be edited later
        const replaceId = (c) => ({
          ...c,
          messages: c.messages.map(m => (m._id === tempMsg._id ? { ...m, _id: saved._id } : m)),
        });
        if (currentChatRef.current?._id === chat._id) {
          setCurrent(replaceId(currentChatRef.current));
        }
        setChats(prev => prev.map(c => (c._id === chat._id && c.messages ? replaceId(c) : c)));
      } catch { /* ignore */ }
      if (updated.title !== chat.title) {
        try {
          await chatsAPI.update(chat._id, { title: updated.title });
        } catch { /* ignore */ }
      }
    }

    return tempMsg;
  }, [user, setCurrent, upsertChat]);

  const editMessage = useCallback(async (messageId, newContent) => {
    const chat = currentChatRef.current;
    if (!chat) return;

    const updated = {
      ...chat,
      messages: chat.messages.map(m =>
        m._id === messageId ? { ...m, content: newContent, isEdited: true } : m
      ),
      updatedAt: new Date().toISOString(),
    };

    setCurrent(updated);
    upsertChat(updated);

    if (user && !chat._id.startsWith('local_') && !messageId.startsWith('local_')) {
      try {
        await chatsAPI.editMessage(chat._id, messageId, { content: newContent });
      } catch { /* ignore */ }
    }
  }, [user, setCurrent, upsertChat]);

  const deleteChat = useCallback(async (chatId) => {
    setChats(prev => prev.filter(c => c._id !== chatId));
    if (currentChatRef.current?._id === chatId) {
      setCurrent(null);
    }
    if (user && !chatId.startsWith('local_')) {
      try {
        await chatsAPI.delete(chatId);
      } catch { /* ignore */ }
    }
  }, [user, setCurrent]);

  return (
    <ChatContext.Provider value={{
      chats, currentChat, loading,
      newChat, closeChat, selectChat,
      addMessage, editMessage, deleteChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
