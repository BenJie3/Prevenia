import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token de seguridad faltante." }, { status: 400 });
    }

    // 1. Buscar si el token existe
    const activationRecord = await prisma.activationToken.findUnique({
      where: { token },
    });

    if (!activationRecord) {
      return NextResponse.json({ error: "Enlace inválido o ya utilizado." }, { status: 400 });
    }

    // 2. Verificar si ya expiró (24 horas)
    if (new Date() > new Date(activationRecord.expiresAt)) {
      await prisma.activationToken.delete({ where: { token } });
      return NextResponse.json({ error: "El enlace ha caducado. Por favor, regístrate de nuevo." }, { status: 400 });
    }

    // 3. Activar al usuario marcando su emailVerified con la fecha actual
    await prisma.user.update({
      where: { email: activationRecord.email },
      data: { emailVerified: new Date() },
    });

    // 4. Eliminar el token de un solo uso
    await prisma.activationToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true, message: "Cuenta activada correctamente." });

  } catch (error) {
    console.error("Error en verify-email:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}