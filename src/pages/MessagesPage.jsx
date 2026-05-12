// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot, orderBy, addDoc,
  serverTimestamp, doc, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { trackMessage } from '../utils/analytics';
import { Send, MessageCircle, ArrowRight, Paperclip, X, Image, FileText } from 'lucide-react';
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
  const [attachment, setAttachment] = useState(null); // { type, name, data, url }
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
    });
    return unsub;
  }, [currentUser]);

  // Load messages
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConv)
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(msgs);
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

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('הקובץ גדול מדי. מקסימום 2MB');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({
        type: isImage ? 'image' : 'file',
        name: file.name,
        data: ev.target.result, // base64
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeConv || sending) return;
    const msgText = newMessage.trim();
    setNewMessage('');
    const currentAttachment = attachment;
    setAttachment(null);
    setSending(true);
    try {
      const msgData = {
        conversationId: activeConv,
        senderId: currentUser.uid,
        senderName: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim(),
        text: msgText,
        createdAt: serverTimestamp(),
      };
      if (currentAttachment) {
        msgData.attachment = {
          type: currentAttachment.type,
          name: currentAttachment.name,
          data: currentAttachment.data,
          mimeType: currentAttachment.mimeType,
        };
      }
      await addDoc(collection(db, 'messages'), msgData);
      await updateDoc(doc(db, 'conversations', activeConv), {
        lastMessage: currentAttachment ? `📎 ${currentAttachment.name}` : msgText,
        lastMessageAt: serverTimestamp(),
      });
      trackMessage(currentUser.uid);
    } catch (err) {
      console.error('Send error:', err);
      setNewMessage(msgText);
      setAttachment(currentAttachment);
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
    if (!conv?.participants) return 'משתמש';
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
                    {msg.text && <div className="message-text">{msg.text}</div>}
                    {msg.attachment && (
                      <div className="message-attachment">
                        {msg.attachment.type === 'image' ? (
                          <img
                            src={msg.attachment.data}
                            alt={msg.attachment.name}
                            className="message-image"
                            onClick={() => window.open(msg.attachment.data, '_blank')}
                          />
                        ) : (
                          <a href={msg.attachment.data} download={msg.attachment.name}
                            className="message-file">
                            <FileText size={18} />
                            <span>{msg.attachment.name}</span>
                          </a>
                        )}
                      </div>
                    )}
                    <div className="message-time">
                      {msg.createdAt?.toDate?.()?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) || ''}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            {attachment && (
              <div className="attachment-preview">
                <div className="attachment-preview-inner">
                  {attachment.type === 'image'
                    ? <><Image size={16} /><span>{attachment.name}</span></>
                    : <><FileText size={16} /><span>{attachment.name}</span></>
                  }
                  <button onClick={() => setAttachment(null)} className="attachment-remove">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input type="file" ref={fileInputRef} hidden
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handleFileSelect} />
              <button type="button" className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="צרף קובץ או תמונה">
                <Paperclip size={18} />
              </button>
              <input
                className="chat-input"
                placeholder="כתוב הודעה... (Enter לשליחה)"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button type="submit" className="chat-send-btn"
                disabled={sending || (!newMessage.trim() && !attachment)}>
                {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={18} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
