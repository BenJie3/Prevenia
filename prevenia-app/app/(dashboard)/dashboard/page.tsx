"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf"; 
import toast from "react-hot-toast";
import { 
  Download, Plus, Activity, BrainCircuit, CheckCircle2, 
  Circle, X, FileText, ArrowRight, User, CalendarCheck
} from "lucide-react";

export default function PatientDashboard() {
  const { data: session, status, update } = useSession();
  
  // ESTADOS DEL PERFIL
  const [displayName, setDisplayName] = useState("Cargando...");
  const [hasInitialized, setHasInitialized] = useState(false);
  const patientEmail = session?.user?.email || "";
  const patientImage = session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150";

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // ESTADOS DEL BACKEND
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // ESTADOS INTERACTIVOS
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // ESTADOS PARA EDICIÓN DE PERFIL
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // INICIALIZACIÓN ÚNICA
  useEffect(() => {
    // 👈 TRUCO: Le decimos a TypeScript que ignore sus reglas estrictas aquí
    const userId = (session?.user as any)?.id; 

    if (userId && !hasInitialized) {
      setDisplayName(session?.user?.name || "Paciente");
      setEditName(session?.user?.name || ""); 
      
      fetch(`/api/diagnostic?userId=${userId}`) // 👈 Usamos la variable segura
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setHistory(data.history);
          setIsLoadingHistory(false);
          setHasInitialized(true); 
        })
        .catch((err) => {
          console.error("Error fetching history:", err);
          setIsLoadingHistory(false);
        });
    }
  }, [session, hasInitialized]);

  // ==============================================================
  // 📄 GENERADOR DE PDF DE GRADO CLÍNICO
  // ==============================================================
  const handleDownloadPDF = () => {
    if (!history || history.length === 0) return;
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF();
      const latest = history[0];
      
      const primary = [44, 51, 43]; 
      const secondary = [107, 142, 125]; 
      const lightGray = [248, 246, 240]; 
      const darkGray = [80, 80, 80];
      
      const left = 15; 
      
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("PREVENIA", 15, 22);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("REPORTE METABÓLICO CLÍNICO", 195, 18, { align: "right" });
      
      doc.setFontSize(8);
      doc.text(`ID Reporte: PRV-${latest.id.substring(0, 8).toUpperCase()}`, 195, 24, { align: "right" });
      doc.text(`Fecha: ${new Date(latest.createdAt).toLocaleDateString('es-ES')}`, 195, 29, { align: "right" });

      let y = 48; 

      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMACIÓN DEL PACIENTE", left, y);
      y += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(left, y, 195, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      const heightInMeters = latest.height / 100;
      const bmi = (latest.weight / (heightInMeters * heightInMeters)).toFixed(1);

      doc.setFont("helvetica", "bold"); doc.text("Nombre:", left, y);
      doc.setFont("helvetica", "normal"); doc.text(displayName, 35, y);
      doc.setFont("helvetica", "bold"); doc.text("Edad:", 130, y);
      doc.setFont("helvetica", "normal"); doc.text(`${latest.age} años`, 145, y);
      y += 8;

      doc.setFont("helvetica", "bold"); doc.text("Estatura:", left, y);
      doc.setFont("helvetica", "normal"); doc.text(`${latest.height} cm`, 35, y);
      doc.setFont("helvetica", "bold"); doc.text("Peso:", 75, y);
      doc.setFont("helvetica", "normal"); doc.text(`${latest.weight} kg`, 90, y);
      doc.setFont("helvetica", "bold"); doc.text("IMC Calculado:", 130, y);
      doc.setFont("helvetica", "normal"); doc.text(`${bmi} kg/m²`, 160, y);

      y += 15;

      let riskColor = [22, 163, 74]; 
      let riskBg = [220, 252, 231];
      if (latest.riskLevel === 'Moderado') { riskColor = [202, 138, 4]; riskBg = [254, 243, 199]; }
      else if (latest.riskLevel === 'Alto') { riskColor = [220, 38, 38]; riskBg = [254, 226, 226]; }

      doc.setFillColor(riskBg[0], riskBg[1], riskBg[2]);
      doc.rect(left, y, 180, 16, "F");
      doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.setLineWidth(0.5);
      doc.rect(left, y, 180, 16, "S");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(`RESULTADO: RIESGO ${latest.riskLevel.toUpperCase()}`, 105, y + 10.5, { align: "center" });

      y += 28;

      doc.setFontSize(12);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("CUADRO CLÍNICO Y ESTILO DE VIDA", left, y);
      y += 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(left, y, 195, y);
      y += 8;

      doc.setFontSize(9);
      const drawMetric = (label:string, value:string, x:number, yPos:number) => {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.text(label, x, yPos);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          doc.text(value ? value.toString() : "N/D", x + 40, yPos);
      };

      drawMetric("Cintura:", latest.waist ? `${latest.waist} cm` : "No esp.", left, y);
      drawMetric("Glucosa (Ayunas):", latest.fastingGlucose ? `${latest.fastingGlucose} mg/dL` : "No esp.", 110, y);
      y += 8;
      drawMetric("Presión Sistólica:", latest.systolicPressure ? `${latest.systolicPressure} mmHg` : "No esp.", left, y);
      drawMetric("Toma Med. Presión:", latest.bloodPressureMedication ? "Sí" : "No", 110, y);
      y += 8;
      drawMetric("Glucosa Alta Previa:", latest.previousHighGlucose ? "Sí" : "No", left, y);
      drawMetric("Historial Familiar:", latest.familyHistory ? "Sí" : "No", 110, y);
      y += 8;
      drawMetric("Actividad Física:", latest.physicalActivity, left, y);
      drawMetric("Dieta Saludable:", latest.healthyDiet ? "Sí" : "No", 110, y);

      y += 18;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("ANÁLISIS DE INTELIGENCIA ARTIFICIAL", left, y);
      y += 2;
      doc.line(left, y, 195, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      const analysisLines = doc.splitTextToSize(latest.aiAnalysis, 170);
      const analysisBoxHeight = (analysisLines.length * 5) + 10;

      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(left, y, 180, analysisBoxHeight, "F");
      doc.text(analysisLines, 20, y + 8);
      
      y += analysisBoxHeight + 12;

      if (y > 220) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("PLAN DE ACCIÓN CLÍNICO", left, y);
      y += 2;
      doc.line(left, y, 195, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      const planItemsArr = latest.recommendedPlan.split(';').filter((p:string) => p.trim() !== '');
      planItemsArr.forEach((item: string) => {
          doc.setFillColor(secondary[0], secondary[1], secondary[2]);
          doc.circle(17, y - 1.5, 1.5, "F"); 
          const lines = doc.splitTextToSize(item.trim(), 170);
          doc.text(lines, 22, y);
          y += (lines.length * 5) + 4;

          if (y > 260) { doc.addPage(); y = 20; }
      });

      if (y > 240) { doc.addPage(); y = 20; }
      else { y = 250; } 

      doc.setDrawColor(secondary[0], secondary[1], secondary[2]);
      doc.setLineWidth(1);
      doc.line(left, y, 195, y);
      y += 5;

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("AVISO MÉDICO LEGAL:", left, y);
      
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const disclaimer = "Este documento fue generado mediante un modelo algorítmico de Inteligencia Artificial (Prevenia AI) con fines de cribado preventivo. Los datos procesados no constituyen un diagnóstico médico definitivo, receta o tratamiento. Las recomendaciones deben ser evaluadas y autorizadas por un profesional de la salud certificado. Consulte a su médico antes de realizar cambios en su dieta, medicación o actividad física.";
      const discLines = doc.splitTextToSize(disclaimer, 180);
      doc.text(discLines, left, y);

      doc.setFontSize(8);
      doc.text("Generado por: prevenia.health", 195, y + 15, { align: "right" });

      doc.save(`Reporte_Clinico_${displayName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '')}.pdf`);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Hubo un error interno al generar el PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 💾 GUARDADO DE PERFIL
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName === displayName) return;
    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: (session?.user as any).id,
          name: editName
        })
      });
      const data = await res.json();

      if (data.success) {
        toast.success("¡Perfil actualizado con éxito!");
        setDisplayName(editName); 
        await update({ name: editName }); 
        setIsEditModalOpen(false); 
      } else {
        toast.error(data.error || "Error al actualizar.");
      }
    } catch (error) {
      toast.error("Error de red.");
    } finally {
      setIsSaving(false);
    }
  };

  const latestRecord = history.length > 0 ? history[0] : null;
  
  let score = 0; let themeColor = "#6B8E7D"; let greetingText = "Tu ecosistema metabólico está en perfecta armonía.";
  if (latestRecord) {
    if (latestRecord.riskLevel === 'Moderado') { score = 65; themeColor = "#E4A853"; greetingText = "Tu ecosistema metabólico requiere un poco de balance."; } 
    else if (latestRecord.riskLevel === 'Alto') { score = 35; themeColor = "#EF4444"; greetingText = "Tu cuerpo necesita atención prioritaria y cuidado hoy."; } 
    else { score = 92; }
  }

  const dashOffset = 440 - (440 * score) / 100;
  const planItems = latestRecord?.recommendedPlan ? latestRecord.recommendedPlan.split(';').filter((p:string) => p.trim() !== '') : [];
  const toggleTask = (index: number) => { setCompletedTasks(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]); };
  const progressPercent = planItems.length > 0 ? (completedTasks.length / planItems.length) * 100 : 0;
  
  // ==============================================================
  // 🚀 LÓGICA DEL GRÁFICO INTELIGENTE (Fechas Reales y Slots Vacíos)
  // ==============================================================
  const glucoseRecords = history
    .filter(r => r.fastingGlucose)
    .slice(0, 6)
    .reverse()
    .map((r, idx, arr) => {
      // Formatear la fecha ej. "12 MAR". Si es el último registro, poner "HOY" (siempre que sea reciente)
      const isLast = idx === arr.length - 1;
      const dateStr = new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase();
      return {
        value: r.fastingGlucose,
        date: isLast ? "HOY" : dateStr,
        isReal: true
      };
    });

  // Si el paciente tiene menos de 6 registros, llenamos el resto con espacios vacíos a la izquierda
  const emptySlots = Array(Math.max(0, 6 - glucoseRecords.length)).fill({ value: null, date: "--", isReal: false });
  const chartData = [...emptySlots, ...glucoseRecords];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } } };

  if (status === "loading" || isLoadingHistory) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin mb-4" />
        <p className="font-playfair text-[#2C332B]/60 tracking-widest uppercase text-xs">Sincronizando historial...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F6F0] pt-28 pb-16 px-4 md:px-8 overflow-hidden">
      
      {/* Fondos Decorativos Premium */}
      <div className="absolute rounded-full filter blur-[120px] opacity-60 bg-[#DDE6DE] w-[40rem] h-[40rem] top-[-10%] left-[-10%] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[100px] opacity-40 bg-[#EAE2D0] w-[30rem] h-[30rem] bottom-[10%] right-[-5%] -z-10 pointer-events-none" />
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
        
        {/* HEADER LIMPIO Y ESPACIOSO */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white shadow-md border-4 border-white overflow-hidden flex-shrink-0 relative z-10">
                <img src={patientImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 bg-[#6B8E7D] rounded-full blur-md opacity-30 scale-110 -z-0"></div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-1.5 tracking-tight">
                Buenas tardes, {displayName.split(" ")[0]}.
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="font-inter font-light text-[#2C332B]/60 text-sm">
                  {latestRecord ? greetingText : "Realiza tu primera evaluación médica para comenzar."}
                </p>
                <span className="hidden sm:inline text-[#2C332B]/20">•</span>
                <button 
                  onClick={() => { setEditName(displayName); setIsEditModalOpen(true); }}
                  className="font-inter font-medium text-xs text-[#6B8E7D] hover:text-[#2C332B] transition-colors flex items-center gap-1 group"
                >
                  <User size={14} className="group-hover:scale-110 transition-transform"/> Editar Perfil
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {latestRecord && (
              <button 
                onClick={handleDownloadPDF} 
                disabled={isGeneratingPDF}
                className="w-full sm:w-auto bg-white text-[#2C332B] border border-[#2C332B]/10 px-6 py-4 rounded-full text-sm font-inter font-medium hover:border-[#6B8E7D] hover:text-[#6B8E7D] hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <><div className="w-4 h-4 border-2 border-[#6B8E7D]/30 border-t-[#6B8E7D] rounded-full animate-spin"/> Generando...</>
                ) : (
                  <><Download size={16} /> Descargar Reporte</>
                )}
              </button>
            )}

            <Link href="/diagnostic" className="w-full sm:w-auto">
              <button className="w-full bg-[#2C332B] text-white px-8 py-4 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 whitespace-nowrap flex items-center justify-center gap-2 group">
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                Nueva Evaluación
              </button>
            </Link>
          </div>
        </motion.header>

        {/* ESTADO VACÍO ELEGANTE */}
        {!latestRecord ? (
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-16 text-center border border-white shadow-sm flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-24 h-24 bg-gradient-to-br from-[#6B8E7D]/20 to-[#EAE2D0]/40 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <FileText className="w-10 h-10 text-[#6B8E7D]" />
             </div>
             <h2 className="text-3xl font-playfair text-[#2C332B] mb-4">Tu lienzo en blanco</h2>
             <p className="text-[#2C332B]/60 font-inter font-light max-w-md mx-auto mb-8 text-base leading-relaxed">
               La Inteligencia Artificial de Prevenia está lista para cruzar tus biomarcadores con literatura clínica y crear un plan metabólico único para ti.
             </p>
             <Link href="/diagnostic">
                <button className="bg-white border border-[#6B8E7D]/30 text-[#6B8E7D] px-8 py-3 rounded-full text-sm font-inter font-medium hover:bg-[#6B8E7D] hover:text-white transition-all shadow-sm flex items-center gap-2">
                  Comenzar ahora <ArrowRight size={16} />
                </button>
             </Link>
          </motion.div>
        ) : (
          
          /* 🚀 BENTO GRID ASIMÉTRICO */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. TARJETA: ÍNDICE DE BIENESTAR */}
            <motion.div variants={itemVariants} className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-white/50 relative overflow-hidden flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#E6EAE5] to-transparent rounded-bl-full opacity-60 -z-10 transition-transform duration-700 group-hover:scale-110"></div>
              
              <div className="w-full flex items-center gap-2 mb-8 justify-center lg:justify-start">
                <Activity size={16} className="text-[#2C332B]/40" />
                <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium">Índice de Bienestar</span>
              </div>

              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm">
                  <circle cx="96" cy="96" r="84" stroke="#F8F6F0" strokeWidth="14" fill="none" />
                  <motion.circle initial={{ strokeDashoffset: 528 }} animate={{ strokeDashoffset: 528 - (528 * score) / 100 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} cx="96" cy="96" r="84" stroke={themeColor} strokeWidth="14" fill="none" strokeDasharray="528" strokeLinecap="round" />
                </svg>
                <div className="flex flex-col items-center mt-2">
                  <span className="text-6xl font-playfair text-[#2C332B] tracking-tighter">{score}</span>
                  <span className="text-sm font-inter text-[#2C332B]/40 uppercase tracking-widest mt-1">Puntos</span>
                </div>
              </div>
              <p className="font-inter font-light text-[#2C332B]/70 text-sm leading-relaxed max-w-[200px]">
                Nivel de Riesgo <span style={{ color: themeColor }} className="font-medium">{latestRecord.riskLevel}</span>. 
                {latestRecord.riskLevel === 'Bajo' ? ' Vas por excelente camino.' : ' Es momento de tomar acción.'}
              </p>
            </motion.div>

            {/* 2. TARJETA: HISTORIAL DE GLUCOSA (INTELIGENTE Y DINÁMICA) */}
            <motion.div variants={itemVariants} className="lg:col-span-8 bg-[#EFECE5]/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-sm border border-white flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#2C332B]/40" />
                  <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium">Historial Glucosa (Ayunas)</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-inter bg-white px-4 py-2 rounded-full text-[#6B8E7D] shadow-sm flex items-center gap-1">
                  Últimos Tests
                </span>
              </div>
              
              <div className="flex items-end justify-between h-48 gap-3 sm:gap-6 mb-6 relative">
                {/* Líneas guía de fondo */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="w-full border-t border-[#2C332B]"></div>
                  <div className="w-full border-t border-[#2C332B]"></div>
                  <div className="w-full border-t border-[#2C332B]"></div>
                </div>

                {chartData.map((data, i) => {
                  const hasData = data.isReal;
                  // Si no hay dato, mostramos una pequeña base de 5% de altura
                  const heightPercent = hasData ? Math.min((data.value / 200) * 100, 100) : 5; 
                  
                  return (
                    <div key={i} className="w-full flex flex-col items-center gap-3 group relative z-10 h-full justify-end">
                      {hasData && (
                        <div className="absolute -top-12 bg-[#2C332B] text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all shadow-lg pointer-events-none flex flex-col items-center font-inter font-medium z-20">
                          <span className="whitespace-nowrap">{data.value} <span className="text-[9px] font-light text-white/60">mg/dL</span></span>
                        </div>
                      )}
                      
                      {/* Las barras que sí tienen datos tienen color, las demás son semi-transparentes */}
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${heightPercent}%` }} 
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }} 
                        className={`w-full max-w-[3rem] rounded-t-2xl transition-all duration-300 ${
                          !hasData ? 'bg-white/40 border border-dashed border-[#2C332B]/10' :
                          data.value > 110 ? 'bg-[#E4A853] shadow-sm' : 'bg-[#6B8E7D] shadow-sm'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between text-[10px] sm:text-[11px] font-inter text-[#2C332B]/40 uppercase tracking-widest px-1 sm:px-6">
                {chartData.map((data, i) => (
                  <span key={i} className={`w-full text-center ${data.isReal && i === chartData.length - 1 ? 'font-medium text-[#6B8E7D]' : ''}`}>
                    {data.date}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 3. TARJETA: ANÁLISIS DE LA IA (Formato Lectura / Split Layout) */}
            <motion.div variants={itemVariants} className="lg:col-span-12 bg-white rounded-[3rem] p-10 shadow-sm border border-white/50 relative overflow-hidden hover:shadow-lg transition-shadow duration-500">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-[#F8F6F0]/50 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row gap-8 lg:gap-16 relative z-10">
                <div className="md:w-1/3 flex flex-col">
                  <div className="w-14 h-14 bg-[#6B8E7D]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#6B8E7D]/20">
                    <BrainCircuit className="text-[#6B8E7D] w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-playfair text-[#2C332B] mb-3 leading-tight">Observación <br/>Clínica IA</h3>
                  <p className="text-sm font-inter text-[#2C332B]/50 leading-relaxed">
                    Prevenia ha procesado tus biomarcadores y los ha cruzado con literatura oficial para brindarte este resumen.
                  </p>
                </div>
                
                <div className="md:w-2/3 md:border-l border-[#2C332B]/10 md:pl-10 flex items-center">
                  <p className="font-inter font-light text-[#2C332B]/80 text-sm md:text-base leading-loose">
                    {latestRecord.aiAnalysis}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 4. TARJETA: PLAN DIARIO */}
            {planItems.length > 0 && (
              <motion.div variants={itemVariants} className="lg:col-span-12 bg-gradient-to-br from-[#E6ECE9] to-[#EFECE5] rounded-[3rem] p-10 md:p-12 shadow-sm border border-white mt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-[#6B8E7D] border border-white/50">
                      <CalendarCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-playfair text-[#2C332B] mb-1">Tu Plan de Acción</h3>
                      <p className="text-sm font-inter text-[#2C332B]/60">Sugerencias estructuradas para mejorar tu bienestar hoy.</p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-72 bg-white/50 p-4 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
                    <div className="flex justify-between text-xs font-inter font-medium text-[#2C332B]/70 mb-3">
                      <span>Progreso</span>
                      <span className="text-[#6B8E7D]">{completedTasks.length} de {planItems.length} completadas</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#2C332B]/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-[#6B8E7D] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {planItems.map((task: string, index: number) => {
                    const isChecked = completedTasks.includes(index);
                    return (
                      <div 
                        key={index} 
                        onClick={() => toggleTask(index)} 
                        className={`group bg-white p-6 rounded-[2rem] flex items-start gap-4 cursor-pointer transition-all duration-300 border shadow-sm hover:shadow-md hover:-translate-y-1 ${isChecked ? 'border-[#6B8E7D]/40 shadow-inner bg-[#F8F6F0]/50' : 'border-white hover:border-[#6B8E7D]/20'}`}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isChecked ? 'bg-[#6B8E7D] border-[#6B8E7D]' : 'border-[#2C332B]/20 bg-white group-hover:border-[#6B8E7D]/50'}`}>
                          {isChecked ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-transparent" />}
                        </div>
                        <p className={`font-inter font-light text-sm pt-0.5 leading-relaxed transition-all duration-300 ${isChecked ? 'text-[#2C332B]/40 line-through' : 'text-[#2C332B]/80'}`}>
                          {task}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* MODAL DE EDICIÓN DE PERFIL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C332B]/60 backdrop-blur-md px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative border border-white/20"
            >
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-[#2C332B]/40 hover:text-[#2C332B] bg-[#F8F6F0] rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-[#6B8E7D]/10 rounded-2xl flex items-center justify-center mb-6">
                <User className="text-[#6B8E7D] w-8 h-8" />
              </div>
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-2 tracking-tight">Tus Datos</h2>
              <p className="text-sm font-inter text-[#2C332B]/50 mb-8">Actualiza tu nombre de visualización en la plataforma.</p>
              
              <form className="space-y-6" onSubmit={handleSaveProfile}>          
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#2C332B]/50 mb-2 ml-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-2 focus:ring-[#6B8E7D]/30 outline-none transition text-sm font-inter text-[#2C332B]" 
                  />
                </div>
                
                <div className="opacity-70">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#2C332B]/50 mb-2 ml-2">Correo (No editable)</label>
                  <input type="email" defaultValue={patientEmail} disabled className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter text-[#2C332B]/60" />
                </div>

                <div className="grid grid-cols-2 gap-4 opacity-60">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#2C332B]/50 mb-2 ml-2">Edad</label>
                    <input type="number" disabled value={latestRecord?.age || ""} className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter text-[#2C332B]" title="Realiza un nuevo test para actualizar" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#2C332B]/50 mb-2 ml-2">Peso (kg)</label>
                    <input type="number" disabled value={latestRecord?.weight || ""} className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter text-[#2C332B]" title="Realiza un nuevo test para actualizar" />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSaving || !editName.trim() || editName === displayName}
                    className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isSaving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Guardando...</> : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}