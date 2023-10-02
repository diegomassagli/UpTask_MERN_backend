import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js' 
import tareaRoutes from './routes/tareaRoutes.js'

const app = express()
app.use(express.json())                   // esto es necesario para habilitar que el controlador pueda tener acceso a la info json que llega en los endpoints

dotenv.config()                           // primero hago npm i dotenv  luego con esta linea luego de importarlo, busca un archivo .env

conectarDB()

// configurar CORS
const whitelist = [process.env.FRONTEND_URL]   // no necesito agregarle nada antes a la variable y accedo como process.env y en vite es VITE_xxx  y accedo como import.meta.env

const corsOptions = {
  origin: function(origin, callback) {
    if(!origin){ // postman request no tienen origin
      return callback(null, true)
    }else if(whitelist.includes(origin)) {
      // puede consultar la api
      callback(null, true)
    }else {         
      // no esta permitido consultar la api
      callback(new Error ("Error de Cors"))
     }
  }
}
app.use(cors(corsOptions))


// Routing   // aca defino que es lo que va a responder con los diferentes verbos http  (app.use responde a todos los verbos(get,put,patch,delete) y con app.get responde solo a get)
             // en express el req es lo que vas enviando y res es la respuesta que siempre estan presentes en cada interaccion con el servidor
             // estas lineas siguientes las podria armar aca, pero por proligidad las separo en routes/usuarioRoutes.js 
// app.get('/api/usuarios', (req, res) => {
//   res.send('Hola Mundo...')
// })
app.use("/api/usuarios", usuarioRoutes)   
app.use("/api/proyectos", proyectoRoutes)   
app.use("/api/tareas", tareaRoutes)   

const PORT = process.env.PORT || 4000  // en produccion tendria que definir esa variable de entorno, pero en local no la defino y que asuma por defecto 4000
const servidor = app.listen(PORT, ()=> {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})


// Socket.io  (separada solo por prolijidad)
import { Server }  from 'socket.io'   // lo ideal es que el server sea el mismo que tenemos, por eso agregamos arriba-> const servidor = app.listen bla bla

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
// abro la conexion

io.on('connection', (socket)=> {
  // console.log('Conectado a socket.io')

  // definir los eventos de socket.io
  socket.on('abrir proyecto', (proyecto) => { 
    socket.join(proyecto)                             // proyecto nos dice en que pagina esta cada usuario   Aca el usuario se conecta a un proyecto(room) en particular 
  })

  socket.on('nueva tarea', tarea =>{                  // esto esta escuchando por nuevas tareas y cuando llega una, emite un aviso para todos los que esten en ese proyecto o room
    const proyecto  = tarea.proyecto
    socket.to(proyecto).emit('tarea agregada', tarea)
  })

  socket.on('eliminar tarea', tarea =>{
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea eliminada', tarea)
  })

  socket.on('actualizar tarea', tarea =>{
    const proyecto = tarea.proyecto._id                   // porque si hago un console.log de "tarea" veo que se trae el proyecto completo !!
    socket.to(proyecto).emit('tarea actualizada', tarea)
  })

  socket.on('cambiar estado', tarea =>{
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('nuevo estado', tarea)
  })

})
