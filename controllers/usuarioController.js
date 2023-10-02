import Usuario from "../models/Usuario.js"
import generarId from '../helpers/generarId.js'
import generarJWT from "../helpers/generarJWT.js"
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js'


const registrar = async (req, res) => {
  // Evitar registros duplicados
  const { email } = req.body
  const existeUsuario = await Usuario.findOne({email: email})

  if(existeUsuario) {
    const error = new Error('Usuario ya registrado')
    return res.status(400).json({msg: error.message})
  }

  try {
    const usuario = new Usuario(req.body)  // esto instancia el modelo de usuario creado, lo completa con req.body solo lo que coincida y lo almacena en la variable usuario
    usuario.token = generarId()
    await usuario.save()
    // Enviar el email de confirmacion
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    })

    res.json({msg: "Usuario creado correctamente, Revisa tu Email para confirmar tu cuenta"})
  } catch (error) {
    console.log(error)
  } 
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const autenticar = async(req, res) => {
  const { email, password } = req.body

  // Comprobar si el Usuario existe
  const usuario = await Usuario.findOne({email})
  if(!usuario) {
    const error = new Error('El Usuario no existe')
    return res.status(404).json({msg: error.message})
  }

  // Comprobar si el Usuario esta confirmado
  if(!usuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada')
    return res.status(403).json({msg: error.message})
  }
  
  // Comprobar el password hasheado.  Para no retornar en el caso que este ok el pass el usuario completo, creo un objeto solo con lo que me interesa que llegue
  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id)                 // agrego que tambien devuelva este jwt
    })
  } else {
    const error = new Error('El password es Incorrecto')
    return res.status(403).json({msg: error.message})
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const confirmar = async(req, res) => {
   //console.log(req.params.token)              // esto devuelve el nombre que defini en la ruta token:blabla
   // entonces la secuencia es: leo de la url el token que me pasaron (que previamente yo se lo envie por email sacandolo de la base de datos)
   // busco un usuario con ese token
   // si no existe -> token no valido
   // si existe -> elimino el token de un solo uso, almaceno en la base que el usuario ya esta confirmado y limpio el token
   // y le respondo que se confirmo correctamente
   const { token } = req.params
   const usuarioConfirmar = await Usuario.findOne({token})
   if(!usuarioConfirmar) {
    const error = new Error('Token no valido')
    return res.status(403).json({msg: error.message})
   }
   
   try {
    usuarioConfirmar.confirmado = true
    usuarioConfirmar.token = ""
    await usuarioConfirmar.save()
    res.json({msg: "Usuario Confirmado Correctamente"})
   } catch (error) {
    console.log(error)
   }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// cuando no recuerde la clave, se le pide un email que va a llegar a esta funcion, se valida si ese email existe
// si existe, se genera un nuevo token que se envia por email
// y cuando clickee en el link que le llega, se le pedira un nuevo password (pero eso es otra funcion)
const olvidePassword = async (req, res) => {
  const { email } = req.body
  
  // Comprobar si el Usuario existe
  const usuario = await Usuario.findOne({email})
  if(!usuario) {
    const error = new Error('El Usuario no existe')
    return res.status(404).json({msg: error.message})
  }

  // le genero un nuevo token, y se lo envio por email
  try {
    usuario.token = generarId()
    await usuario.save()
    // aca tengo que enviar el email
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    })

    res.json({msg: "Hemos enviado un email con las instrucciones"})
  } catch (error) {
    console.log(error)
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const comprobarToken = async (req, res) => {  // si extraigo valores de la url es con params si vienen de un formulario es con body
  const { token } = req.params
  const tokenValido = await Usuario.findOne( {token} )
  if (tokenValido) {    
    res.json({msg:"Token valido y el usuario existe"})
  } else {
    const error = new Error('Token no valido')
    return res.status(404).json({msg: error.message})
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const nuevoPassword = async (req, res) => {    // esta funcion debe leer token de la url, llenar un formulario con el nuevo password
  const { token } = req.params
  const { password } = req.body
  const usuario = await Usuario.findOne( {token} )
  if (usuario) {    
    usuario.password = password   // el .pre lo va a hashear
    usuario.token = ''  // para que nadie lo pueda volver a usar y cambie el password por maldad
    try {
      await usuario.save()
      res.json({msg: "Password modificado correctamente"})      
    } catch (error) {
      console.log(error)
    }
  } else {
    const error = new Error('Token no valido')
    return res.status(404).json({msg: error.message})
  }
}


const perfil = async (req, res) => {
  const { usuario } = req

  res.json(usuario)

}




export { registrar, autenticar, confirmar, olvidePassword, comprobarToken,nuevoPassword, perfil}