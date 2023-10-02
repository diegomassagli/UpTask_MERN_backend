import jwt from "jsonwebtoken"

const generarJWT = (id) => {
  return jwt.sign( { id }, process.env.JWT_SECRET, {
    expiresIn: '30d',                                                     // nombre es lo que va a codificar, la palabra secreta es la semilla y expira en 30 dias es porqe no es vital
  } )
}

export default generarJWT