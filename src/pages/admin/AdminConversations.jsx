// src/pages/admin/AdminConversations.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Trash2, Eye, EyeOff, MessageCircle } from 'lucide-react';
import './AdminTable.css';
import './AdminConversations.css';

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedConv, setExpandedConv] = useState(null);
  const [messages, setMessages] = useState({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => { loadConvs(); }, []);

  const loadConvs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'conversations'));
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      convs.sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0));
      setConversations(convs);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadMessages = async (convId) => {
    if (expandedConv === convId) { setExpandedConv(null); return; }
    setLoadingMsgs(true);
    setExpandedConv(convId);
    if (!messages[convId]) {
      try {
        const snap = await getDocs(query(
          collection(db, 'messages'),
          where('conversationId', '==', convId)
        ));
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setMessages(p => ({ ...p, [convId]: msgs }));
      } catch (e) { console.error(e); }
    }
    setLoadingMsgs(false);
  };

  const deleteConv = async (id) => {
    if (!confirm('מחק שיחה זו וכל ההודעות שבה?')) return;
    try {
      const msgSnap = await getDocs(query(collection(db, 'messages'), where('conversationId', '==', id)));
      await Promise.all(msgSnap.docs.map(d => deleteDoc(d.ref)));
      await deleteDoc(doc(db, 'conversations', id));
      setConversations(p => p.filter(c => c.id !== id));
      toast.success('השיחה נמחקה');
    } catch { toast.error('שגיאה'); }
  };

  const getParticipantNames = (conv) => {
    if (!conv.participantNames) return 'לא ידוע';
    return Object.values(conv.participantNames).join(' ↔ ');
  };

  return (
    <div className="admin-table-page fade-in">
      <div className="admin-page-header">
        <h1>ניהול שיחות</h1>
        <span className="badge badge-gray">{conversations.length} שיחות</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <span className="spinner" style={{ width: 32, height: 32, margin: 'auto', display: 'block' }} />
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageCircle size={40} style={{ margin: '0 auto 12px' }} />
            <p>אין שיחות עדיין</p>
          </div>
        ) : (
          <div>
            {conversations.map(conv => (
              <div key={conv.id} className="conv-admin-item">
                {/* Header Row */}
                <div className="conv-admin-header">
                  <div className="conv-admin-participants">
                    <div className="conv-admin-avatars">
                      <div className="conv-admin-avatar">{Object.values(conv.participantNames || {})[0]?.[0] || '?'}</div>
                      <div className="conv-admin-avatar" style={{ marginRight: -8 }}>{Object.values(conv.participantNames || {})[1]?.[0] || '?'}</div>
                    </div>
                    <div>
                      <div className="conv-admin-names">{getParticipantNames(conv)}</div>
                      <div className="conv-admin-last">{conv.lastMessage || 'שיחה ריקה'}</div>
                    </div>
                  </div>
                  <div className="conv-admin-meta">
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {conv.lastMessageAt?.toDate?.()?.toLocaleDateString('he-IL') || '-'}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => loadMessages(conv.id)}
                        title="צפה בהודעות">
                        {expandedConv === conv.id ? <EyeOff size={14} /> : <Eye size={14} />}
                        {expandedConv === conv.id ? 'סגור' : 'צפה'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteConv(conv.id)} title="מחק שיחה">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Panel */}
                {expandedConv === conv.id && (
                  <div className="conv-admin-messages">
                    <div className="conv-admin-messages-header">
                      <MessageCircle size={14} />
                      <span>{messages[conv.id]?.length || 0} הודעות</span>
                    </div>
                    {loadingMsgs ? (
                      <div style={{ padding: 20, textAlign: 'center' }}>
                        <span className="spinner" style={{ width: 20, height: 20, margin: 'auto', display: 'block' }} />
                      </div>
                    ) : messages[conv.id]?.length === 0 ? (
                      <p style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>אין הודעות בשיחה זו</p>
                    ) : (
                      <div className="conv-admin-chat">
                        {messages[conv.id]?.map(msg => (
                          <div key={msg.id} className="admin-message-row">
                            <div className="admin-message-sender">{msg.senderName || 'משתמש'}</div>
                            <div className="admin-message-text">{msg.text}</div>
                            <div className="admin-message-time">
                              {msg.createdAt?.toDate?.()?.toLocaleString('he-IL', {
                                hour: '2-digit', minute: '2-digit',
                                day: '2-digit', month: '2-digit'
                              }) || ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
