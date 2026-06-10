import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Al nombrar la función como POST, Next.js sabe que responderá a peticiones POST de formularios
export async function POST(request: Request) {
  try {
    // 1. Extraemos los datos que mandó el formulario desde el Frontend
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Validación básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // 3. Verificar si el correo ya está registrado en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // 4. Encriptar la contraseña (Se vuelve una cadena ilegible de 60 caracteres)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Guardar el nuevo usuario en SQLite usando Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PACIENTE", // Rol predeterminado
      },
    });

    // 6. Devolver respuesta de éxito al Frontend (sin exponer la contraseña por seguridad)
    return NextResponse.json(
      { message: "Usuario registrado con éxito", userId: newUser.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("ERROR_EN_REGISTRO:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}