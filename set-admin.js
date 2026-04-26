import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument.');
  process.exit(1);
}

(async () => {
  try {
    console.log(`Fetching user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`Setting custom claim { isAdmin: true } for user ${user.uid}...`);
    await admin.auth().setCustomUserClaims(user.uid, { isAdmin: true });
    
    console.log(`\n✅ Successfully set ${email} as an admin.`)
    console.log('Please log out and log back in for the changes to take effect.');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`Error: User with email "${email}" not found.`);
    } else {
      console.error('\n❌ An error occurred:', error.message);
    }
    process.exit(1);
  }
})();
