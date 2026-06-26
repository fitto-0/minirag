import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChats(parsed.chats || []);
        if (parsed.currentId) {
          const found = parsed.chats.find(c => c._id === parsed.currentId);
          if (found) setCurrentChat(found);
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

  const syncChatToStorage = useCallback((chat) => {
    saveToStorage(
      chats.map(c => c._id === chat._id ? chat : c),
      chat._id
    );
  }, [chats, saveToStorage]);

  const newChat = useCallback(async () => {
    const localChat = {
      _id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentChat(localChat);
    setChats(prev => {
      const exists = prev.find(c => c._id === localChat._id);
      return exists ? prev : [localChat, ...prev];
    });

    if (user) {
      try {
        const res = await chatsAPI.create({ title: 'New Chat' });
        const serverChat = res.data.chat;
        setCurrentChat(serverChat);
        setChats(prev => prev.map(c => c._id === localChat._id ? serverChat : c));
        return serverChat;
      } catch (err) {
        return localChat;
      }
    }

    return localChat;
  }, [user]);

  const closeChat = useCallback(() => {
    setCurrentChat(null);
  }, []);

  const selectChat = useCallback(async (chatId) => {
    const local = chats.find(c => c._id === chatId);
    if (local && local._id && !local._id.startsWith('local_')) {
      try {
        const res = await chatsAPI.getOne(chatId);
        const full = res.data.chat;
        setCurrentChat(full);
        setChats(prev => prev.map(c => c._id === chatId ? full : c));
      } catch {
        setCurrentChat(local);
      }
    } else {
      setCurrentChat(local || null);
    }
  }, [chats]);

  const addMessage = useCallback(async (role, content, sources) => {
    if (!currentChat) return null;

    const tempMsg = {
      _id: generateId(),
      role,
      content,
      sources: sources || [],
      isEdited: false,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...currentChat,
      messages: [...currentChat.messages, tempMsg],
      updatedAt: new Date().toISOString(),
    };

    if (currentChat.title === 'New Chat' && role === 'user') {
      updated.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    setCurrentChat(updated);
    setChats(prev => prev.map(c => c._id === updated._id ? updated : c));
    syncChatToStorage(updated);

    if (user && !currentChat._id.startsWith('local_')) {
      try {
        await chatsAPI.addMessage(currentChat._id, { role, content, sources });
      } catch { /* ignore */ }
      if (updated.title !== currentChat.title) {
        try {
          await chatsAPI.update(currentChat._id, { title: updated.title });
        } catch { /* ignore */ }
      }
    }

    return tempMsg;
  }, [currentChat, user, syncChatToStorage]);

  const editMessage = useCallback(async (messageId, newContent) => {
    if (!currentChat) return;

    const updated = {
      ...currentChat,
      messages: currentChat.messages.map(m =>
        m._id === messageId ? { ...m, content: newContent, isEdited: true } : m
      ),
      updatedAt: new Date().toISOString(),
    };

    setCurrentChat(updated);
    setChats(prev => prev.map(c => c._id === updated._id ? updated : c));
    syncChatToStorage(updated);

    if (user && !currentChat._id.startsWith('local_')) {
      try {
        await chatsAPI.editMessage(currentChat._id, messageId, { content: newContent });
      } catch { /* ignore */ }
    }
  }, [currentChat, user, syncChatToStorage]);

  const deleteChat = useCallback(async (chatId) => {
    setChats(prev => prev.filter(c => c._id !== chatId));
    if (currentChat?._id === chatId) {
      setCurrentChat(null);
    }
    if (user && !chatId.startsWith('local_')) {
      try {
        await chatsAPI.delete(chatId);
      } catch { /* ignore */ }
    }
  }, [currentChat, user]);

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
