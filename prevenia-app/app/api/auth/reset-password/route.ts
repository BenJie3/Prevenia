import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    // 1. Buscar el token en la BD
    const resetRequest = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetRequest) {
      return NextResponse.json({ error: "El enlace es inválido o ya fue utilizado." }, { status: 400 });
    }

    // 2. Verificar si el token ya expiró
    if (new Date() > new Date(resetRequest.expires)) {
      // Si caducó, lo eliminamos para limpiar la BD
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "El enlace ha caducado. Solicita uno nuevo." }, { status: 400 });
    }

    // 3. Hashear la nueva contraseña con Bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar al usuario
    await prisma.user.update({
      where: { email: resetRequest.identifier },
      data: { password: hashedPassword },
    });

    // 5. Eliminar el token para que no se pueda volver a usar jamás
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true, message: "Contraseña actualizada." });

  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}