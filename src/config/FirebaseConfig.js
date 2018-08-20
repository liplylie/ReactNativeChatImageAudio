import firebase from "firebase";
import Rebase from "re-base";
import * as sensitive from "../../sensitive.json";
// Initialize Firebase
const config = {
  // Initialize Firebase
  apiKey: sensitive.APIKEY,
  authDomain: sensitive.authDomain,
  databaseURL: sensitive.databaseURL,
  projectId: sensitive.projectId,
  storageBucket: sensitive.storageBucket,
  messagingSenderId: sensitive.messagingSenderId
};

const app = firebase.initializeApp(config);
const base = Rebase.createClass(app.database());
const firebaseDB = app.database();
export { app, base, firebaseDB };
