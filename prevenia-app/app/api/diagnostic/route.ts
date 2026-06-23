import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next"; //Importar sesión del servidor
import fs from "fs/promises";
import path from "path";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Recibimos los 3 datos nuevos
    const { 
      userId, age, weight, height, waist, physicalActivity, 
      familyHistory, fastingGlucose, systolicPressure,
      healthyDiet, previousHighGlucose, bloodPressureMedication // <- NUEVOS
    } = body;

    const dbPath = path.join(process.cwd(), "knowledge_base.json");
    let medicalContext = "Usa las guías estándar (OMS, ADA).";
    
    try {
      const fileData = await fs.readFile(dbPath, "utf-8");
      const knowledgeBase = JSON.parse(fileData);
      const activeDocs = knowledgeBase.filter((doc: any) => doc.deletedAt === null);
      if (activeDocs.length > 0) {
         medicalContext = activeDocs.map((doc: any) => `[${doc.source}]:\n${doc.content}`).join("\n\n");
      }
    } catch (e) {
      console.log("Sin documentos RAG.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Le inyectamos los nuevos datos al Prompt de Gemini
    const prompt = `
      Eres el motor de diagnóstico médico de "Prevenia", un sistema de salud predictivo.
      Tu tarea es analizar los datos del paciente y devolver un diagnóstico estructurado en formato JSON.

      LITERATURA MÉDICA DE REFERENCIA (REGLAS ESTRICTAS):
      ${medicalContext}

      DATOS DEL PACIENTE A EVALUAR:
      - Edad: ${age} años
      - Peso: ${weight} kg
      - Altura: ${height} cm
      - Cintura: ${waist || "No especificada"} cm
      - Actividad Física: ${physicalActivity}
      - Consume verduras/frutas a diario: ${healthyDiet ? "Sí" : "No"}
      - Antecedentes familiares de diabetes: ${familyHistory ? "Sí" : "No"}
      - Se le ha detectado glucosa alta alguna vez en su vida: ${previousHighGlucose ? "Sí" : "No"}
      - Toma medicación para la presión arterial: ${bloodPressureMedication ? "Sí" : "No"}
      - Glucosa en ayunas actual: ${fastingGlucose || "No especificada"} mg/dL
      - Presión arterial sistólica actual: ${systolicPressure || "No especificada"} mmHg

      INSTRUCCIONES:
      1. Basándote en la LITERATURA MÉDICA DE REFERENCIA, evalúa el riesgo metabólico del paciente.
      2. Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
      {
        "riskLevel": "Bajo" | "Moderado" | "Alto",
        "aiAnalysis": "Párrafo breve explicando el resultado...",
        "recommendedPlan": "Acción 1; Acción 2; Acción 3" 
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanJsonString);

    // 3. Guardamos los nuevos datos en Prisma
    let savedDiagnostic = null;
    if (userId) {
      savedDiagnostic = await prisma.diagnostic.create({
        data: {
          userId,
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          waist: waist ? parseFloat(waist) : null,
          physicalActivity,
          familyHistory,
          fastingGlucose: fastingGlucose ? parseFloat(fastingGlucose) : null,
          systolicPressure: systolicPressure ? parseFloat(systolicPressure) : null,
          healthyDiet,              // <- NUEVO
          previousHighGlucose,      // <- NUEVO
          bloodPressureMedication,  // <- NUEVO
          riskLevel: aiData.riskLevel,
          aiAnalysis: aiData.aiAnalysis,
          recommendedPlan: aiData.recommendedPlan,
        }
      });
    }

    return NextResponse.json({ success: true, diagnostic: aiData, savedId: savedDiagnostic?.id });

  } catch (error) {
    return NextResponse.json({ error: "Error al procesar el diagnóstico clínico." }, { status: 500 });
  }
}
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // 🛡️ Buscamos al usuario por su email
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    
    if (!requestedUserId) {
      return NextResponse.json({ error: "No se proporcionó ID válido." }, { status: 400 });
    }

    // 🛡️ PROTECCIÓN IDOR: Validamos el ID real de la BD
    if (requestedUserId !== dbUser.id && dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado (403)." }, { status: 403 });
    }

    const history = await prisma.diagnostic.findMany({
      where: { userId: requestedUserId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}