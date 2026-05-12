// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot, orderBy, addDoc,
  serverTimestamp, doc, updateDoc, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { trackMessage } from '../utils/analytics';
import { Send, MessageCircle } from 'lucide-react';
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!activeConv) return;
    const q = query(collection(db, 'messages'),
      where('conversationId', '==', activeConv),
      orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, [activeConv]);

  useEffect(() => {
    if (conversationId) setActiveConv(conversationId);
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: activeConv,
        senderId: currentUser.uid,
        senderName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'conversations', activeConv), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
      });
      trackMessage(currentUser.uid);
      setNewMessage('');
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const getOtherParticipantName = (conv) => {
    const otherId = conv.participants?.find(p => p !== currentUser.uid);
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
        </div>
        {conversations.length === 0 ? (
          <div className="conv-empty">
            <MessageCircle size={40} color="var(--text-muted)" />
            <p>אין שיחות עדיין</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map(conv => (
              <div key={conv.id}
                className={`conv-item ${activeConv === conv.id ? 'active' : ''}`}
                onClick={() => selectConv(conv.id)}>
                <div className="conv-avatar">{getOtherParticipantName(conv)[0]}</div>
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
              <button className="btn btn-ghost btn-sm mobile-back" onClick={() => { setActiveConv(null); navigate('/messages'); }}>
                ←
              </button>
              <div className="chat-header-avatar">{getOtherParticipantName(activeConvData || {})[0]}</div>
              <div className="chat-header-name">{getOtherParticipantName(activeConvData || {})}</div>
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.senderId === currentUser.uid ? 'mine' : 'theirs'}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.createdAt?.toDate?.()?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) || ''}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                className="chat-input"
                placeholder="כתוב הודעה..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="chat-send-btn" disabled={sending || !newMessage.trim()}>
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
