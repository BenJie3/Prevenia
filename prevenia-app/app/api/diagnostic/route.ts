import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// Usamos tu llave (asegúrate de que sea la correcta, o pégala directo si tuviste problemas antes)
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, age, weight, height, waist, physicalActivity, 
      familyHistory, fastingGlucose, systolicPressure 
    } = body;

    // 1. LEER LA BASE DE CONOCIMIENTO MÉDICO (RAG)
    const dbPath = path.join(process.cwd(), "knowledge_base.json");
    let medicalContext = "No hay documentos médicos adicionales proporcionados. Usa las guías estándar (OMS, ADA).";
    
    try {
      const fileData = await fs.readFile(dbPath, "utf-8");
      const knowledgeBase = JSON.parse(fileData);
      
      // Filtramos solo los documentos ACTIVOS (no borrados)
      const activeDocs = knowledgeBase.filter((doc: any) => doc.deletedAt === null);
      
      if (activeDocs.length > 0) {
         // Unimos todo el texto de los PDFs
         medicalContext = activeDocs.map((doc: any) => `DOCUMENTO OFICIAL [${doc.source}]:\n${doc.content}`).join("\n\n");
      }
    } catch (e) {
      console.log("No se encontró base de conocimiento local. Procediendo con conocimiento general.");
    }

    // 2. PREPARAR EL PROMPT MAESTRO
    // Usamos Gemini 2.5 Flash, que tiene memoria de sobra para leer todo el contexto médico
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
      - Antecedentes familiares de diabetes: ${familyHistory ? "Sí" : "No"}
      - Glucosa en ayunas: ${fastingGlucose || "No especificada"} mg/dL
      - Presión arterial sistólica: ${systolicPressure || "No especificada"} mmHg

      INSTRUCCIONES:
      1. Basándote ESTRICTAMENTE en la "LITERATURA MÉDICA DE REFERENCIA" proporcionada arriba, evalúa el riesgo metabólico del paciente.
      2. Calcula su IMC en base a la altura y el peso.
      3. Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta (no agregues comillas \`\`\`json ni texto extra):
      {
        "riskLevel": "Bajo" | "Moderado" | "Alto",
        "aiAnalysis": "Párrafo breve, profesional y empático explicando el resultado...",
        "recommendedPlan": "Acción 1; Acción 2; Acción 3" 
      }
    `;

    // 3. GENERAR DIAGNÓSTICO
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpiamos la respuesta en caso de que Gemini devuelva etiquetas markdown
    const cleanJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanJsonString);

    // 4. GUARDAR EN LA BASE DE DATOS (Si es un paciente registrado)
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
          riskLevel: aiData.riskLevel,
          aiAnalysis: aiData.aiAnalysis,
          recommendedPlan: aiData.recommendedPlan,
        }
      });
    }

    return NextResponse.json({ success: true, diagnostic: aiData, savedId: savedDiagnostic?.id });

  } catch (error) {
    console.error("ERROR EN IA:", error);
    return NextResponse.json({ error: "Error al procesar el diagnóstico clínico." }, { status: 500 });
  }
}

// ============================================================================
// Endpoint GET: Para leer el historial del paciente en su Dashboard
// ============================================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "No se proporcionó ID válido." }, { status: 400 });
    }

    const history = await prisma.diagnostic.findMany({
      where: { userId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, history }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Error al obtener el historial." }, { status: 500 });
  }
}