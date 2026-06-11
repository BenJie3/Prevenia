import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalPatients = await prisma.user.count({ where: { role: "PACIENTE" } });
    const totalEvaluations = await prisma.diagnostic.count({ where: { deletedAt: null } });

    // Conteo exacto para la barra de distribución
    const riskBajo = await prisma.diagnostic.count({ where: { riskLevel: "Bajo", deletedAt: null } });
    const riskModerado = await prisma.diagnostic.count({ where: { riskLevel: "Moderado", deletedAt: null } });
    const riskAlto = await prisma.diagnostic.count({ where: { riskLevel: "Alto", deletedAt: null } });

    const highRiskPercentage = totalEvaluations > 0 ? Math.round((riskAlto / totalEvaluations) * 100) : 0;

    const patientsData = await prisma.user.findMany({
      where: { role: "PACIENTE" },
      select: {
        id: true,
        name: true,
        email: true,
        diagnostics: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1, 
          select: { createdAt: true, riskLevel: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const patients = patientsData.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      lastEvaluation: p.diagnostics.length > 0 ? p.diagnostics[0].createdAt : null,
      status: p.diagnostics.length > 0 ? p.diagnostics[0].riskLevel : "Sin datos"
    }));

    return NextResponse.json({
      success: true,
      stats: { 
        totalPatients, 
        totalEvaluations, 
        highRiskPercentage,
        distribution: { bajo: riskBajo, moderado: riskModerado, alto: riskAlto } // <- DATO NUEVO
      },
      patients
    });

  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    return NextResponse.json({ error: "Error al cargar analíticas." }, { status: 500 });
  }
}