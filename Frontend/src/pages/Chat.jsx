import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/Chat.css';

// Configure axios base URL for API calls
axios.defaults.baseURL = 'http://localhost:3001';

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const userScrolledRef = useRef(false);

  const token = localStorage.getItem('token');

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Set theme attribute on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (!userScrolledRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Track when user scrolls up
  const handleScroll = (e) => {
    const element = e.target;
    // If user is not at the bottom, mark as scrolled
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    userScrolledRef.current = !isAtBottom;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize user and chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (!storedUser || !storedToken) {
        navigate('/auth');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch all user chats first
        let chatData = [];
        try {
          const response = await axios.get('/api/chats', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          chatData = Array.isArray(response.data) ? response.data : (response.data.chats || []);
          setChats(chatData);
        } catch (error) {
          console.error('Error fetching chats:', error);
          setChats([]);
        }

        // Check for saved chatId
        const savedChatId = localStorage.getItem('currentChatId');
        if (savedChatId && chatData.some(c => c._id === savedChatId)) {
          setChatId(savedChatId);
          const savedChat = chatData.find(c => c._id === savedChatId);
          if (savedChat) setChatTitle(savedChat.title);
        } else if (chatData.length > 0) {
          // Use the first chat if saved one doesn't exist
          setChatId(chatData[0]._id);
          setChatTitle(chatData[0].title);
          localStorage.setItem('currentChatId', chatData[0]._id);
        } else {
          // Create new chat if none exists
          try {
            const response = await axios.post(
              '/api/chats',
              { title: 'New Chat' },
              { headers: { Authorization: `Bearer ${storedToken}` } }
            );
            const newChatId = response.data._id;
            setChatId(newChatId);
            setChatTitle('New Chat');
            localStorage.setItem('currentChatId', newChatId);
            // Fetch updated chat list
            const updatedResponse = await axios.get('/api/chats', {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            const updatedChatData = Array.isArray(updatedResponse.data) ? updatedResponse.data : (updatedResponse.data.chats || []);
            setChats(updatedChatData);
          } catch (error) {
            console.error('Error creating chat:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/auth');
      }
    };

    initializeChat();
  }, [navigate]);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      const response = await axios.get('/api/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const chatData = Array.isArray(response.data) ? response.data : (response.data.chats || []);
      setChats(chatData);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  }, [token]);

  // Periodically refresh chat list to show updated timestamps
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      fetchChats();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [token, fetchChats]);

  // Create new chat
  const createNewChat = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/chats',
        { title: 'New Chat' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChatId = response.data._id;
      setChatId(newChatId);
      setChatTitle('New Chat');
      localStorage.setItem('currentChatId', newChatId);
      setMessages([]);
      fetchChats();
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load chat messages
  const loadChat = async (id) => {
    // Don't switch chats while sending a message
    if (isSending) return;
    
    // Close sidebar on mobile after selecting chat
    setSidebarOpen(false);
    
    try {
      setChatId(id);
      localStorage.setItem('currentChatId', id);
      setMessages([]);
      
      // Find and set the chat title
      const chat = chats.find(c => c._id === id);
      if (chat) {
        setChatTitle(chat.title);
      }
      
      const response = await axios.get(`/api/chats/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msgData = Array.isArray(response.data) ? response.data : (response.data.messages || []);
      setMessages(msgData);
    } catch (error) {
      console.error('Error loading chat:', error);
      setMessages([]);
    }
  };

  // Poll for new messages
  useEffect(() => {
    // Don't poll if we don't have a valid chatId or token
    if (!chatId || chatId === 'undefined' || !token) return;

    let lastMessageId = null;
    let isMounted = true;
    let isFirstPoll = true;

    const pollMessages = async () => {
      if (!isMounted) return;
      
      try {
        const response = await axios.get(`/api/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!isMounted) return;
        
        const msgData = Array.isArray(response.data) ? response.data : (response.data.messages || []);
        
        // Only update if there are new messages or it's the first poll
        if (Array.isArray(msgData)) {
          if (msgData.length > 0) {
            const newestMessageId = msgData[msgData.length - 1]._id;
            if (isFirstPoll || lastMessageId !== newestMessageId) {
              lastMessageId = newestMessageId;
              setMessages(msgData);
              isFirstPoll = false;
            }
          } else if (isFirstPoll) {
            // Only set empty on first poll if truly empty
            setMessages([]);
            isFirstPoll = false;
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Small delay to let loadChat complete first
    const initialTimer = setTimeout(() => {
      if (isMounted) {
        pollMessages();
      }
    }, 100);

    // Poll every second after initial fetch
    const interval = setInterval(pollMessages, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [chatId, token]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatId || isSending) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsSending(true);
    
    // Immediately add user message to the display
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() }
    ]);
    
    setLoading(true);

    try {
      const response = await axios.post(
        `/api/chats/${chatId}/messages`,
        { chatId, content: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update messages with both user and AI response
      const msgData = Array.isArray(response.data.messages) ? response.data.messages : (response.data.messages || []);
      setMessages(msgData);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setLoading(false);
      setIsSending(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentChatId');
    navigate('/auth');
  };

  // Delete chat
  const handleDeleteChat = async (e, chatIdToDelete) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/chats/${chatIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from chats list
      const updatedChats = chats.filter(c => c._id !== chatIdToDelete);
      setChats(updatedChats);

      // If deleted chat is active, switch to another chat or create new one
      if (chatId === chatIdToDelete) {
        if (updatedChats.length > 0) {
          // Switch to the first available chat
          const nextChatId = updatedChats[0]._id;
          setChatId(nextChatId);
          localStorage.setItem('currentChatId', nextChatId);
        } else {
          // Only create new chat if no chats are left
          createNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat');
    }
  };

  // Start editing chat title
  const handleStartEditChat = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditingTitle(chat.title);
  };

  // Save renamed chat
  const handleSaveRename = async (e) => {
    e.stopPropagation();
    
    if (!editingTitle.trim()) {
      alert('Chat title cannot be empty');
      return;
    }

    try {
      const response = await axios.put(
        `/api/chats/${editingChatId}`,
        { title: editingTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update chats list with new title
      setChats(chats.map(c => 
        c._id === editingChatId ? { ...c, title: response.data.chat.title } : c
      ));
      
      // Update current chat title if this is the active chat
      if (chatId === editingChatId) {
        setChatTitle(response.data.chat.title);
      }

      setEditingChatId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error renaming chat:', error);
      alert('Error renaming chat');
    }
  };

  // Cancel editing
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditingTitle('');
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Format message time safely
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Export chat as JSON
  const handleExportJSON = () => {
    if (!chatId || !messages || messages.length === 0) {
      alert('No messages to export');
      return;
    }

    const currentChat = chats.find(c => c._id === chatId);
    const chatName = currentChat?.title || 'Chat';
    
    const exportData = {
      chatName,
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        role: msg.role === 'user' ? 'User' : 'AI',
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown'
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chatName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export chat as Text
  const handleExportText = () => {
    if (!chatId || !messages || messages.length === 0) {
      alert('No messages to export');
      return;
    }

    const currentChat = chats.find(c => c._id === chatId);
    const chatName = currentChat?.title || 'Chat';
    
    let textContent = `Chat: ${chatName}\n`;
    textContent += `Exported: ${new Date().toLocaleString()}\n`;
    textContent += `Messages: ${messages.length}\n`;
    textContent += `${'='.repeat(50)}\n\n`;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'AI';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown';
      textContent += `${role} (${time}):\n${msg.content}\n\n`;
    });

    const dataBlob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chatName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`chat-container ${theme}`} data-theme={theme}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">Chat App</div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          </div>
        </div>

        <button className="new-chat-btn" onClick={createNewChat}>
          + New Chat
        </button>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search chats..."
            className="search-input"
          />
        </div>

        {/* Chats Section */}
        <div className="sidebar-section">
          <div className="section-title">Chat History</div>
          <div className="chats-list">
            {!Array.isArray(chats) || chats.length === 0 ? (
              <p className="empty-message">No chats yet</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${chatId === chat._id ? 'active' : ''}`}
                  onClick={() => loadChat(chat._id)}
                >
                  <span className="chat-icon">💬</span>
                  <div className="chat-info">
                    {editingChatId === chat._id ? (
                      <input
                        type="text"
                        className="chat-title-input"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e);
                          if (e.key === 'Escape') handleCancelEdit(e);
                        }}
                      />
                    ) : (
                      <>
                        <div className="chat-title">{chat.title}</div>
                        <div className="chat-date">
                          {new Date(chat.lastActivity).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="chat-item-actions">
                    {editingChatId === chat._id ? (
                      <>
                        <button
                          className="chat-action-btn chat-save-btn"
                          onClick={handleSaveRename}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          className="chat-action-btn chat-cancel-btn"
                          onClick={handleCancelEdit}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="chat-action-btn chat-rename-btn"
                          onClick={(e) => handleStartEditChat(e, chat)}
                          title="Rename chat"
                        >
                          ✎
                        </button>
                        <button
                          className="chat-delete-btn"
                          onClick={(e) => handleDeleteChat(e, chat._id)}
                          title="Delete chat"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="sidebar-footer">
          {user && user.email && (
            <>
              <div className="user-info">
                <div className="user-avatar">{user.email.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  <div className="user-name">You</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <h1>{chatTitle}</h1>
          <div className="chat-header-actions">
            <div className="export-menu-container">
              <button
                className="export-menu-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Export options"
              >
                ⋮
              </button>
              {showExportMenu && (
                <div className="export-menu-dropdown">
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      handleExportJSON();
                      setShowExportMenu(false);
                    }}
                  >
                    📄 Export as JSON
                  </button>
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      handleExportText();
                      setShowExportMenu(false);
                    }}
                  >
                    📝 Export as Text
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-area" onScroll={handleScroll}>
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="empty-state">
              <h2>Welcome to Chat App</h2>
              <p>Start a conversation by typing a message below</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`message message-${msg.role}`}>
                  <div className="message-content">
                    <div className="message-role">{msg.role === 'user' ? '👤 You' : '🤖 Nova'}</div>
                    <div className="message-text">
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {formatMessageTime(msg.timestamp) && (
                      <div className="message-time">
                        {formatMessageTime(msg.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message message-assistant">
                  <div className="message-content">
                    <div className="message-role">🤖 Nova</div>
                    <div className="message-text">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <footer className="chat-footer">
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="message-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="send-button"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
