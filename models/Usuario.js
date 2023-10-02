import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const usuarioSchema = mongoose.Schema(
  {
    nombre:     {type: String, required: true, trim: true },
    password:   {type: String, required: true, trim: true },
    email:      {type: String, required: true, trim: true, unique: true },
    token:      {type: String },
    confirmado: {type: Boolean, default: false }
  },
  {
    timestamps: true  // esto va a crear dos columnas mas creado y actualizado automaticamente
  }
)

//este codigo es un middleware de mongoose (pre y post tambien) que se va a ejecutar justo antes de grabar el registro
usuarioSchema.pre('save', async function(next) {    // 10 rondas para generar info mas aleatoria  (usa function porque el "this" ahi si funciona!!)
     if(!this.isModified('password')) {     // esto es por si estoy modificando datos, no dando de alta. Para que no hasee de nuevo un password haseado
      next()                                // con esto le digo que no ejecute lo siguiente de ESTE middleware, sino que vaya al siguiente. Un "return" pararia todo...
     }

     const salt = await bcrypt.genSalt(10)
     this.password = await bcrypt.hash(this.password, salt)
})

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema)
export default Usuario