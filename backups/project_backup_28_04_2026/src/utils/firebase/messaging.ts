import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db, messaging } from "../../firebase"; // Correctly imports the initialized services

// Function to request notification permission and save the token
export const requestNotificationPermission = async () => {
    // No need to call getMessaging() again, as it's imported from firebaseConfig

    try {
        // 1. Request permission from the user
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notification permission granted.");

            // 2. Get the FCM token using the imported messaging instance
            const currentToken = await getToken(messaging, {
                vapidKey: "YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE", // Replace with your actual VAPID key
            });

            if (currentToken) {
                console.log("FCM Token received: ", currentToken);

                // 3. Save the token to the current user's Firestore document
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, "users", user.uid);
                    await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
                    console.log("FCM token saved for user: ", user.uid);
                } else {
                    console.log("No user is signed in. Cannot save FCM token.");
                }

            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        } else {
            console.log("Unable to get permission to show notifications.");
        }
    } catch (error) {
        console.error("An error occurred while requesting notification permission or getting the token. ", error);
    }
};

// Function to listen for incoming messages when the app is in the foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    // Use the imported messaging instance here as well
    onMessage(messaging, (payload) => {
      console.log("Received foreground message: ", payload);
      resolve(payload);
    });
  });
