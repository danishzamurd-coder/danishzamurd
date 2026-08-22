const firebaseConfig = {
  apiKey: "AIzaSyAHKKtiShVSQ6HNwr-aiu3IDb7YRAytN7U",
  authDomain: "danish-portfolio-3c260.firebaseapp.com",
  projectId: "danish-portfolio-3c260",
  storageBucket: "danish-portfolio-3c260.firebasestorage.app",
  messagingSenderId: "125526753743",
  appId: "1:125526753743:web:067a9d399a28f3eeda52ba"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();