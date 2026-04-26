import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase"; // Assuming your firebase initialization is in `src/firebase.ts` or a similar file
import { doc, getFirestore, setDoc, getDoc } from "firebase/firestore";

// Replace this with your actual VAPID key from the Firebase console
const VAPID_KEY = "BP2SVqDVQoWHyO7wGz1hXrqZQsdU78_9tjitRDZ3GQqiRw_SD8-X1wEcA6vOOa1xHhq5jyf1Mjd9rikU1sUMU_A";

export const initializeFirebaseMessaging = async (userId: string) => {
  try {
    const messaging = getMessaging(app);
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", userId);

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().fcmToken === currentToken) {
          console.log("FCM token is already up-to-date in Firestore.");
        } else {
          await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
          console.log("FCM token saved to Firestore.");
        }
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Unable to get permission to notify.");
    }

    onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);
      // You could use a toast notification here to show the message to the user
      // For now, we'll just use a simple alert
      if (payload.notification) {
          alert(payload.notification.title);
      }
    });

  } catch (error) {
    console.error("An error occurred while initializing Firebase Messaging:", error);
  }
};
