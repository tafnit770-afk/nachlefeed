// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot, orderBy, addDoc,
  serverTimestamp, doc, updateDoc, getDocs, getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { trackMessage } from '../utils/analytics';
import { Send, MessageCircle, ArrowRight } from 'lucide-react';
import './MessagesPage.css';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeConv, setActiveConv] = useState(conversationId || null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );
    const unsub = onSnapshot(q, snap => {
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      convs.sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0));
      setConversations(convs);
    }, err => console.error('Conversations error:', err));
    return unsub;
  }, [currentUser]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConv),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMsgs(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, err => {
      console.error('Messages error:', err);
      setLoadingMsgs(false);
    });
    return unsub;
  }, [activeConv]);

  useEffect(() => {
    if (conversationId) setActiveConv(conversationId);
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || sending) return;
    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: activeConv,
        senderId: currentUser.uid,
        senderName: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim(),
        text: msgText,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'conversations', activeConv), {
        lastMessage: msgText,
        lastMessageAt: serverTimestamp(),
      });
      trackMessage(currentUser.uid);
    } catch (err) {
      console.error('Send error:', err);
      setNewMessage(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const getOtherParticipantName = (conv) => {
    if (!conv || !conv.participants) return 'משתמש';
    const otherId = conv.participants.find(p => p !== currentUser?.uid);
    return conv.participantNames?.[otherId] || 'משתמש';
  };

  const selectConv = (id) => {
    setActiveConv(id);
    navigate(`/messages/${id}`);
  };

  const activeConvData = conversations.find(c => c.id === activeConv);

  return (
    <div className="messages-page fade-in">
      {/* Conversations List */}
      <div className={`conversations-panel ${activeConv ? 'mobile-hidden' : ''}`}>
        <div className="conversations-header">
          <h2>הודעות</h2>
          <span className="badge badge-primary">{conversations.length}</span>
        </div>
        {conversations.length === 0 ? (
          <div className="conv-empty">
            <MessageCircle size={40} color="var(--text-muted)" />
            <p>אין שיחות עדיין</p>
            <p style={{ fontSize: 12 }}>עבור לפרופיל ספק ולחץ "שלח הודעה"</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map(conv => (
              <div key={conv.id}
                className={`conv-item ${activeConv === conv.id ? 'active' : ''}`}
                onClick={() => selectConv(conv.id)}>
                <div className="conv-avatar">{getOtherParticipantName(conv)[0]?.toUpperCase()}</div>
                <div className="conv-info">
                  <div className="conv-name">{getOtherParticipantName(conv)}</div>
                  <div className="conv-last">{conv.lastMessage || 'שיחה חדשה'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={`chat-panel ${!activeConv ? 'mobile-hidden' : ''}`}>
        {!activeConv ? (
          <div className="chat-empty">
            <MessageCircle size={60} color="var(--text-muted)" />
            <h3>בחר שיחה</h3>
            <p>בחר שיחה מהרשימה כדי להתחיל</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <button className="btn btn-ghost btn-sm mobile-back"
                onClick={() => { setActiveConv(null); navigate('/messages'); }}>
                <ArrowRight size={18} />
              </button>
              <div className="chat-header-avatar">
                {getOtherParticipantName(activeConvData || {})[0]?.toUpperCase()}
              </div>
              <div className="chat-header-name">{getOtherParticipantName(activeConvData || {})}</div>
            </div>

            <div className="chat-messages">
              {loadingMsgs ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <span className="spinner" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <p>התחל את השיחה! 👋</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id}
                    className={`message-bubble ${msg.senderId === currentUser.uid ? 'mine' : 'theirs'}`}>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {msg.createdAt?.toDate?.()?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) || ''}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                className="chat-input"
                placeholder="כתוב הודעה... (Enter לשליחה)"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                autoFocus
              />
              <button type="submit" className="chat-send-btn"
                disabled={sending || !newMessage.trim()}>
                {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={18} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
