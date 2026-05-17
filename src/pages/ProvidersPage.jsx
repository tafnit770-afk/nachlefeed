// src/pages/ProvidersPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import ProviderCard from '../components/shared/ProviderCard';
import '../components/shared/ProviderCard.css';
import { Search, Filter, X } from 'lucide-react';
import './ProvidersPage.css';

const CATEGORIES = [
  'אינסטלטור', 'חשמלאי', 'טכנאי מזגנים', 'שיפוצניק', 'צבעי',
  'מנעולן', 'נגר', 'מתקין מטבחים', 'ניקיון בתים', 'ניקיון משרדים',
  'גנן', 'הובלות', 'הדברה', 'הנדימן', 'שטיפת רכבים',
  'טכנאי מחשבים', 'טכנאי סלולר', 'בונה אתרים', 'מעצב גרפי',
  'עורך וידאו', 'צלם אירועים', 'DJ', 'קייטרינג', 'ספר',
  'קוסמטיקאית', 'מאפרת', 'מאמן כושר אישי', 'מורה פרטי',
  'פסיכולוג', 'תזונאי', 'עורך דין', 'רואה חשבון',
  'מתווך נדל״ן', 'בייביסיטר', 'תכשיטן', 'טכנאית ציפורניים',
  'סופר סת״ם', 'יועץ פנסיוני', 'יועץ השקעות', 'מסגר',
  'מתקין חלונות', 'מטפל בעיסוי', 'קונדיטורית',
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

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

  // ===== חיפוש חכם =====
  const smartSearch = (provider, query) => {
    if (!query || query.trim() === '') return { match: true, score: 0 };
    const q = query.trim().toLowerCase();

    // נרמול טקסט — הסרת ניקוד ורווחים מיותרים
    const normalize = (str) => (str || '').toLowerCase().trim();

    // בניית שדות חיפוש
    const fields = [
      { value: normalize(`${provider.firstName} ${provider.lastName}`), weight: 10 }, // שם מלא
      { value: normalize(provider.firstName), weight: 8 },
      { value: normalize(provider.lastName), weight: 8 },
      { value: normalize(provider.username), weight: 6 },
      { value: normalize(provider.description), weight: 4 },
      { value: normalize(provider.location), weight: 5 },
      { value: normalize(provider.categories?.join(' ')), weight: 7 },
    ];

    let totalScore = 0;
    let anyMatch = false;

    for (const field of fields) {
      if (!field.value) continue;

      // התאמה מדויקת מלאה
      if (field.value === q) { totalScore += field.weight * 10; anyMatch = true; continue; }

      // מתחיל עם המילה
      if (field.value.startsWith(q)) { totalScore += field.weight * 5; anyMatch = true; continue; }

      // מכיל את הביטוי
      if (field.value.includes(q)) { totalScore += field.weight * 3; anyMatch = true; continue; }

      // חיפוש לפי מילים בודדות
      const words = q.split(/\s+/);
      const fieldWords = field.value.split(/\s+/);
      let wordScore = 0;
      for (const word of words) {
        if (word.length < 1) continue;
        for (const fw of fieldWords) {
          if (fw === word) { wordScore += field.weight * 2; anyMatch = true; }
          else if (fw.startsWith(word)) { wordScore += field.weight * 1.5; anyMatch = true; }
          else if (fw.includes(word)) { wordScore += field.weight; anyMatch = true; }
        }
      }
      totalScore += wordScore;

      // התאמה חלקית לפי אותיות רצופות (fuzzy - לפחות 2 אותיות)
      if (q.length >= 2) {
        for (let i = 0; i <= field.value.length - q.length; i++) {
          let matches = 0;
          for (let j = 0; j < q.length; j++) {
            if (field.value[i + j] === q[j]) matches++;
          }
          if (matches >= Math.max(2, Math.floor(q.length * 0.7))) {
            totalScore += field.weight * 0.5;
            anyMatch = true;
            break;
          }
        }
      }

      // חיפוש לפי אות בודדת בתחילת מילה
      if (q.length === 1) {
        if (fieldWords.some(fw => fw.startsWith(q))) {
          totalScore += field.weight * 0.8;
          anyMatch = true;
        }
      }
    }

    return { match: anyMatch, score: totalScore };
  };

  const filtered = providers
    .map(p => ({ ...p, _search: smartSearch(p, search) }))
    .filter(p => {
      const matchSearch = !search || p._search.match;
      const matchCat = !selectedCategory || p.categories?.includes(selectedCategory);
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      // אם יש חיפוש — מיין לפי ציון רלוונטיות
      if (search && sortBy === 'rating') {
        const scoreDiff = (b._search.score || 0) - (a._search.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
      }
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      return 0;
    });

  // אם המשתמש לא מחובר — הצג מסך נעילה
  if (!currentUser) {
    return (
      <div className="fade-in" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center',
        padding: 32,
      }}>
        <div style={{ fontSize: 64 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>כניסה נדרשת</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.7 }}>
          כדי לצפות בספקי השירות יש להתחבר או להירשם למערכת.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
            התחברות
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/register')}>
            הרשמה חינם
          </button>
        </div>
      </div>
    );
  }

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
