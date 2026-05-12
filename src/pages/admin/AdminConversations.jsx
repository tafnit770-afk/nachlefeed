// src/pages/admin/AdminConversations.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import './AdminTable.css';

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedConv, setExpandedConv] = useState(null);
  const [messages, setMessages] = useState({});

  useEffect(() => { loadConvs(); }, []);

  const loadConvs = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc')));
    setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const loadMessages = async (convId) => {
    if (messages[convId]) { setExpandedConv(convId); return; }
    const snap = await getDocs(query(collection(db, 'messages'), where('conversationId', '==', convId), orderBy('createdAt', 'asc')));
    setMessages(p => ({ ...p, [convId]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    setExpandedConv(convId);
  };

  const toggleConv = (id) => {
    if (expandedConv === id) { setExpandedConv(null); return; }
    loadMessages(id);
  };

  const deleteConv = async (id) => {
    if (!confirm('מחק שיחה זו?')) return;
    try {
      await deleteDoc(doc(db, 'conversations', id));
      // Also delete messages
      const msgSnap = await getDocs(query(collection(db, 'messages'), where('conversationId', '==', id)));
      await Promise.all(msgSnap.docs.map(d => deleteDoc(d.ref)));
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
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 32, height: 32, margin: 'auto', display: 'block' }} /></div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>משתתפים</th>
                  <th>הודעה אחרונה</th>
                  <th>תאריך</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map(conv => (
                  <>
                    <tr key={conv.id}>
                      <td style={{ fontWeight: 500 }}>{getParticipantNames(conv)}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage || '-'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {conv.lastMessageAt?.toDate?.()?.toLocaleDateString('he-IL') || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleConv(conv.id)}>
                            {expandedConv === conv.id ? <ChevronUp size={13} /> : <Eye size={13} />}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteConv(conv.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedConv === conv.id && (
                      <tr key={`${conv.id}-messages`}>
                        <td colSpan={4} style={{ padding: '0 24px 16px', background: '#F8F9FE' }}>
                          <div style={{ borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <strong style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              הודעות ({messages[conv.id]?.length || 0})
                            </strong>
                            {messages[conv.id]?.map(msg => (
                              <div key={msg.id} style={{ display: 'flex', gap: 10, fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>{msg.senderName}:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                                <span style={{ marginRight: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
                                  {msg.createdAt?.toDate?.()?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
