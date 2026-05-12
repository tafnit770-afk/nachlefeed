// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Store, MessageCircle, Star, TrendingUp, Eye } from 'lucide-react';
import { subDays, format, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import './AdminDashboard.css';

const KPICard = ({ icon: Icon, label, value, sub, color = 'primary' }) => (
  <div className="kpi-card card">
    <div className="kpi-icon" style={{ background: `var(--${color}-bg || var(--primary-bg))` }}>
      <Icon size={22} color={`var(--${color})`} />
    </div>
    <div className="kpi-info">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalCustomers: 0, totalProviders: 0, newUsersThisMonth: 0,
    totalConversations: 0, totalMessages: 0, totalReviews: 0, avgRating: 0,
    totalVisits: 0, visitsThisMonth: 0, conversionRate: 0,
  });
  const [dailyVisits, setDailyVisits] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const monthStart = Timestamp.fromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

      // Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(d => d.data());
      const customers = users.filter(u => u.role === 'customer');
      const providers = users.filter(u => u.role === 'provider');
      const newThisMonth = users.filter(u => u.createdAt?.seconds >= monthStart.seconds);

      // Conversations & Messages
      const convSnap = await getDocs(collection(db, 'conversations'));
      const convThisMonth = convSnap.docs.filter(d => d.data().createdAt?.seconds >= monthStart.seconds);
      const msgSnap = await getDocs(collection(db, 'messages'));

      // Reviews
      const revSnap = await getDocs(collection(db, 'reviews'));
      const reviews = revSnap.docs.map(d => d.data());
      const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0;

      // Analytics Events
      const eventsSnap = await getDocs(collection(db, 'analytics_events'));
      const events = eventsSnap.docs.map(d => d.data());
      const visits = events.filter(e => e.type === 'visit');
      const signups = events.filter(e => e.type === 'signup');
      const visitsThisMonth = visits.filter(e => e.timestamp?.seconds >= monthStart.seconds);
      const conversion = visits.length ? ((signups.length / visits.length) * 100).toFixed(1) : 0;

      // Daily visits chart (last 7 days)
      const dailyMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, 'dd/MM');
        dailyMap[key] = 0;
      }
      visits.forEach(v => {
        if (!v.timestamp) return;
        const d = v.timestamp.toDate?.() || new Date(v.timestamp.seconds * 1000);
        if (d >= subDays(new Date(), 6)) {
          const key = format(d, 'dd/MM');
          if (dailyMap[key] !== undefined) dailyMap[key]++;
        }
      });
      setDailyVisits(Object.entries(dailyMap).map(([date, visits]) => ({ date, visits })));

      // Category distribution
      const providerDocs = await getDocs(collection(db, 'providers'));
      const catCount = {};
      providerDocs.docs.forEach(d => {
        d.data().categories?.forEach(cat => { catCount[cat] = (catCount[cat] || 0) + 1; });
      });
      setCategoryData(Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([name, count]) => ({ name, count })));

      setStats({
        totalUsers: users.length,
        totalCustomers: customers.length,
        totalProviders: providers.length,
        newUsersThisMonth: newThisMonth.length,
        totalConversations: convSnap.size,
        convsThisMonth: convThisMonth.length,
        totalMessages: msgSnap.size,
        avgMessages: convSnap.size ? (msgSnap.size / convSnap.size).toFixed(1) : 0,
        totalReviews: reviews.length,
        avgRating: avgRating.toFixed(1),
        totalVisits: visits.length,
        visitsThisMonth: visitsThisMonth.length,
        conversionRate: conversion,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <span className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="admin-dashboard fade-in">
      <div className="admin-page-header">
        <h1>סקירה כללית</h1>
        <span className="badge badge-success">Live</span>
      </div>

      {/* KPIs - Users */}
      <section className="admin-section">
        <h2 className="admin-section-title"><Users size={18} /> משתמשים</h2>
        <div className="kpi-grid">
          <KPICard icon={Users} label="סה״כ משתמשים" value={stats.totalUsers} />
          <KPICard icon={Users} label="לקוחות" value={stats.totalCustomers} color="success" />
          <KPICard icon={Store} label="ספקי שירות" value={stats.totalProviders} color="accent" />
          <KPICard icon={TrendingUp} label="חדשים החודש" value={stats.newUsersThisMonth} />
        </div>
      </section>

      {/* Charts */}
      <section className="admin-section admin-charts">
        <div className="admin-chart-card card">
          <h3>ביקורים יומיים (7 ימים אחרונים)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyVisits}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card card">
          <h3>ספקים לפי קטגוריה</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Chat & Reviews */}
      <section className="admin-section">
        <h2 className="admin-section-title"><MessageCircle size={18} /> צ׳אט וביקורות</h2>
        <div className="kpi-grid">
          <KPICard icon={MessageCircle} label="סה״כ שיחות" value={stats.totalConversations} />
          <KPICard icon={MessageCircle} label="שיחות החודש" value={stats.convsThisMonth} />
          <KPICard icon={MessageCircle} label="סה״כ הודעות" value={stats.totalMessages} />
          <KPICard icon={Star} label="ממוצע הודעות/שיחה" value={stats.avgMessages} />
          <KPICard icon={Star} label="סה״כ ביקורות" value={stats.totalReviews} />
          <KPICard icon={Star} label="דירוג ממוצע" value={`${stats.avgRating} ⭐`} />
        </div>
      </section>

      {/* Site Activity */}
      <section className="admin-section">
        <h2 className="admin-section-title"><Eye size={18} /> פעילות האתר</h2>
        <div className="kpi-grid">
          <KPICard icon={Eye} label="סה״כ ביקורים" value={stats.totalVisits} />
          <KPICard icon={Eye} label="ביקורים החודש" value={stats.visitsThisMonth} />
          <KPICard icon={TrendingUp} label="שיעור המרה" value={`${stats.conversionRate}%`} sub="מבקרים → נרשמים" />
        </div>
      </section>
    </div>
  );
}
