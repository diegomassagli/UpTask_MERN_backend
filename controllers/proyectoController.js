import mongoose from "mongoose"
import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// este debe devolver los proyectos creados por este usuario logueado!
const obtenerProyectos = async (req,res) => {                                                       // tambien puedo pedirle que ni siquiera traiga el ID de las tareas...
  const proyectos = await Proyecto.find({                                                           // aca uso el OR porque puede sercreadores o colaboradores
    '$or' : [
      {'colaboradores' : {$in: req.usuario}},
      {'creador' : {$in: req.usuario}}
    ],
  })//.where ('creador')   estas dos lineas se reemplaron por el ord
    //.equals(req.usuario)
    .select('-tareas')   //NOTAR QUE PARA OBTENER EL USUARIO AUTENTICADO USO EL REQ.USUARIO (interno) Y NO USO LO QUE ME MANDA EL CLIENTE !!

  res.json(proyectos)
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const nuevoProyecto = async (req,res) => {
  delete req.body.id                                           // hago esto porque puede venir un id:null y genera problemas
  const proyecto = new Proyecto(req.body)
  proyecto.creador = req.usuario._id
  try {
    const proyectoAlmacenado = await proyecto.save()
    res.json(proyectoAlmacenado)                               // despues de guardarlo devuelvo el proyecto pero ahora desde la base de datos
    console.log(proyectoAlmacenado)
  } catch (error) {
    console.log(error)
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const obtenerProyecto = async (req,res) => {
  const { id } = req.params
  
  // valido que el id sea un id valido, porque sino rompe el servidor
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Proyecto no Existe')
    return res.status(404).json({msg: error.message})
  }

  const proyecto = await Proyecto.findById(id)
    .populate({ path: 'tareas', populate: { path: 'completado', select: "nombre" } } )  // no se puede agregar un populate a "completado" porque proyecto no sabe quien completo la tarea, porque eso esta definido en tareas, por eso uso "div populate". entonces le aplico un populate a tareas y dentro de esta un populate a completado
    .populate('colaboradores', "nombre email")   // se pone el nombre del campo que las relaciona y si quiero limitar los campos de una de las tablas relacionadas lo tengo que hacer con coma, y un string con los campos a traer separados por un espacio
  if (!proyecto) {
    const error = new Error('Proyecto no Encontrado')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
 // si quisiera comparar los id's de creador y del usuario que tengo logueado, debo usar .toString porque sino da false!!!
  if( proyecto.creador.toString() !== req.usuario._id.toString() &&               // aca comparo que: el creador no sea igual al logueado Y que entre los colaboradores no este el usuario logueado
     !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()) ) {
    const error = new Error('Accion No Valida')
    return res.status(401).json({msg: error.message})
  }



  res.json(
    proyecto    // si retorno proyecto entre llaves, al ser ya un objeto queda como proyecto/proyecto
  )
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const editarProyecto = async (req,res) => {
  const { id } = req.params

  // valido que el id sea un id valido, porque sino rompe el servidor
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Proyecto no Existe')
    return res.status(404).json({msg: error.message})
  }

  const proyecto = await Proyecto.findById(id)
  if (!proyecto) {
    const error = new Error('Proyecto no Encontrado')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
 // si quisiera comparar los id's de creador y del usuario que tengo logueado, debo usar .toString porque sino da false!!!
  if( proyecto.creador.toString() !== req.usuario._id.toString() ) {
    const error = new Error('Accion No Valida')
    return res.status(401).json({msg: error.message})
  }
   
  // para cada uno de los campos de mi "tabla" debo reemplazar el valor si me lo pasaron por body o volver a ponerle el que tenia en la base de datos
  proyecto.nombre = req.body.nombre || proyecto.nombre
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
  proyecto.cliente = req.body.cliente || proyecto.cliente

  try {
    const proyectoAlmacenado = await proyecto.save()
    res.json(proyectoAlmacenado)
  } catch (error) {
    console.log(error)
  }

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const eliminarProyecto = async (req,res) => {
  const { id } = req.params

  // valido que el id sea un id valido, porque sino rompe el servidor
  const valid = mongoose.Types.ObjectId.isValid(id)
  if (!valid) {
    const error = new Error('Proyecto no Existe')
    return res.status(404).json({msg: error.message})
  }

  const proyecto = await Proyecto.findById(id)
  if (!proyecto) {
    const error = new Error('Proyecto no Encontrado')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
    return res.status(404).json({msg: error.message})
  }
  
 // si quisiera comparar los id's de creador y del usuario que tengo logueado, debo usar .toString porque sino da false!!!
  if( proyecto.creador.toString() !== req.usuario._id.toString() ) {
    const error = new Error('Accion No Valida')
    return res.status(401).json({msg: error.message})
  }
   
  try {
    await proyecto.deleteOne()
    res.json({msg: "Proyecto Eliminado"})
  } catch (error) {
   console.log(error) 
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const buscarColaborador = async (req,res) => {
  const { email } = req.body

  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

  if(!usuario){
    const error = new Error('Usuario no encontrado')
    return res.status(404).json({ msg: error.message })
  }

  res.json(usuario)
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const agregarColaborador = async (req,res) => {
  // reviso nuevamente si el id que viene en la url es de un proyecto valido (no lo cambiaron para probar!)
  const proyecto = await Proyecto.findById(req.params.id)
  if (!proyecto) {
    const error = new Error("Proyecto no Encontrado")
    return res.status(404).json({msg: error.message})
  }

  // valido si el creador del proyecto es el que esta logueado
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {    // le debo poner .toString porque es un objeto para poder compararlo
    const error = new Error("Accion no Valida")
    return res.status(404).json({msg: error.message})    
  }

  // valido si el email del colaborador que quiero agregar existe
  const { email } = req.body
  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')
  if(!usuario){
    const error = new Error('Usuario no encontrado')
    return res.status(404).json({ msg: error.message })
  }

  // tambien valido que el colaborador no sea el mismo creador !
  if(proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El creador del proyecto no puede ser Colaborador")
    return res.status(404).json({msg: error.message})    
  }

  // tambien tengo que validar que no este agregado ya al proyecto
  if(proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El Usuario ya pertenece al Proyecto')
    return res.status(404).json({ msg: error.message })
  }

  // despues de todos estos controles, se puede agregar...
  proyecto.colaboradores.push(usuario._id)
  await proyecto.save()
  res.json({msg: "Colaborador agregador correctamente"})


}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const eliminarColaborador = async (req,res) => {
  // reviso nuevamente si el id que viene en la url es de un proyecto valido (no lo cambiaron para probar!)
  const proyecto = await Proyecto.findById(req.params.id)
  if (!proyecto) {
    const error = new Error("Proyecto no Encontrado")
    return res.status(404).json({msg: error.message})
  }

  // valido si el creador del proyecto es el que esta logueado
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {    // le debo poner .toString porque es un objeto para poder compararlo
    const error = new Error("Accion no Valida")
    return res.status(404).json({msg: error.message})    
  }

  // despues de todos estos controles, se puede eliminar...
  proyecto.colaboradores.pull(req.body.id)
  await proyecto.save()
  res.json({msg: "Colaborador eliminado correctamente"})
  
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// no hace falta porque las tareas las obtengo al obtener el proyecto
// const obtenerTareas = async (req,res) => {
//     const { id } = req.params

//     // valido que el id sea un id valido, porque sino rompe el servidor
//     const valid = mongoose.Types.ObjectId.isValid(id)
//     if (!valid) {
//       const error = new Error('Proyecto no Existe')
//       return res.status(404).json({msg: error.message})
//     }
  
//     const proyecto = await Proyecto.findById(id)
//     if (!proyecto) {
//       const error = new Error('Proyecto no Encontrado')               // ESTOS CASOS LOS DEFINO COMO ERRORES PORQUE DE ESA MANERA, EN EL FRONTEND LOS ATRAPO CON TRY/CATCH
//       return res.status(404).json({msg: error.message})
//     }
  
//     // para ver las tareas tienes que ser el creador o colaborador del proyecto (validar aca despues)


//     const tareas = await Tarea.find().where('proyecto').equals(id)
//     res.json(tareas)
// }




export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador
}





