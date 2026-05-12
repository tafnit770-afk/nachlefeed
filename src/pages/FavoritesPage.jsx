// src/pages/FavoritesPage.jsx
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import ProviderCard from '../components/shared/ProviderCard';
import '../components/shared/ProviderCard.css';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { currentUser, userProfile } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFavorites(); }, [userProfile]);

  const loadFavorites = async () => {
    if (!userProfile?.favorites?.length) { setProviders([]); setLoading(false); return; }
    setLoading(true);
    const results = await Promise.all(
      userProfile.favorites.map(async (id) => {
        const snap = await getDoc(doc(db, 'providers', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      })
    );
    setProviders(results.filter(Boolean));
    setLoading(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>המועדפים שלי</h1>
      {providers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Heart size={48} color="var(--text-muted)" />
          <h3>אין מועדפים עדיין</h3>
          <p style={{ color: 'var(--text-secondary)' }}>גלה ספקים ולחץ על הלב כדי לשמור אותם</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {providers.map(p => (
            <ProviderCard key={p.id} provider={p} isFavorite={true} onFavoriteToggle={loadFavorites} />
          ))}
        </div>
      )}
    </div>
  );
}
