import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendActivationEmail } from "@/lib/mailer"; 

// 🛡️ ESCUDO 1: RATE LIMITING EN MEMORIA
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 3; // Máximo 3 registros por minuto por IP

function isRateLimited(ip: string) {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip);
  if (!userRecord) { rateLimitMap.set(ip, { count: 1, lastReset: now }); return false; }
  if (now - userRecord.lastReset > RATE_LIMIT_WINDOW) { rateLimitMap.set(ip, { count: 1, lastReset: now }); return false; }
  if (userRecord.count >= MAX_REQUESTS) { return true; }
  userRecord.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown_ip";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Demasiados intentos. Por favor espera 1 minuto." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, password, turnstileToken } = body; // 👈 Recibimos el Token del frontend

    // 🛡️ ESCUDO 2: CLOUDFLARE TURNSTILE
    if (!turnstileToken) {
      return NextResponse.json({ error: "Validación de seguridad requerida." }, { status: 400 });
    }

    const cfFormData = new FormData();
    cfFormData.append('secret', process.env.TURNSTILE_SECRET_KEY!);
    cfFormData.append('response', turnstileToken);

    // Preguntamos a los servidores de Cloudflare si el token es genuino
    const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: cfFormData
    });
    const cfData = await cfRes.json();

    if (!cfData.success) {
      return NextResponse.json({ error: "Falló la verificación anti-bots." }, { status: 403 });
    }

    // --- CONTINÚA EL FLUJO NORMAL DE REGISTRO ---
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "PACIENTE" },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.activationToken.create({
      data: { email: newUser.email!, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });

    sendActivationEmail(newUser.email!, token, newUser.name || "");

    return NextResponse.json({ message: "Cuenta creada. Revisa tu correo para activarla.", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("ERROR_EN_REGISTRO:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}