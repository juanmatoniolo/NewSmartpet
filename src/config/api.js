const envUrl = process.env.REACT_APP_API_URL;

const fallbackUrl =
	process.env.NODE_ENV === "production"
		? "https://tagsmartpet.com/API-SMARTPET"
		: "http://localhost/API-SMARTPET";

const API_BASE = (envUrl || fallbackUrl).replace(/\/$/, "");

export default API_BASE;
