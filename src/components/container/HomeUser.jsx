import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./body.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

// Componente de registro
function HomeUser() {
	const [nombreUsuario, setNombreUsuario] = useState("");
	const [nombre, setNombre] = useState("");
	const [apellido, setApellido] = useState("");
	const [correo, setCorreo] = useState("");
	const [contrasenia, setContrasenia] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const handleRegister = (e) => {
		e.preventDefault();
		// Lógica de registro, enviar datos a Firebase y redirigir a la pantalla de validación del código
		navigate("/validate-code");
	};

	return (
		<div className="register-container">
			<h2 className="title">Registro de Usuario</h2>
			<form onSubmit={handleRegister}>
				<input
					type="text"
					placeholder="Nombre de usuario"
					value={nombreUsuario}
					onChange={(e) => setNombreUsuario(e.target.value)}
					required
				/>
				<input
					type="text"
					placeholder="Nombre"
					value={nombre}
					onChange={(e) => setNombre(e.target.value)}
					required
				/>
				<input
					type="text"
					placeholder="Apellido"
					value={apellido}
					onChange={(e) => setApellido(e.target.value)}
					required
				/>
				<input
					type="email"
					placeholder="Correo electrónico"
					value={correo}
					onChange={(e) => setCorreo(e.target.value)}
					required
				/>
				<div className="password-input-container">
					<input
						type={showPassword ? "text" : "password"}
						placeholder="Contraseña"
						value={contrasenia}
						onChange={(e) => setContrasenia(e.target.value)}
						required
					/>
					<div
						className="password-toggle-btn"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <IoMdEyeOff /> : <IoMdEye />}
					</div>
				</div>
				<button type="submit" className="register-btn">
					Registrarse
				</button>
			</form>
		</div>
	);
}

// Componente para validar el código
function ValidateCode() {
	const [codigo, setCodigo] = useState("");
	const navigate = useNavigate();

	const handleValidate = (e) => {
		e.preventDefault();
		// Lógica para validar el código, comprobar en Firebase y redirigir a la pantalla de configuración de mascotas
		if (codigo === "VALID_CODE") {
			navigate("/pet-info");
		} else {
			alert("Código inválido. Inténtalo nuevamente.");
		}
	};

	return (
		<div className="validate-code-container">
			<h2 className="title">Validar Código de SmartPet</h2>
			<form onSubmit={handleValidate}>
				<input
					type="text"
					placeholder="Ingresa el código de SmartPet"
					value={codigo}
					onChange={(e) => setCodigo(e.target.value)}
					required
				/>
				<button type="submit" className="validate-btn">
					Validar
				</button>
			</form>
		</div>
	);
}

// Componente para ingresar información de la mascota
function PetInfo() {
	const [mascota, setMascota] = useState({
		imagen: "",
		nombre: "",
		edad: "",
		sexo: "",
		descripcion: "",
		contacto1: { nombre: "", telefono: "", whatsapp: "", instagram: "" },
		contacto2: { nombre: "", telefono: "", whatsapp: "", instagram: "" },
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setMascota((prev) => ({ ...prev, [name]: value }));
	};

	const handleContactChange = (e, index) => {
		const { name, value } = e.target;
		setMascota((prev) => {
			const contactos = [...prev.contactos];
			contactos[index] = { ...contactos[index], [name]: value };
			return { ...prev, contactos };
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Lógica para guardar datos en Firebase
		alert("Datos de la mascota guardados exitosamente.");
	};

	return (
		<div className="pet-info-container">
			<h2 className="title">Información de la Mascota</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="file"
					name="imagen"
					onChange={(e) => handleInputChange(e)}
					required
				/>
				<input
					type="text"
					placeholder="Nombre"
					name="nombre"
					value={mascota.nombre}
					onChange={handleInputChange}
					required
				/>
				<input
					type="number"
					placeholder="Edad"
					name="edad"
					value={mascota.edad}
					onChange={handleInputChange}
					required
				/>
				<select
					name="sexo"
					value={mascota.sexo}
					onChange={handleInputChange}
					required
				>
					<option value="">Sexo</option>
					<option value="macho">Macho</option>
					<option value="hembra">Hembra</option>
				</select>
				<textarea
					placeholder="Descripción"
					name="descripcion"
					value={mascota.descripcion}
					onChange={handleInputChange}
					required
				/>
				<div className="contact-info">
					<h3>Contacto 1</h3>
					<input
						type="text"
						placeholder="Nombre"
						name="nombre"
						value={mascota.contacto1.nombre}
						onChange={(e) => handleContactChange(e, 0)}
						required
					/>
					<input
						type="tel"
						placeholder="Teléfono"
						name="telefono"
						value={mascota.contacto1.telefono}
						onChange={(e) => handleContactChange(e, 0)}
						required
					/>
					<input
						type="text"
						placeholder="WhatsApp"
						name="whatsapp"
						value={mascota.contacto1.whatsapp}
						onChange={(e) => handleContactChange(e, 0)}
						required
					/>
					<input
						type="text"
						placeholder="Instagram"
						name="instagram"
						value={mascota.contacto1.instagram}
						onChange={(e) => handleContactChange(e, 0)}
						required
					/>
				</div>
				<div className="contact-info">
					<h3>Contacto 2</h3>
					<input
						type="text"
						placeholder="Nombre"
						name="nombre"
						value={mascota.contacto2.nombre}
						onChange={(e) => handleContactChange(e, 1)}
						required
					/>
					<input
						type="tel"
						placeholder="Teléfono"
						name="telefono"
						value={mascota.contacto2.telefono}
						onChange={(e) => handleContactChange(e, 1)}
						required
					/>
					<input
						type="text"
						placeholder="WhatsApp"
						name="whatsapp"
						value={mascota.contacto2.whatsapp}
						onChange={(e) => handleContactChange(e, 1)}
						required
					/>
					<input
						type="text"
						placeholder="Instagram"
						name="instagram"
						value={mascota.contacto2.instagram}
						onChange={(e) => handleContactChange(e, 1)}
						required
					/>
				</div>
				<button type="submit" className="save-btn">
					Guardar
				</button>
			</form>
			<button className="logout-btn">Logout</button>
		</div>
	);
}

export { HomeUser, ValidateCode, PetInfo };
