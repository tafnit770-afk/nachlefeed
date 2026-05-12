// src/pages/ProvidersPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import ProviderCard from '../components/shared/ProviderCard';
import '../components/shared/ProviderCard.css';
import { Search, Filter, X } from 'lucide-react';
import './ProvidersPage.css';

const CATEGORIES = [
  'שיפוצים','חשמל','אינסטלציה','ניקיון','גינון','צביעה',
  'מיזוג אוויר','גבס ותקרות','מנעולנות','הובלות','נגרות','עיצוב פנים'
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    loadProviders();
    if (currentUser && userProfile?.favorites) setFavorites(userProfile.favorites);
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'providers'), orderBy('rating', 'desc')));
      setProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = providers
    .filter(p => {
      const matchSearch = !search || `${p.firstName} ${p.lastName} ${p.description || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || p.categories?.includes(selectedCategory);
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      return 0;
    });

  return (
    <div className="providers-page fade-in">
      {/* Filters */}
      <div className="providers-filters card">
        <div className="filters-row">
          <div className="filter-search">
            <Search size={16} className="input-icon" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input-field" placeholder="חפש ספק..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingRight: 38 }} />
          </div>
          <select className="input-field filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="rating">מיון: דירוג</option>
            <option value="reviews">מיון: ביקורות</option>
          </select>
          {(search || selectedCategory) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSelectedCategory(''); }}>
              <X size={16} /> נקה
            </button>
          )}
        </div>

        <div className="filter-categories">
          <button className={`filter-cat-btn ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>
            הכל
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`filter-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="providers-header">
        <h2>{filtered.length} ספקים נמצאו</h2>
        {selectedCategory && <span className="badge badge-primary">{selectedCategory}</span>}
      </div>

      {loading ? (
        <div className="providers-loading">
          {[1,2,3,4,5,6].map(i => <div key={i} className="provider-card-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="providers-empty card">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3>לא נמצאו ספקים</h3>
          <p>נסה לחפש במילות חיפוש שונות</p>
        </div>
      ) : (
        <div className="providers-grid">
          {filtered.map(p => (
            <ProviderCard key={p.id} provider={p}
              isFavorite={favorites.includes(p.uid)}
              onFavoriteToggle={loadProviders} />
          ))}
        </div>
      )}
    </div>
  );
}
