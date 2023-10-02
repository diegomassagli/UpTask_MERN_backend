import mongoose from "mongoose";
import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

/////////////////////////////////////////////////////////////////////////////////////
const agregarTarea = async (req, res) => {
  delete req.body.id                                           // hago esto porque puede venir un id:null y genera problemas (tambien lo puedo hacer en frontend en el submit)
  const { proyecto } = req.body

  // verifico si el id de proyecto es valido
  const valid = mongoose.Types.ObjectId.isValid(proyecto)
  if (!valid) {
    const error = new Error('Proyecto no Existe')
    return res.status(404).json({msg: error.message})
  }

  // verifico que el proyecto exista
  const existeProyecto = await Proyecto.findById(proyecto)
  if (!existeProyecto) {
    const error = new Error('Proyecto no Encontrado')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
  // verifico que el creador del proyecto sea igual al que esta creando la tarea
  if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes los permisos adecuados para agregar Tareas')              
    return res.status(403).json({msg: error.message})
  }

  // verificado todo eso, puedo crear la tarea
  try {
    const tareaAlmacenada = await Tarea.create(req.body)      // puedo usar new Tarea o el .create
    
    // Almacenar el ID de la tarea tambien en el Proyecto relacionado  // el push no se usa en react pero esto es node !! // esta relacion me permite hacer un populate al traer proyectos
    existeProyecto.tareas.push(tareaAlmacenada._id)
    await existeProyecto.save()

    res.json(tareaAlmacenada)
  } catch (error) {
    console.log(error)
  }
}



/////////////////////////////////////////////////////////////////////////////////////
const obtenerTarea = async (req, res) => {  
  const { id } = req.params

  // verifico si el id de la tarea es valido
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Tarea no Existe')
    return res.status(404).json({msg: error.message})
  }
  
  // verifico que la tarea exista
  const tarea = await Tarea.findById(id).populate("proyecto")
  if (!tarea) {
    const error = new Error('Tarea no Encontrada')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
  // como la tarea no tiene quien es el creador, sino que lo tiene indirectamente a traves del proyecto relacionado, para eso agrego ".populate("proyecto") para que traiga el arreglo de proyectos relacionados
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Accion no Valida')               
    return res.status(403).json({msg: error.message})
  }

  res.json(tarea)
}




/////////////////////////////////////////////////////////////////////////////////////
const actualizarTarea = async (req, res) => {
  const { id } = req.params

  // verifico si el id de la tarea es valido
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Tarea no Existe')
    return res.status(404).json({msg: error.message})
  }
  
  // verifico que la tarea exista
  const tarea = await Tarea.findById(id).populate("proyecto")
  if (!tarea) {
    const error = new Error('Tarea no Encontrada')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
  // como la tarea no tiene quien es el creador, sino que lo tiene indirectamente a traves del proyecto relacionado, para eso agrego ".populate("proyecto") para que traiga el arreglo de proyectos relacionados
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Accion no Valida')               
    return res.status(403).json({msg: error.message})
  }

  tarea.nombre = req.body.nombre || tarea.nombre
  tarea.descripcion = req.body.descripcion || tarea.descripcion
  tarea.prioridad = req.body.prioridad || tarea.prioridad
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

  try {
    const tareaAlmacenada = await tarea.save()
    res.json(tareaAlmacenada)                     // retornamos la tarea almacenada asi puedo sincronizarla con el state
  } catch (error) {
    console.log(error)
  }
}

/////////////////////////////////////////////////////////////////////////////////////
const eliminarTarea = async (req, res) => {
  const { id } = req.params

  // verifico si el id de la tarea tiene formato valido
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Tarea no Existe')
    return res.status(404).json({msg: error.message})
  }
  
  // verifico que la tarea exista
  const tarea = await Tarea.findById(id).populate("proyecto")
  if (!tarea) {
    const error = new Error('Tarea no Encontrada')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
  // como la tarea no tiene quien es el creador, sino que lo tiene indirectamente a traves del proyecto relacionado, para eso agrego ".populate("proyecto") para que traiga el arreglo de proyectos relacionados
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Accion no Valida')               
    return res.status(403).json({msg: error.message})
  }

  try {
    // tengo que eliminar las tareas de Tareas y tambien de la lista que lleva el proyecto para relacionar
    // si pongo dos await seguidos, no hay problema pero bloquea hasta que no termina uno no sigue con el otro. puedo poner todo junto e inician en paralelo

    const proyecto = await Proyecto.findById(tarea.proyecto)
    proyecto.tareas.push(tarea._id)                                       
    //await proyecto.save()
    //await tarea.deleteOne()
    await Promise.allSettled([ await proyecto.save(), await tarea.deleteOne() ])

    res.json({msg: "La Tarea se elimino"})
  } catch (error) {
    console.log(error)
  }
}

/////////////////////////////////////////////////////////////////////////////////////
const cambiarEstado = async (req, res) => {
  const { id } = req.params

  // verifico si el id de la tarea tiene formato valido
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Tarea no Existe')
    return res.status(404).json({msg: error.message})
  }  

  const tarea = await Tarea.findById(id).populate("proyecto")

  // verifico que la tarea exista
  if (!tarea) {
    const error = new Error('Tarea no Encontrada')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }

  // el que puede poner como completa o incompleta una tarea es el creador o colaborador
  if ( tarea.proyecto.creador.toString() !== req.usuario._id.toString() && 
      !tarea.proyecto.colaboradores.some(
        (colaborador) => colaborador._id.toString() === req.usuario._id.toString() )
     ) {
    const error = new Error('Accion no Valida')               
    return res.status(403).json({msg: error.message})
  }

  tarea.estado = !tarea.estado
  tarea.completado = req.usuario._id
  await tarea.save()

  const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado")  // la completo con el populate de completado

  res.json(tareaAlmacenada)
}


export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado
}
