# מידרג - פלטפורמת שירותים

פלטפורמת מרקטפלייס לשירותים מקצועיים, בנויה עם React + Firebase.

---

## 🚀 הרצה מקומית

### 1. התקנת תלויות
```bash
npm install
```

### 2. הגדרת Firebase

**א. צור פרויקט Firebase:**
1. עבור ל-[Firebase Console](https://console.firebase.google.com)
2. לחץ "Add project" וצור פרויקט חדש
3. בפרויקט, לחץ על "Web" (</>)  להוסיף אפליקציית web

**ב. הפעל שירותים:**
- **Authentication** → Sign-in method → Email/Password → Enable
- **Firestore Database** → Create database → Start in test mode
- **Storage** → Get started

**ג. קבל את הגדרות Firebase:**
- Project Settings → General → Your apps → Firebase SDK snippet → Config

**ד. הגדר משתני סביבה:**
```bash
cp .env.example .env
```
מלא את הערכים מ-Firebase Console:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. הגדר Firestore Rules
- Firebase Console → Firestore → Rules
- העתק את תוכן `firestore.rules` והדבק שם

### 4. הגדר Storage Rules
- Firebase Console → Storage → Rules
- העתק את תוכן `storage.rules`

### 5. הרץ את הפרויקט
```bash
npm run dev
```
פתח: http://localhost:3000

---

## 👤 יצירת משתמש מנהל

1. הירשם דרך `/register`
2. Firebase Console → Firestore → `users` collection
3. פתח את מסמך המשתמש שלך
4. שנה את שדה `role` מ-`"customer"` ל-`"admin"`
5. כנס ל-`/admin`

---

## 🗄️ מבנה Firestore

```
users/
  {uid}/
    uid, email, firstName, lastName, username
    phone, address, role, createdAt, favorites[]

providers/
  {uid}/
    uid, email, firstName, lastName
    description, categories[], location, priceRange
    profileImageUrl, rating, reviewCount, createdAt

reviews/
  {id}/
    providerId, customerId, customerName
    rating, comment, createdAt

conversations/
  {id}/
    participants[], participantNames{}
    lastMessage, lastMessageAt, createdAt

messages/
  {id}/
    conversationId, senderId, senderName
    text, createdAt

analytics_events/
  {id}/
    type (visit|signup|message|conversation_created)
    userId, timestamp
```

---

## 🌐 פריסה ל-Netlify

### אפשרות 1: Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### אפשרות 2: Netlify Dashboard
1. לחץ "New site from Git"
2. חבר את ה-repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables: הוסף את כל ה-VITE_ variables

---

## 📁 מבנה קבצים

```
src/
  components/
    layout/       # Sidebar, Header, MainLayout, AdminLayout
    shared/       # ProviderCard
    auth/         # (ריק - Auth בפגים)
  contexts/
    AuthContext.jsx
  pages/
    HomePage.jsx
    LoginPage.jsx
    RegisterCustomerPage.jsx
    RegisterProviderPage.jsx
    ForgotPasswordPage.jsx
    ProvidersPage.jsx
    ProviderProfilePage.jsx
    MessagesPage.jsx
    FavoritesPage.jsx
    ProfilePage.jsx
    ProviderDashboardPage.jsx
    admin/
      AdminDashboard.jsx  # Charts + KPIs
      AdminUsers.jsx
      AdminProviders.jsx
      AdminConversations.jsx
  firebase/
    config.js
  utils/
    analytics.js
  styles/
    globals.css
```

---

## ✨ פיצ'רים

- ✅ אימות Firebase (כניסה, הרשמה, שחזור סיסמה)
- ✅ 3 תפקידים: לקוח, ספק, מנהל
- ✅ פרופיל ספק מלא עם תמונה
- ✅ חיפוש וסינון ספקים
- ✅ מועדפים
- ✅ צ'אט בזמן אמת (WhatsApp style)
- ✅ מערכת ביקורות ודירוגים
- ✅ לוח בקרה לספק
- ✅ פאנל ניהול מתקדם עם:
  - גרפים ו-KPIs
  - ניהול משתמשים + מחיקה
  - ניהול ספקים
  - ניהול שיחות + צפייה בהודעות
  - מעקב analytics
- ✅ RTL מלא
- ✅ עברית
- ✅ Responsive
- ✅ Netlify ready
