// src/pages/ProviderDashboardPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import toast from 'react-hot-toast';
import { Star, Edit, Save, MessageCircle, BarChart2 } from 'lucide-react';

const CATEGORIES = [
  'שיפוצים','חשמל','אינסטלציה','ניקיון','גינון','צביעה',
  'מיזוג אוויר','גבס ותקרות','מנעולנות','הובלות','נגרות','עיצוב פנים'
];

export default function ProviderDashboardPage() {
  const { currentUser } = useAuth();
  const [providerData, setProviderData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const snap = await getDoc(doc(db, 'providers', currentUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      setProviderData(data);
      setForm({
        firstName: data.firstName, lastName: data.lastName,
        phone: data.phone, description: data.description,
        location: data.location, priceRange: data.priceRange,
        categories: data.categories || [],
      });
    }
    const revSnap = await getDocs(query(collection(db, 'reviews'), where('providerId', '==', currentUser.uid)));
    setReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updates = { ...form };
      if (imageFile) {
        const imgRef = ref(storage, `providers/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(imgRef, imageFile);
        updates.profileImageUrl = await getDownloadURL(imgRef);
      }
      await updateDoc(doc(db, 'providers', currentUser.uid), updates);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        firstName: form.firstName, lastName: form.lastName, phone: form.phone
      });
      toast.success('הפרופיל עודכן!');
      setEditing(false);
      loadData();
    } catch { toast.error('שגיאה בשמירה'); }
    setSaving(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>לוח בקרה - ספק שירות</h1>
        <button className="btn btn-primary btn-sm" onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}>
          {saving ? <span className="spinner" /> : editing ? <><Save size={15} /> שמור</> : <><Edit size={15} /> ערוך פרופיל</>}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <Star />, label: 'דירוג ממוצע', value: providerData?.rating?.toFixed(1) || '0.0' },
          { icon: <MessageCircle />, label: 'ביקורות', value: providerData?.reviewCount || 0 },
          { icon: <BarChart2 />, label: 'פרופיל', value: 'פעיל' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Edit */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>פרטי פרופיל</h2>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="input-group"><label>שם פרטי</label>
                <input className="input-field" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div className="input-group"><label>שם משפחה</label>
                <input className="input-field" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} /></div>
            </div>
            <div className="input-group"><label>תיאור</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'none' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="input-group"><label>מיקום</label>
                <input className="input-field" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div className="input-group"><label>טווח מחירים</label>
                <input className="input-field" value={form.priceRange} onChange={e => setForm(p => ({ ...p, priceRange: e.target.value }))} /></div>
            </div>
            <div className="input-group">
              <label>קטגוריות</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    className={`badge ${form.categories.includes(cat) ? 'badge-primary' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}
                    onClick={() => setForm(p => ({ ...p, categories: p.categories.includes(cat) ? p.categories.filter(c => c !== cat) : [...p.categories, cat] }))}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>תמונת פרופיל</label>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', alignSelf: 'flex-start' }}>
                <input type="file" accept="image/*" hidden onChange={e => setImageFile(e.target.files[0])} />
                החלף תמונה
              </label>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {providerData?.profileImageUrl ? <img src={providerData.profileImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${providerData?.firstName?.[0]}${providerData?.lastName?.[0]}`}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{providerData?.firstName} {providerData?.lastName}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{providerData?.location}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>{providerData?.description}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {providerData?.categories?.map(cat => <span key={cat} className="badge badge-primary" style={{ fontSize: 11 }}>{cat}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>ביקורות ({reviews.length})</h2>
        {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>אין ביקורות עדיין</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: 14, border: '1px solid var(--border-light)', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={i <= r.rating ? '#F59E0B' : 'var(--border)'} color={i <= r.rating ? '#F59E0B' : 'var(--border)'} />)}
                  <span style={{ marginRight: 8, fontWeight: 600, fontSize: 13 }}>{r.customerName}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
