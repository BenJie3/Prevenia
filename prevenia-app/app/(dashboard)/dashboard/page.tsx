"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf"; 

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
    if (session?.user?.id && !hasInitialized) {
      setDisplayName(session.user.name || "Paciente");
      setEditName(session.user.name || ""); 
      
      fetch(`/api/diagnostic?userId=${session.user.id}`)
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
      
      // Paleta de Colores de Prevenia
      const primary = [44, 51, 43]; // #2C332B
      const secondary = [107, 142, 125]; // #6B8E7D
      const lightGray = [248, 246, 240]; 
      const darkGray = [80, 80, 80];
      
      const left = 15; // Margen izquierdo
      
      // 1. HEADER (Franja Superior Oficial)
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

      let y = 48; // Puntero vertical

      // 2. DATOS DEL PACIENTE E IMC
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

      // Calculamos el IMC médicamente (Peso / Altura en metros al cuadrado)
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

      // 3. INSIGNIA DE RIESGO (BADGE CLÍNICO)
      let riskColor = [22, 163, 74]; // Verde
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

      // 4. BIOMARCADORES DETALLADOS
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

      // 5. ANÁLISIS DE INTELIGENCIA ARTIFICIAL
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

      // Caja gris de fondo para el texto de la IA
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(left, y, 180, analysisBoxHeight, "F");
      doc.text(analysisLines, 20, y + 8);
      
      y += analysisBoxHeight + 12;

      // Evaluamos si necesitamos brincar de hoja para que no se corte
      if (y > 220) { doc.addPage(); y = 20; }

      // 6. PLAN DE ACCIÓN SUGERIDO
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
          doc.circle(17, y - 1.5, 1.5, "F"); // Viñeta de circulito
          const lines = doc.splitTextToSize(item.trim(), 170);
          doc.text(lines, 22, y);
          y += (lines.length * 5) + 4;

          if (y > 260) { doc.addPage(); y = 20; }
      });

      // 7. AVISO MÉDICO LEGAL (Forzado al fondo de la hoja actual o de una nueva)
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

      // GUARDAR Y DESCARGAR
      doc.save(`Reporte_Clinico_${displayName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '')}.pdf`);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error interno al generar el PDF.");
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
        setSaveMessage("¡Perfil actualizado con éxito!");
        setDisplayName(editName); 
        await update({ name: editName }); 

        setTimeout(() => {
          setIsEditModalOpen(false); 
          setSaveMessage("");
        }, 1500);
      } else {
        setSaveMessage(data.error || "Error al actualizar.");
      }
    } catch (error) {
      setSaveMessage("Error de red.");
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
  const glucoseHistory = history.filter(r => r.fastingGlucose).slice(0, 6).map(r => r.fastingGlucose).reverse(); 
  const chartData = [...glucoseHistory, ...Array(6 - glucoseHistory.length).fill(0)].slice(0, 6);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  if (status === "loading" || isLoadingHistory) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin mb-4" />
        <p className="font-playfair text-[#2C332B]/60 tracking-widest uppercase text-xs">Sincronizando historial...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F6F0] pt-28 pb-12 px-4 md:px-8 overflow-hidden">
      
      <div className="absolute rounded-full filter blur-[120px] opacity-60 bg-[#DDE6DE] w-[40rem] h-[40rem] top-[-10%] left-[-10%] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[100px] opacity-40 bg-[#EAE2D0] w-[30rem] h-[30rem] bottom-[10%] right-[-5%] -z-10 pointer-events-none" />
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
        
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden flex-shrink-0">
              <img src={patientImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-1 tracking-tight">
                Buenas tardes, {displayName.split(" ")[0]}.
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="font-inter font-light text-[#2C332B]/60 text-sm">
                  {latestRecord ? greetingText : "Realiza tu primera evaluación médica para comenzar."}
                </p>
                <span className="hidden sm:inline text-[#2C332B]/20">•</span>
                <button 
                  onClick={() => { setEditName(displayName); setIsEditModalOpen(true); }}
                  className="font-inter font-medium text-xs text-[#6B8E7D] hover:text-[#2C332B] transition-colors underline decoration-[#6B8E7D]/30 underline-offset-4 self-start"
                >
                  Editar mis datos
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {latestRecord && (
              <button 
                onClick={handleDownloadPDF} 
                disabled={isGeneratingPDF}
                className="bg-white text-[#2C332B] border border-[#2C332B]/10 px-6 py-3.5 rounded-full text-sm font-inter font-medium hover:border-[#6B8E7D] hover:text-[#6B8E7D] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <><div className="w-4 h-4 border-2 border-[#6B8E7D]/30 border-t-[#6B8E7D] rounded-full animate-spin"/> Generando...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Descargar Reporte</>
                )}
              </button>
            )}

            <Link href="/diagnostic">
              <button className="bg-[#2C332B] text-white px-8 py-3.5 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-all shadow-md hover:shadow-xl hover:-translate-y-1 whitespace-nowrap flex items-center gap-2 w-full sm:w-auto justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva Evaluación
              </button>
            </Link>
          </div>
        </motion.header>

        {!latestRecord ? (
          <motion.div variants={itemVariants} className="bg-white/50 backdrop-blur-md rounded-[3rem] p-12 text-center border border-white shadow-sm flex flex-col items-center justify-center min-h-[40vh]">
             <div className="w-20 h-20 bg-[#6B8E7D]/10 rounded-full flex items-center justify-center mb-6 text-[#6B8E7D]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">Tu lienzo en blanco</h2>
             <p className="text-[#2C332B]/60 font-inter font-light max-w-md mx-auto mb-8">La Inteligencia Artificial está lista para analizar tus biomarcadores y crear un plan metabólico único para ti.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white relative overflow-hidden flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6EAE5] rounded-bl-full opacity-50 -z-10"></div>
              <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium mb-6 w-full text-left">Índice de Bienestar</span>
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#F8F6F0" strokeWidth="12" fill="none" />
                  <motion.circle initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }} cx="80" cy="80" r="70" stroke={themeColor} strokeWidth="12" fill="none" strokeDasharray="440" strokeLinecap="round" />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-playfair text-[#2C332B]">{score}</span>
                  <span className="text-xs font-inter text-[#2C332B]/50">/100</span>
                </div>
              </div>
              <p className="font-inter font-light text-[#2C332B]/70 text-sm">
                Riesgo <span style={{ color: themeColor }} className="font-medium">{latestRecord.riskLevel}</span>. 
                {latestRecord.riskLevel === 'Bajo' ? ' Vas por excelente camino.' : ' Es momento de tomar acción.'}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#EFECE5] rounded-[2.5rem] p-8 shadow-sm border border-white flex flex-col justify-between hover:shadow-md transition-shadow duration-500">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium">Historial Glucosa</span>
                <span className="text-[10px] uppercase tracking-widest font-inter bg-white px-3 py-1.5 rounded-full text-[#6B8E7D] shadow-sm flex items-center gap-1">Últimos tests</span>
              </div>
              <div className="flex items-end justify-between h-32 gap-2 mb-4">
                {chartData.map((glucoseValue, i) => {
                  const heightPercent = glucoseValue > 0 ? Math.min((glucoseValue / 200) * 100, 100) : 5; 
                  return (
                    <div key={i} className="w-full flex flex-col items-center gap-2 group relative">
                      {glucoseValue > 0 && <div className="absolute -top-8 bg-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">{glucoseValue}</div>}
                      <motion.div initial={{ height: 0 }} animate={{ height: `${heightPercent}%` }} transition={{ duration: 1, delay: 0.2 + (i * 0.1) }} className={`w-full rounded-t-lg transition-all duration-300 ${glucoseValue > 110 ? 'bg-[#E4A853]' : glucoseValue > 0 ? 'bg-[#6B8E7D]' : 'bg-[#6B8E7D]/10'}`}></motion.div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-inter text-[#2C332B]/40 uppercase tracking-wider">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>Hoy</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white relative hover:shadow-md transition-shadow duration-500">
              <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium mb-6 block">Análisis Clínico IA</span>
              <div className="relative mt-4 h-full flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6B8E7D]/20 to-[#EAE2D0]/40 blur-xl animate-pulse rounded-full"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-[#6B8E7D]/10 p-6 rounded-3xl z-10 w-full">
                  <div className="flex items-center gap-2 mb-3 text-[#6B8E7D]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <span className="font-playfair text-lg text-[#2C332B]">Observación</span>
                  </div>
                  <p className="font-inter font-light text-[#2C332B]/80 text-sm leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">{latestRecord.aiAnalysis}</p>
                </div>
              </div>
            </motion.div>

            {planItems.length > 0 && (
              <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#E6ECE9] rounded-[2.5rem] p-8 shadow-sm border border-white mt-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-full shadow-sm text-[#6B8E7D]"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg></div>
                    <div>
                      <h3 className="text-2xl font-playfair text-[#2C332B]">Tu Plan Diario</h3>
                      <p className="text-sm font-inter text-[#2C332B]/60">Sugerencias médicas de la IA para hoy</p>
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <div className="flex justify-between text-xs font-inter text-[#2C332B]/60 mb-2">
                      <span>Progreso de hoy</span><span>{completedTasks.length} de {planItems.length} completadas</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} className="h-full bg-[#6B8E7D] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {planItems.map((task: string, index: number) => {
                    const isChecked = completedTasks.includes(index);
                    return (
                      <div key={index} onClick={() => toggleTask(index)} className={`bg-white/70 hover:bg-white p-5 rounded-3xl flex items-start gap-4 cursor-pointer transition-all border shadow-sm hover:shadow-md ${isChecked ? 'border-[#6B8E7D]/40' : 'border-transparent hover:border-[#6B8E7D]/20'}`}>
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-[#6B8E7D] border-[#6B8E7D]' : 'border-[#2C332B]/20 bg-white'}`}>
                          {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p className={`font-inter font-light text-sm pt-0.5 transition-all ${isChecked ? 'text-[#2C332B]/40 line-through' : 'text-[#2C332B]/80'}`}>{task}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* MODAL DE EDICIÓN DE PERFIL COMPLETO */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C332B]/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2.5rem] shadow-xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-[#2C332B]/40 hover:text-[#2C332B] transition-colors p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-8 tracking-tight">Tus Datos</h2>
              
              <form className="space-y-5" onSubmit={handleSaveProfile}>          
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" 
                  />
                </div>
                
                <div className="opacity-70">
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Correo Electrónico (No editable)</label>
                  <input type="email" defaultValue={patientEmail} disabled className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter font-light text-[#2C332B]/60" />
                </div>

                <div className="grid grid-cols-2 gap-4 opacity-60">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Edad</label>
                    <input type="number" disabled value={latestRecord?.age || ""} className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter font-light text-[#2C332B]" title="Realiza un nuevo test para actualizar" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Peso (kg)</label>
                    <input type="number" disabled value={latestRecord?.weight || ""} className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter font-light text-[#2C332B]" title="Realiza un nuevo test para actualizar" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button 
                    type="submit" 
                    disabled={isSaving || !editName.trim() || editName === displayName}
                    className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isSaving ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/> Guardando...</> : "Guardar Cambios"}
                  </button>
                  
                  <AnimatePresence>
                    {saveMessage && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`text-center text-sm font-inter mt-2 ${saveMessage.includes("éxito") ? "text-green-600" : "text-red-500"}`}>
                        {saveMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}