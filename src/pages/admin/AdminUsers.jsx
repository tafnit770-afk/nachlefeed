// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Trash2, Search, Filter } from 'lucide-react';
import './AdminTable.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('בטוח שברצונך למחוק משתמש זה?')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(p => p.filter(u => u.id !== id));
      toast.success('המשתמש נמחק');
    } catch { toast.error('שגיאה במחיקה'); }
    setDeletingId(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleLabel = { customer: 'לקוח', provider: 'ספק', admin: 'מנהל' };
  const roleBadge = { customer: 'badge-success', provider: 'badge-primary', admin: 'badge-warning' };

  return (
    <div className="admin-table-page fade-in">
      <div className="admin-page-header">
        <h1>ניהול משתמשים</h1>
        <span className="badge badge-gray">{filtered.length} משתמשים</span>
      </div>

      <div className="table-filters card">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="חפש משתמש..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingRight: 36 }} />
        </div>
        <select className="input-field" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">כל התפקידים</option>
          <option value="customer">לקוח</option>
          <option value="provider">ספק</option>
          <option value="admin">מנהל</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 32, height: 32, margin: 'auto', display: 'block' }} /></div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>אימייל</th>
                  <th>שם משתמש</th>
                  <th>תפקיד</th>
                  <th>תאריך הצטרפות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>@{u.username}</td>
                    <td><span className={`badge ${roleBadge[u.role] || 'badge-gray'}`}>{roleLabel[u.role] || u.role}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {u.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || '-'}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} disabled={deletingId === u.id}>
                        {deletingId === u.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
