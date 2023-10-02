import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: 'yahoo',
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS    
    },
    debug: false,
    logger: true,
    tls: {
      rejectUnauthorized: false
  }
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    // auth: {
    //   user: "4a2f130393178c",
    //   pass: "2f0ec43b6d5fbd"
  });

  // el link del email tiene que apuntar al frontend/confirmar/:token   que eso va a llamar a la funcion confirmarCuenta que es la que va a realmente enviar la confirmar al backend
  // informacion del email
  const info = await transport.sendMail({
    //from: '"Ultask - Administrador de Proyectos" <cuentas@uptask.com>',
    from: 'flecodd@yahoo.com',
    to: email,
    subject: "UpTask - Confirma tu Cuenta",
    text: "Comprueba tu cuenta en UpTask",
    html: `<p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
    <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

    <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>  
    
    `
  })
}



export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos

  // TODO: Mover hacia variables de entorno
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: 'yahoo',
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS    
    },
    debug: false,
    logger: true,
    tls: {
      rejectUnauthorized: false
  }
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    // auth: {
    //   user: "4a2f130393178c",
    //   pass: "2f0ec43b6d5fbd"
  });

  // el link del email tiene que apuntar al frontend/confirmar/:token   que eso va a llamar a la funcion confirmarCuenta que es la que va a realmente enviar la confirmar al backend
  // informacion del email
  const info = await transport.sendMail({
    //from: '"Ultask - Administrador de Proyectos" <cuentas@uptask.com>',
    from: 'flecodd@yahoo.com',
    to: email,
    subject: "UpTask - Reestablece tu Password",
    text: "Reestablece tu Password en UpTask",
    html: `<p>Hola: ${nombre} has solicitado reestablecer tu password en UpTask</p>
    <p>Sigue el siguiente enlace para generar un nuevo password:</p>
    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>

    <p>Si tu no solicitaste reestablecer tu password, puedes ignorar el mensaje</p>  
    
    `
  })
}