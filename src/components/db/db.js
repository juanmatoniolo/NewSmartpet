import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyCby9zeUehjqBo5ArMo6q1zL-e43q1CkFY",
	authDomain: "smartpet-1d59e.firebaseapp.com",
	databaseURL: "https://smartpet-1d59e-default-rtdb.firebaseio.com",
	projectId: "smartpet-1d59e",
	storageBucket: "smartpet-1d59e.appspot.com",
	messagingSenderId: "485489296187",
	appId: "1:485489296187:web:04eb975d1b6cfaa6756d1e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };
