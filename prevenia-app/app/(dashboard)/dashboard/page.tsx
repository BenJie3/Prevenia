"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  
  const patientName = session?.user?.name || "Cargando...";
  const patientEmail = session?.user?.email || "";
  const patientImage = session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150";

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // ESTADOS DEL BACKEND
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // ESTADOS INTERACTIVOS DEL PLAN DE ACCIÓN
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  // OBTENER DATOS DE LA BASE DE DATOS
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/diagnostic?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setHistory(data.history);
          setIsLoadingHistory(false);
        })
        .catch((err) => {
          console.error("Error fetching history:", err);
          setIsLoadingHistory(false);
        });
    }
  }, [session]);

  // VARIABLES DINÁMICAS BASADAS EN EL HISTORIAL
  const latestRecord = history.length > 0 ? history[0] : null;
  
  // 1. Lógica del Círculo Animado (Score de Salud)
  let score = 0;
  let themeColor = "#6B8E7D"; // Verde por defecto (Bajo)
  let greetingText = "Tu ecosistema metabólico está en perfecta armonía.";
  
  if (latestRecord) {
    if (latestRecord.riskLevel === 'Moderado') {
      score = 65;
      themeColor = "#E4A853"; // Amarillo/Dorado
      greetingText = "Tu ecosistema metabólico requiere un poco de balance.";
    } else if (latestRecord.riskLevel === 'Alto') {
      score = 35;
      themeColor = "#EF4444"; // Rojo
      greetingText = "Tu cuerpo necesita atención prioritaria y cuidado hoy.";
    } else {
      score = 92; // Riesgo Bajo
    }
  }

  const dashOffset = 440 - (440 * score) / 100;

  // 2. Lógica del Plan de Acción
  const planItems = latestRecord?.recommendedPlan 
    ? latestRecord.recommendedPlan.split(';').filter((p:string) => p.trim() !== '') 
    : [];
    
  const toggleTask = (index: number) => {
    setCompletedTasks(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  const progressPercent = planItems.length > 0 ? (completedTasks.length / planItems.length) * 100 : 0;

  // 3. Lógica del Gráfico de Glucosa (Últimas 6 mediciones)
  const glucoseHistory = history
    .filter(r => r.fastingGlucose)
    .slice(0, 6)
    .map(r => r.fastingGlucose)
    .reverse(); // De más antiguo a más reciente
  
  // Si no hay 6 mediciones, rellenamos con ceros para la gráfica
  const chartData = [...glucoseHistory, ...Array(6 - glucoseHistory.length).fill(0)].slice(0, 6);

  // ANIMACIONES
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
      {/* FONDOS AMBIENTALES */}
      <div className="absolute rounded-full filter blur-[120px] opacity-60 bg-[#DDE6DE] w-[40rem] h-[40rem] top-[-10%] left-[-10%] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[100px] opacity-40 bg-[#EAE2D0] w-[30rem] h-[30rem] bottom-[10%] right-[-5%] -z-10 pointer-events-none" />
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
        
        {/* CABECERA TOP */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden flex-shrink-0">
              <img src={patientImage} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-1 tracking-tight">
                Buenas tardes, {patientName.split(" ")[0]}.
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="font-inter font-light text-[#2C332B]/60 text-sm">
                  {latestRecord ? greetingText : "Realiza tu primera evaluación médica para comenzar."}
                </p>
                <span className="hidden sm:inline text-[#2C332B]/20">•</span>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="font-inter font-medium text-xs text-[#6B8E7D] hover:text-[#2C332B] transition-colors underline decoration-[#6B8E7D]/30 underline-offset-4 self-start"
                >
                  Editar mis datos
                </button>
              </div>
            </div>
          </div>
          
          <Link href="/diagnostic">
            <button className="bg-[#2C332B] text-white px-8 py-3.5 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-all shadow-md hover:shadow-xl hover:-translate-y-1 whitespace-nowrap flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nueva Evaluación IA
            </button>
          </Link>
        </motion.header>

        {/* SI NO HAY DATOS, MOSTRAMOS UN ESTADO VACÍO ELEGANTE */}
        {!latestRecord ? (
          <motion.div variants={itemVariants} className="bg-white/50 backdrop-blur-md rounded-[3rem] p-12 text-center border border-white shadow-sm flex flex-col items-center justify-center min-h-[40vh]">
             <div className="w-20 h-20 bg-[#6B8E7D]/10 rounded-full flex items-center justify-center mb-6 text-[#6B8E7D]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">Tu lienzo en blanco</h2>
             <p className="text-[#2C332B]/60 font-inter font-light max-w-md mx-auto mb-8">La Inteligencia Artificial está lista para analizar tus biomarcadores y crear un plan metabólico único para ti.</p>
          </motion.div>
        ) : (
          
          /* GRID PRINCIPAL DE DATOS REALES */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. SCORE DE SALUD ANIMADO */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white relative overflow-hidden flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6EAE5] rounded-bl-full opacity-50 -z-10"></div>
              <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium mb-6 w-full text-left">Índice de Bienestar</span>
              
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#F8F6F0" strokeWidth="12" fill="none" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: dashOffset }} 
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    cx="80" cy="80" r="70" stroke={themeColor} strokeWidth="12" fill="none" strokeDasharray="440" strokeLinecap="round" 
                  />
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

            {/* 2. TENDENCIA DE GLUCOSA REAL */}
            <motion.div variants={itemVariants} className="bg-[#EFECE5] rounded-[2.5rem] p-8 shadow-sm border border-white flex flex-col justify-between hover:shadow-md transition-shadow duration-500">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium">Historial Glucosa</span>
                <span className="text-[10px] uppercase tracking-widest font-inter bg-white px-3 py-1.5 rounded-full text-[#6B8E7D] shadow-sm flex items-center gap-1">
                  Últimos tests
                </span>
              </div>
              <div className="flex items-end justify-between h-32 gap-2 mb-4">
                {chartData.map((glucoseValue, i) => {
                  // Calculamos la altura de la barra (máximo 200mg/dL = 100%)
                  const heightPercent = glucoseValue > 0 ? Math.min((glucoseValue / 200) * 100, 100) : 5; 
                  return (
                    <div key={i} className="w-full flex flex-col items-center gap-2 group relative">
                      {/* Tooltip flotante al pasar el mouse */}
                      {glucoseValue > 0 && (
                        <div className="absolute -top-8 bg-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">
                          {glucoseValue}
                        </div>
                      )}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${glucoseValue > 110 ? 'bg-[#E4A853]' : glucoseValue > 0 ? 'bg-[#6B8E7D]' : 'bg-[#6B8E7D]/10'}`}
                      ></motion.div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-inter text-[#2C332B]/40 uppercase tracking-wider">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>Hoy</span>
              </div>
            </motion.div>

            {/* 3. INSIGHTS DE IA REALES */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white relative hover:shadow-md transition-shadow duration-500">
              <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium mb-6 block">Análisis Clínico IA</span>
              <div className="relative mt-4 h-full flex items-center">
                {/* Glow de fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6B8E7D]/20 to-[#EAE2D0]/40 blur-xl animate-pulse rounded-full"></div>
                
                <div className="relative bg-white/80 backdrop-blur-sm border border-[#6B8E7D]/10 p-6 rounded-3xl z-10 w-full">
                  <div className="flex items-center gap-2 mb-3 text-[#6B8E7D]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <span className="font-playfair text-lg text-[#2C332B]">Observación</span>
                  </div>
                  <p className="font-inter font-light text-[#2C332B]/80 text-sm leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                    {latestRecord.aiAnalysis}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 4. PLAN DE ACCIÓN INTERACTIVO */}
            {planItems.length > 0 && (
              <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#E6ECE9] rounded-[2.5rem] p-8 shadow-sm border border-white mt-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-full shadow-sm text-[#6B8E7D]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-playfair text-[#2C332B]">Tu Plan Diario</h3>
                      <p className="text-sm font-inter text-[#2C332B]/60">Sugerencias médicas de la IA para hoy</p>
                    </div>
                  </div>
                  
                  {/* BARRA DE PROGRESO FUNCIONAL */}
                  <div className="w-full md:w-64">
                    <div className="flex justify-between text-xs font-inter text-[#2C332B]/60 mb-2">
                      <span>Progreso de hoy</span>
                      <span>{completedTasks.length} de {planItems.length} completadas</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progressPercent}%` }} 
                        transition={{ duration: 0.5 }} 
                        className="h-full bg-[#6B8E7D] rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* CHECKBOXES REALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {planItems.map((task: string, index: number) => {
                    const isChecked = completedTasks.includes(index);
                    return (
                      <div 
                        key={index}
                        onClick={() => toggleTask(index)}
                        className={`bg-white/70 hover:bg-white p-5 rounded-3xl flex items-start gap-4 cursor-pointer transition-all border shadow-sm hover:shadow-md ${isChecked ? 'border-[#6B8E7D]/40' : 'border-transparent hover:border-[#6B8E7D]/20'}`}
                      >
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-[#6B8E7D] border-[#6B8E7D]' : 'border-[#2C332B]/20 bg-white'}`}>
                          {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p className={`font-inter font-light text-sm pt-0.5 transition-all ${isChecked ? 'text-[#2C332B]/40 line-through' : 'text-[#2C332B]/80'}`}>
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

      {/* MODAL DE EDICIÓN DE PERFIL COMPLETO (RESTAURADO) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C332B]/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2.5rem] shadow-xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 text-[#2C332B]/40 hover:text-[#2C332B] transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-8 tracking-tight">Tus Datos</h2>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }}>          
                {/* CAMPO DE NOMBRE */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Nombre Completo</label>
                  <input type="text" defaultValue={session?.user?.name || ""} className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" />
                </div>
                
                {/* CAMPO DE CORREO DESHABILITADO */}
                <div className="opacity-70">
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Correo Electrónico (No editable)</label>
                  <input type="email" defaultValue={patientEmail} disabled className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter font-light text-[#2C332B]/60" />
                </div>

                {/* CAMPO DE CONTRASEÑA */}
                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    placeholder="Dejar en blanco para no cambiar" 
                    className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B] placeholder:text-[#2C332B]/30" 
                  />
                </div>

                {/* EDAD Y PESO */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Edad</label>
                    <input type="number" defaultValue={latestRecord?.age || ""} placeholder="Ej. 35" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Peso (kg)</label>
                    <input type="number" defaultValue={latestRecord?.weight || ""} placeholder="Ej. 75" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition mt-4 tracking-wide shadow-md">
                  Guardar Cambios
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}