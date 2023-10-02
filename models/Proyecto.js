import mongoose, { mongo } from "mongoose";

const proyectosSchema = mongoose.Schema({
  nombre: {type: String, trim: true, require: true },
  descripcion: {type: String, trim: true, require: true },
  fechaEntrega: { type: Date, default: Date.now() },
  cliente: {type: String, trim: true, require: true },
  creador: {
    type: mongoose.Schema.Types.ObjectId,   //estilo noSql. Esto permite guardar la relacion En la bse estan almacenados los Ids. como OjbectId
    ref: 'Usuario'
  },
  tareas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tarea'
    }
  ],
  colaboradores: [                                    // los corchetes indican que va a haber mas de uno, osea que va a ser un arreglo de usuarios...
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario' 
    }
  ],
}
, 
{timestamps: true},
)


const Proyecto = mongoose.model('Proyecto', proyectosSchema)

export default Proyecto