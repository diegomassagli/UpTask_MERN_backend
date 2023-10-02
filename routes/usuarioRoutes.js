import express from "express";
const router = express.Router()
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from '../controllers/usuarioController.js'
import checkAuth from "../middleware/checkAuth.js";

// Autenticacion, registro y confirmacion de Usuarios

router.post('/', registrar)  // crea un nuevo usuario
router.post('/login', autenticar)  // verifica si el usuario existe, si la cuenta esta confirmada y si el password que ingreso es correcto
router.get('/confirmar/:token', confirmar)  // recibe un token de un solo uso para verificar la cuenta
router.post('/olvide-password', olvidePassword) // genera y envia un nuevo token por email
router.get('/olvide-password/:token', comprobarToken)  // recibe el token enviado por haberse olvidado el password y lo valida
router.post('/olvide-password/:token', nuevoPassword)  // permite al usuario definir su nuevo password
// tambien se podrian escribir las ultimas dos lineas en una, como: 
// router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)
router.get('/perfil', checkAuth, perfil)  // esta ruta andes de devilver el perfil va a ejecutar "checkAuth" para verificar y PROTEGE !


export default router