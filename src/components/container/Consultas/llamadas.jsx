import axios from "axios";



const Getidusuario = async ()  => {
    try{
    const datos = await axios.get("https://smartpet-1d59e-default-rtdb.firebaseio.com/");
    console.log(datos);
    }

    catch (e){
        console.log(e);
    }
}

export default Getidusuario; 