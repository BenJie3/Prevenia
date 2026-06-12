import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NUEVO: Obtener los datos frescos del usuario desde la BD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Falta el ID" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true } // Solo traemos el nombre por eficiencia (es súper rápido)
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}

// EL QUE YA TENÍAS: Actualizar el nombre
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    
    if (!id || !name || name.trim() === "") {
      return NextResponse.json({ error: "Datos inválidos o incompletos." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: name.trim() }
    });

    return NextResponse.json({ success: true, message: "Perfil actualizado correctamente.", user: updatedUser });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error interno al actualizar el perfil." }, { status: 500 });
  }
}