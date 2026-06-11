import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dbPath = path.join(process.cwd(), "knowledge_base.json");

// Auxiliar seguro para leer el archivo JSON
async function readDB() {
  try {
    const fileData = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(fileData);
  } catch (e) {
    return [];
  }
}

// 1. READ: Obtener solo los documentos activos (deletedAt === null)
export async function GET() {
  try {
    const db = await readDB();
    const activeDocs = db.filter((doc: any) => doc.deletedAt === null);

    return NextResponse.json({ success: true, documents: activeDocs });
  } catch (error) {
    return NextResponse.json({ error: "Error al leer base de datos." }, { status: 500 });
  }
}

// 2. UPDATE: Modificar el nombre o metadatos de un documento indexado
export async function PUT(request: Request) {
  try {
    const { id, newName } = await request.json();
    const db = await readDB();

    const docIndex = db.findIndex((doc: any) => doc.id === id);
    if (docIndex === -1) {
      return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    }

    // Actualización clínica con marca de tiempo
    db[docIndex].source = newName;
    db[docIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
    return NextResponse.json({ success: true, message: "Documento modificado." });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar documento." }, { status: 500 });
  }
}

// 3. DELETE: Borrado lógico seguro (No destruye el archivo físico)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idString = searchParams.get("id");
    if (!idString) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

    const id = Number(idString);
    const db = await readDB();

    const docIndex = db.findIndex((doc: any) => doc.id === id);
    if (docIndex === -1) {
      return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    }

    // Aplicamos Borrado Lógico asentando la fecha de eliminación
    db[docIndex].deletedAt = new Date().toISOString();

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
    return NextResponse.json({ success: true, message: "Documento archivado lógicamente." });
  } catch (error) {
    return NextResponse.json({ error: "Error al archivar documento." }, { status: 500 });
  }
}