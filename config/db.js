import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI,{
      
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    const url = `${connection.connection.host}:${connection.connection.port}`
    console.log(`MondoDB conectado en: ${url}`)
  } catch (error) {
    console.log(`error: ${error.message}`)
    process.exit(1)  // fuerza que el proceso termina, normalmente con 0 pero en este caso con 1 (no importa si son sincro o asincronos)
  }
}

export default conectarDB;