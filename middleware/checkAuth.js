import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

const checkAuth = async ( req, res, next ) => {        // este es un middleware que se interpone y con next puedo continuar con lo siguiente
 let token
 if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))  {
    
    try {       
      token = req.headers.authorization.split(" ")[1]  // para eliminar el titulo "Bearer" de la cadena de token
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v")  // el "id" sale del jwt donde lo pusimos, y elimino el password de la respuesta

      return next()

    } catch (error) {
      return res.status(404).json({msg: "Hubo un error"})
    }
 }

 if (!token) {
  const error = new Error("Token no valido")
  return res.status(401).json({msg: error.message})
 }

 next()
}

export default checkAuth