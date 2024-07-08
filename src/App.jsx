import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./pages/home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Collares from "./pages/Collares";
import Cod from "./pages/Cod";
import Login from "./components/Login/Login";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Homepage />} />
				
				<Route path="/NewSmartpet" element={<Homepage />} />
				<Route path="/About" element={<About />} />
				<Route path="/Collares" element={<Collares/>} />
				<Route path="/Cod" element={<Cod />} />
				<Route path="/Login" element={<Login />} />

			

			</Routes>
		</BrowserRouter>
	);
}

export default App;
