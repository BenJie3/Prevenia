import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Extraemos el primer nombre para hacerlo más personal
    const firstName = name ? name.split(' ')[0] : 'Paciente';

    // 🎨 PLANTILLA HTML PROFESIONAL DE PREVENIA
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #EAE2D0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <tr>
          <td style="background-color: #6B8E7D; text-align: center; padding: 40px 20px;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Times New Roman', serif; font-size: 28px; letter-spacing: 1px;">Prevenia</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Inteligencia Médica</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 40px;">
            <h2 style="color: #2C332B; margin-top: 0; font-family: 'Times New Roman', serif; font-size: 24px;">¡Hola, ${firstName}! 👋</h2>
            <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">Nos emociona darte la bienvenida a <strong>Prevenia</strong>. Has dado el primer gran paso hacia la comprensión y el cuidado de tu salud metabólica.</p>
            
            <div style="background-color: #F8F6F0; border-radius: 16px; padding: 20px; margin: 30px 0; border-left: 4px solid #6B8E7D;">
              <p style="color: #2C332B; margin: 0; font-size: 14px; line-height: 1.6;">
                Nuestra Inteligencia Artificial está lista para analizar tus biomarcadores y cruzar tus datos con literatura clínica oficial. Tu privacidad está 100% blindada.
              </p>
            </div>

            <p style="color: #4A5568; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">¿Todo listo para conocer tu estado actual y descubrir cómo optimizar tu bienestar a largo plazo?</p>
            
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/diagnostic" style="background-color: #2C332B; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 14px; font-weight: bold; display: inline-block;">Iniciar mi Evaluación Gratuita</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color: #F8F6F0; text-align: center; padding: 30px 20px; border-top: 1px solid #EAE2D0;">
            <p style="color: #A0AEC0; margin: 0; font-size: 12px;">El autocuidado no es un lujo, es una necesidad.</p>
            <p style="color: #A0AEC0; margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase;">© ${new Date().getFullYear()} Prevenia HealthTech</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Prevenia IA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Bienvenido a Prevenia - Tu viaje preventivo comienza hoy 🌿",
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo de bienvenida enviado a:", email);
  } catch (error) {
    console.error("❌ Error enviando correo de bienvenida:", error);
  }
};
// Función adicional para enviar correo de recuperación de contraseña con un enlace seguro que expira en 1 hora. Esta función se puede llamar desde el endpoint de recuperación de contraseña.
export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const firstName = name ? name.split(' ')[0] : 'Paciente';
    // 🛡️ El enlace secreto con el Token que caduca en 1 hora
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // 🎨 PLANTILLA HTML PARA RECUPERACIÓN DE CONTRASEÑA
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #EAE2D0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <tr>
          <td style="background-color: #2C332B; text-align: center; padding: 40px 20px;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Times New Roman', serif; font-size: 28px; letter-spacing: 1px;">Prevenia</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Seguridad de Cuenta</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 40px;">
            <h2 style="color: #2C332B; margin-top: 0; font-family: 'Times New Roman', serif; font-size: 22px;">Hola, ${firstName} 🔐</h2>
            <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Prevenia</strong>.</p>
            
            <div style="background-color: #F8F6F0; border-radius: 16px; padding: 20px; margin: 30px 0; border-left: 4px solid #2C332B;">
              <p style="color: #2C332B; margin: 0; font-size: 14px; line-height: 1.6;">
                Si tú no hiciste esta solicitud, puedes ignorar este correo de forma segura. Tu contraseña actual no cambiará.
              </p>
            </div>

            <p style="color: #4A5568; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">Para crear una nueva contraseña, haz clic en el siguiente botón (Este enlace expirará en 1 hora):</p>
            
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${resetLink}" style="background-color: #6B8E7D; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 14px; font-weight: bold; display: inline-block;">Restablecer mi Contraseña</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color: #F8F6F0; text-align: center; padding: 30px 20px; border-top: 1px solid #EAE2D0;">
            <p style="color: #A0AEC0; margin: 0; font-size: 12px;">Prevenia HealthTech | Privacidad Absoluta</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Prevenia Seguridad" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablece tu contraseña - Prevenia 🔐",
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo de recuperación enviado a:", email);
  } catch (error) {
    console.error("❌ Error enviando correo de recuperación:", error);
  }
};

export const sendActivationEmail = async (email: string, token: string, name: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const firstName = name ? name.split(' ')[0] : 'Paciente';
    // 🛡️ El enlace para activar la cuenta
    const activationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #EAE2D0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #6B8E7D; text-align: center; padding: 40px 20px;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Times New Roman', serif; font-size: 28px; letter-spacing: 1px;">Prevenia</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Verificación de Cuenta</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 40px;">
            <h2 style="color: #2C332B; margin-top: 0; font-family: 'Times New Roman', serif; font-size: 24px;">¡Hola, ${firstName}! 👋</h2>
            <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">Estás a un solo paso de unirte a Prevenia. Para asegurar la protección de tus datos médicos, necesitamos verificar que esta dirección de correo te pertenece.</p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
              <tr>
                <td align="center">
                  <a href="${activationLink}" style="background-color: #2C332B; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 14px; font-weight: bold; display: inline-block;">Activar mi Cuenta</a>
                </td>
              </tr>
            </table>
            <p style="color: #A0AEC0; font-size: 12px; text-align: center;">Este enlace expirará en 24 horas.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"Prevenia Seguridad" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Activa tu cuenta de Prevenia 🌿",
      html: htmlTemplate,
    });
  } catch (error) {
    console.error("❌ Error enviando correo de activación:", error);
  }
};