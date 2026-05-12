// src/components/shared/ProviderCard.jsx
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProviderCard({ provider, isFavorite, onFavoriteToggle }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [fav, setFav] = useState(isFavorite);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!currentUser) { toast.error('יש להתחבר כדי להוסיף למועדפים'); return; }
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      if (fav) {
        await updateDoc(userRef, { favorites: arrayRemove(provider.uid) });
        toast.success('הוסר מהמועדפים');
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(provider.uid) });
        toast.success('נוסף למועדפים!');
      }
      setFav(!fav);
      onFavoriteToggle?.();
    } catch { toast.error('שגיאה'); }
  };

  return (
    <div className="provider-card" onClick={() => navigate(`/providers/${provider.uid}`)}>
      <div className="provider-card-header">
        <div className="provider-card-avatar">
          {provider.profileImageUrl
            ? <img src={provider.profileImageUrl} alt={provider.firstName} />
            : `${provider.firstName?.[0] || ''}${provider.lastName?.[0] || ''}`
          }
        </div>
        <button className={`provider-fav-btn ${fav ? 'active' : ''}`} onClick={handleFavorite}>
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="provider-card-body">
        <h3 className="provider-card-name">{provider.firstName} {provider.lastName}</h3>
        <div className="provider-card-location">
          <MapPin size={13} />
          <span>{provider.location || 'לא צוין'}</span>
        </div>
        <div className="provider-card-rating">
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <strong>{provider.rating?.toFixed(1) || '0.0'}</strong>
          <span>({provider.reviewCount || 0} ביקורות)</span>
        </div>

        <div className="provider-card-categories">
          {provider.categories?.slice(0, 3).map(cat => (
            <span key={cat} className="badge badge-primary" style={{ fontSize: 11 }}>{cat}</span>
          ))}
          {provider.categories?.length > 3 && (
            <span className="badge badge-gray" style={{ fontSize: 11 }}>+{provider.categories.length - 3}</span>
          )}
        </div>

        {provider.priceRange && (
          <div className="provider-card-price">
            <span>₪{provider.priceRange}</span><span>/שעה</span>
          </div>
        )}
      </div>

      <div className="provider-card-footer">
        <button className="btn btn-primary btn-sm w-full" onClick={e => { e.stopPropagation(); navigate(`/providers/${provider.uid}`); }}>
          לפרופיל
        </button>
      </div>
    </div>
  );
}
