import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next"; 

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    // 1. Verificamos que haya sesión y un email válido
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // 🛡️ TRUCO SENIOR: Buscamos al usuario en la BD usando su email infalible
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta el ID" }, { status: 400 });

    // 🛡️ PROTECCIÓN IDOR: Comparamos el ID que piden con el ID real de tu Base de Datos
    if (id !== dbUser.id && dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado (403)." }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true } 
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // 🛡️ Buscamos el rol y ID real
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id, name } = await request.json();
    
    if (!id || !name || name.trim() === "") {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // 🛡️ PROTECCIÓN IDOR
    if (id !== dbUser.id && dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado (403)." }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: name.trim() }
    });

    return NextResponse.json({ success: true, message: "Perfil actualizado.", user: updatedUser });

  } catch (error) {
    return NextResponse.json({ error: "Error interno al actualizar." }, { status: 500 });
  }
}