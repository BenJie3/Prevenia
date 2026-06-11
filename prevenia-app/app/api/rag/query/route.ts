import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "La pregunta no puede estar vacía." }, { status: 400 });
    }

    // 1. LEER LA BASE DE CONOCIMIENTO (Tu "ChromaDB" local)
    const dbPath = path.join(process.cwd(), "knowledge_base.json");
    let knowledgeBase = [];
    try {
      const fileData = await fs.readFile(dbPath, "utf-8");
      knowledgeBase = JSON.parse(fileData);
    } catch (e) {
      return NextResponse.json({ error: "No hay documentos indexados. Sube un PDF primero." }, { status: 404 });
    }

    if (knowledgeBase.length === 0) {
      return NextResponse.json({ error: "La base de conocimiento está vacía." }, { status: 404 });
    }

    // Unimos todo el texto de todos los PDFs que hayas subido
    const allContext = knowledgeBase.map(doc => `DOCUMENTO [${doc.source}]:\n${doc.content}`).join("\n\n");

    // 2. EL PROMPT MÉDICO ESTRICTO (El núcleo del RAG)
    const prompt = `
      Eres un asistente médico experto. Se te proporcionará una base de conocimiento clínico extraída de documentos oficiales.
      
      BASE DE CONOCIMIENTO:
      ${allContext}

      PREGUNTA DEL USUARIO:
      ${query}

      REGLAS ESTRICTAS:
      1. Responde a la pregunta basándote ÚNICAMENTE en la BASE DE CONOCIMIENTO proporcionada arriba.
      2. Si la respuesta no está en los documentos, di explícitamente: "Lo siento, no tengo información sobre esto en mis documentos médicos indexados." NO inventes datos.
      3. Sé claro, profesional y directo.
    `;

    // 3. LLAMAMOS A GEMINI FLASH
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ 
      success: true, 
      answer: responseText 
    });

  } catch (error) {
    console.error("Error en RAG Query:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la consulta con la IA." },
      { status: 500 }
    );
  }
}