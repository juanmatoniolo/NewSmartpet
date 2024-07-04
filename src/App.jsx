import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/header/Header";
import Barnav from "./components/nav/Nav";


function App() {
	return (
		<div className="App">
			<Header />
			<Barnav/>
		</div>
	);
}

export default App;
