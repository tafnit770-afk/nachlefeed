// scripts/createAdmin.js
// Run once to create your first admin user:
// node scripts/createAdmin.js

// In Firebase Console → Firestore → users collection
// Find your user document and manually change role: "customer" to role: "admin"

// OR use this script with firebase-admin:
// npm install firebase-admin
// Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON

/*
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function makeAdmin(uid) {
  await db.collection('users').doc(uid).update({ role: 'admin' });
  console.log(`User ${uid} is now admin`);
}

// Replace with your user's UID from Firebase Auth console
makeAdmin('YOUR_USER_UID_HERE');
*/

console.log(`
To create an admin user:
1. Register normally at /register
2. Go to Firebase Console → Firestore → users collection  
3. Find your user document
4. Change role field from "customer" to "admin"
5. You can now access /admin
`);
