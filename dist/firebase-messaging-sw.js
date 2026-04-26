
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDy-ZYGZXAoRx5JVqVvoltFVBFKROhaKSk",
    authDomain: "squaremind-ad621.firebaseapp.com",
    projectId: "squaremind-ad621",
    storageBucket: "squaremind-ad621.appspot.com",
    messagingSenderId: "556311265421",
    appId: "1:556311265421:web:04f95d5eaa56f620c622c4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
