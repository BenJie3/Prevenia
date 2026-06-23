import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PDFParser from "pdf2json";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se detectó ningún archivo." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. EXTRAER TEXTO CON pdf2json
    const pdfText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);   

      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    // 2. LIMPIAR EL TEXTO (Quitamos saltos de línea gigantes para ahorrar espacio)
    const cleanText = pdfText.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    // 3. GUARDAMOS EL TEXTO COMPLETO DIRECTAMENTE (Aprovechando el millón de tokens de Gemini)
    const dbPath = path.join(process.cwd(), "knowledge_base.json");
    
    let knowledgeBase: any[] = [];
    try {
      const fileData = await fs.readFile(dbPath, "utf-8");
      knowledgeBase = JSON.parse(fileData);
    } catch (e) {
      // Si el archivo no existe, iniciamos vacío
    }

    // Agregamos el nuevo documento a la base de conocimiento
    knowledgeBase.push({
  id: Date.now(),
  source: file.name,
  content: cleanText,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null // Nace vivo y activo
});

await fs.writeFile(dbPath, JSON.stringify(knowledgeBase, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: "Documento leído y memorizado exitosamente",
      chunksProcessed: "1M Tokens Ready" 
    });

  } catch (error) {
    console.error("Error al leer PDF:", error);
    return NextResponse.json(
      { error: "No se pudo procesar el documento PDF." },
      { status: 500 }
    );
  }
}