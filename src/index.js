import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals.js";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

serviceWorkerRegistration.register(); // ← esta línea faltaba

reportWebVitals();
