import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es obligatorio." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // 🛡️ REGLA DE SEGURIDAD: Nunca devolvemos error si el correo no existe.
    // Esto evita que los hackers hagan "ingeniería inversa" para saber quién usa Prevenia.
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // 1. Generar token criptográfico único
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // El token caduca en exactamente 1 hora

    // 2. Limpiar tokens viejos de este usuario (por si le dio clic 5 veces al botón)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // 3. Guardar el nuevo token en la BD
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // 4. Enviar el correo usando tu cuenta de Gmail
    await sendPasswordResetEmail(user.email || "", token, user.name || "");

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}