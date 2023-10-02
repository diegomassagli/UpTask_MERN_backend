import express from 'express'
import {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador
} from '../controllers/proyectoController.js'

import checkAuth from '../middleware/checkAuth.js'  // como ya se que el acceso a proyectos esta restringido, ya me traigo el checkout !

const router = express.Router()

router.route("/")
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto)

router.route('/:id')
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto)

// router.get('/tareas/:id', checkAuth, obtenerTareas)   // este id es el del proyecto
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)  // usa post y no delete porque no elimina un recurso completo sino solo una parte de un recurso
// antes lo tenia como router.delete('/colaboradores/:id', checkAuth, eliminarColaborador) pero en un delete no se puede pasar valores por el body ?? por eso lo vuelve a post y cambio la ruta de acceso
// el id que va por la url es el id del proyecto, y por el body necesito pasarle el id del usuario que quiero eliminar


export default router
