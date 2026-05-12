// src/pages/ProviderProfilePage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { trackConversationCreated } from '../utils/analytics';
import toast from 'react-hot-toast';
import { MapPin, Star, Phone, MessageCircle, DollarSign, ChevronRight } from 'lucide-react';
import './ProviderProfilePage.css';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    loadProvider();
  }, [id]);

  const loadProvider = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'providers', id));
      if (snap.exists()) setProvider({ id: snap.id, ...snap.data() });

      const revSnap = await getDocs(query(collection(db, 'reviews'), where('providerId', '==', id)));
      setReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleStartChat = async () => {
    if (!currentUser) { toast.error('יש להתחבר כדי לשלוח הודעה'); navigate('/login'); return; }
    setStartingChat(true);
    try {
      const q = query(collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => d.data().participants.includes(id));
      
      if (existing) {
        navigate(`/messages/${existing.id}`);
      } else {
        const convRef = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, id],
          participantNames: {
            [currentUser.uid]: `${userProfile?.firstName} ${userProfile?.lastName}`,
            [id]: `${provider.firstName} ${provider.lastName}`,
          },
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
        });
        trackConversationCreated(currentUser.uid);
        navigate(`/messages/${convRef.id}`);
      }
    } catch (e) { toast.error('שגיאה ביצירת שיחה'); }
    setStartingChat(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error('יש להתחבר כדי לכתוב ביקורת'); return; }
    setSubmittingReview(true);
    try {
      const existing = reviews.find(r => r.customerId === currentUser.uid);
      if (existing) { toast.error('כבר כתבת ביקורת על ספק זה'); setSubmittingReview(false); return; }

      await addDoc(collection(db, 'reviews'), {
        providerId: id,
        customerId: currentUser.uid,
        customerName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: serverTimestamp(),
      });

      const newCount = (provider.reviewCount || 0) + 1;
      const newRating = ((provider.rating || 0) * (provider.reviewCount || 0) + reviewForm.rating) / newCount;
      await updateDoc(doc(db, 'providers', id), { rating: newRating, reviewCount: newCount });

      toast.success('ביקורתך נשמרה!');
      setReviewForm({ rating: 5, comment: '' });
      loadProvider();
    } catch { toast.error('שגיאה בשמירת ביקורת'); }
    setSubmittingReview(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!provider) return <div className="card" style={{ textAlign: 'center', padding: 48 }}>ספק לא נמצא</div>;

  return (
    <div className="provider-profile fade-in">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/providers')} style={{ marginBottom: 16 }}>
        <ChevronRight size={16} /> חזרה לספקים
      </button>

      <div className="profile-layout">
        {/* Main */}
        <div className="profile-main">
          {/* Header Card */}
          <div className="profile-header card">
            <div className="profile-header-bg" />
            <div className="profile-header-content">
              <div className="profile-big-avatar">
                {provider.profileImageUrl
                  ? <img src={provider.profileImageUrl} alt={provider.firstName} />
                  : `${provider.firstName?.[0] || ''}${provider.lastName?.[0] || ''}`}
              </div>
              <div className="profile-info">
                <h1>{provider.firstName} {provider.lastName}</h1>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /><span>{provider.location}</span>
                  </div>
                  {provider.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Phone size={14} /><span>{provider.phone}</span>
                    </div>
                  )}
                  {provider.priceRange && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--primary)', fontWeight: 700 }}>
                      <DollarSign size={14} /><span>₪{provider.priceRange}/שעה</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {provider.categories?.map(cat => (
                    <span key={cat} className="badge badge-primary">{cat}</span>
                  ))}
                </div>
              </div>

              <div className="profile-actions">
                <div className="profile-rating-big">
                  <Star size={20} fill="#F59E0B" color="#F59E0B" />
                  <span className="rating-number">{provider.rating?.toFixed(1) || '0.0'}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>({provider.reviewCount || 0})</span>
                </div>
                <button className="btn btn-primary" onClick={handleStartChat} disabled={startingChat || currentUser?.uid === id}>
                  {startingChat ? <span className="spinner" /> : <><MessageCircle size={16} /> שלח הודעה</>}
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          {provider.description && (
            <div className="card">
              <h2 style={{ marginBottom: 12, fontSize: 18, fontWeight: 700 }}>אודות</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{provider.description}</p>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>
              ביקורות <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 15 }}>({reviews.length})</span>
            </h2>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>אין ביקורות עדיין. היה הראשון!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-header">
                      <div className="review-avatar">{r.customerName?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.customerName}</div>
                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={12} fill={i <= r.rating ? '#F59E0B' : 'var(--border)'}
                              color={i <= r.rating ? '#F59E0B' : 'var(--border)'} />
                          ))}
                        </div>
                      </div>
                      <span style={{ marginRight: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>
                        {r.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || ''}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review */}
            {currentUser && currentUser.uid !== id && (
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 24 }}>
                <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>כתוב ביקורת</h3>
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>דירוג</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <button key={i} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: i }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}>
                          <Star fill={i <= reviewForm.rating ? '#F59E0B' : 'none'}
                            color={i <= reviewForm.rating ? '#F59E0B' : 'var(--border)'} size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="input-group">
                    <label>תגובה</label>
                    <textarea className="input-field" rows={3} placeholder="שתף את החוויה שלך..."
                      value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                      required style={{ resize: 'none' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview} style={{ alignSelf: 'flex-start' }}>
                    {submittingReview ? <span className="spinner" /> : 'פרסם ביקורת'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
