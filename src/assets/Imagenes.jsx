import letrasblancas from "./letrasBlancas.svg";
import logo from "./logobien.svg";
import Smartpet from "./SMARTPET.png";
import Minerva from "./mine.jfif";
import a from "./a.jpg";
import imgs1 from "./img1.jpg";
import imgs2 from "./img2.jpg";
import imgs3 from "./img3.jpg";
import imgs4 from "./img4.jpg";
import imgs5 from "./img5.jpg";
import imga1 from "./collares/a (1).jpg";
import imga2 from "./collares/a (2).jpg";
import imga3 from "./collares/a (3).jpg";
import imga4 from "./collares/a (4).jpg";
import imga5 from "./collares/a (5).jpg";
import imga6 from "./collares/a (6).jpg";
import imga7 from "./collares/a (7).jpg";
import imga8 from "./collares/a (8).jpg";
import imga9 from "./collares/a (9).jpg";
import imga10 from "./collares/a (10).jpg";
import imga11 from "./collares/a (11).jpg";
import video from "./collares/b.mp4"; // Importa el video





const imagenes = {
	img1: require("./letrasBlancas.svg"),
	img2: require("./logobien.svg"),
	img3: require("./SMARTPET.png"),
	img4: require("./mine.jfif"),
	img5: require("./a.jpg"),
	imgs1: require("./img1.jpg"),
	imgs2: require("./img2.jpg"),
	imgs3: require("./img3.jpg"),
	imgs4: require("./img4.jpg"),
	imgs5: require("./img5.jpg"),
	imga1: require("./collares/a (1).jpg"),
	imga2: require("./collares/a (2).jpg"),
	imga3: require("./collares/a (3).jpg"),
	imga4: require("./collares/a (4).jpg"),
	imga5: require("./collares/a (5).jpg"),
	imga6: require("./collares/a (6).jpg"),
	imga7: require("./collares/a (7).jpg"),
	imga8: require("./collares/a (8).jpg"),
	imga9: require("./collares/a (9).jpg"),
	imga10: require("./collares/a (10).jpg"),
	imga11: require("./collares/a (11).jpg"),
	video: require("./collares/b.mp4"), // video también puede ser requerido así
};



export default {
	img1: letrasblancas,
	img2: logo,
	img3: Smartpet,
	img4: Minerva,
	img5: a,
	imgs1: imgs1,
	imgs2: imgs2,
	imgs3: imgs3,
	imgs4: imgs4,
	imgs5: imgs5,
	imga1: imga1,
	imga2: imga2,
	imga3: imga3,
	imga4: imga4,
	imga5: imga5,
	imga6: imga6,
	imga7: imga7,
	imga8: imga8,
	imga9: imga9,
	imga10: imga10,
	imga11: imga11,

	imagenes: imagenes,
	video: video, // Agrega el video a la exportación
};
