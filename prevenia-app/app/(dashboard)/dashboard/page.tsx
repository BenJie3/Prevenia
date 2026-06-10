"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react"; // <- 1. Importamos el gancho de la sesión

export default function PatientDashboard() {
  // 2. Extraemos los datos de la sesión actual
  const { data: session, status } = useSession();
  
  // 3. Usamos los datos reales, o un texto de carga si aún está procesando
  const patientName = session?.user?.name || "Cargando...";
  const patientEmail = session?.user?.email || "";
  const patientImage = session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150";

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F6F0] pt-24 pb-12 px-4 md:px-8 overflow-hidden">
      <div className="absolute rounded-full filter blur-[120px] opacity-60 bg-[#DDE6DE] w-[40rem] h-[40rem] top-[-10%] left-[-10%] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[100px] opacity-40 bg-[#EAE2D0] w-[30rem] h-[30rem] bottom-[10%] right-[-5%] -z-10 pointer-events-none" />
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
        
        {/* CABECERA TOP */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            {/* Avatar real de Google */}
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-white overflow-hidden flex-shrink-0">
              <img src={patientImage} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-playfair text-[#2C332B] mb-1 tracking-tight">
                Buenas tardes, {patientName}.
              </h1>
              <div className="flex items-center gap-3">
                <p className="font-inter font-light text-[#2C332B]/60">
                  Tu ecosistema metabólico está estable hoy.
                </p>
                <span className="text-[#2C332B]/20">•</span>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="font-inter font-medium text-xs text-[#6B8E7D] hover:text-[#2C332B] transition-colors underline decoration-[#6B8E7D]/30 underline-offset-4"
                >
                  Editar mis datos
                </button>
              </div>
            </div>
          </div>
          
          <Link href="/diagnostic">
            <button className="bg-[#2C332B] text-white px-8 py-4 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 whitespace-nowrap flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nueva Evaluación IA
            </button>
          </Link>
        </motion.header>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. SCORE DE SALUD */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6EAE5] rounded-bl-full opacity-50 -z-10"></div>
            <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium mb-6 w-full text-left">Índice de Bienestar</span>
            
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#F8F6F0" strokeWidth="12" fill="none" />
                <motion.circle 
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 110 }} 
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  cx="80" cy="80" r="70" stroke="#6B8E7D" strokeWidth="12" fill="none" strokeDasharray="440" strokeLinecap="round" 
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-playfair text-[#2C332B]">75</span>
                <span className="text-xs font-inter text-[#2C332B]/50">/100</span>
              </div>
            </div>
            <p className="font-inter font-light text-[#2C332B]/70 text-sm">Riesgo <span className="text-[#E4A853] font-medium">Moderado</span>. Vas por excelente camino.</p>
          </motion.div>

          {/* 2. TENDENCIA DE GLUCOSA */}
          <motion.div variants={itemVariants} className="bg-[#EFECE5] rounded-[2.5rem] p-8 shadow-sm border border-white flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium">Historial Glucosa</span>
              <span className="text-xs font-inter bg-white px-3 py-1 rounded-full text-[#6B8E7D] shadow-sm flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Estable
              </span>
            </div>
            <div className="flex items-end justify-between h-32 gap-2 mb-4">
              {[60, 80, 75, 90, 85, 100].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${i === 5 ? 'bg-[#6B8E7D] group-hover:bg-[#2C332B]' : 'bg-[#6B8E7D]/20 group-hover:bg-[#6B8E7D]/40'}`}
                  ></motion.div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-inter text-[#2C332B]/40 uppercase tracking-wider">
              <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Hoy</span>
            </div>
          </motion.div>

          {/* 3. INSIGHTS DE IA */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white relative">
            <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-inter font-medium mb-6 block">Análisis Clínico IA</span>
            <div className="relative mt-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6B8E7D]/20 to-[#EAE2D0]/40 blur-xl animate-pulse rounded-full"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-[#6B8E7D]/10 p-6 rounded-3xl z-10">
                <div className="flex items-center gap-2 mb-3 text-[#6B8E7D]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <span className="font-playfair text-lg text-[#2C332B]">Observación</span>
                </div>
                <p className="font-inter font-light text-[#2C332B]/80 text-sm leading-relaxed">
                  Tus picos de glucosa son más altos los jueves. La IA sugiere que revisemos si estás cenando carbohidratos refinados muy tarde la noche anterior.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 4. PLAN DE ACCIÓN */}
          <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#E6ECE9] rounded-[2.5rem] p-8 shadow-sm border border-white mt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-full shadow-sm text-[#6B8E7D]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-playfair text-[#2C332B]">Tu Plan Diario</h3>
                  <p className="text-sm font-inter text-[#2C332B]/60">Sugerencias personalizadas para hoy</p>
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-xs font-inter text-[#2C332B]/60 mb-2">
                  <span>Progreso de hoy</span>
                  <span>1 de 3 completadas</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "33%" }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-[#6B8E7D] rounded-full"></motion.div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="bg-white/70 hover:bg-white p-5 rounded-3xl flex items-start gap-4 cursor-pointer transition-all border border-transparent hover:border-[#6B8E7D]/20 shadow-sm hover:shadow-md">
                <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 accent-[#6B8E7D] rounded-full border-gray-300 cursor-pointer" />
                <p className="font-inter font-light text-[#2C332B]/80 text-sm line-through opacity-60">Beber vaso de agua en ayunas (Hecho).</p>
              </label>
              <label className="bg-white/70 hover:bg-white p-5 rounded-3xl flex items-start gap-4 cursor-pointer transition-all border border-transparent hover:border-[#6B8E7D]/20 shadow-sm hover:shadow-md">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-[#6B8E7D] rounded-full border-gray-300 cursor-pointer" />
                <p className="font-inter font-light text-[#2C332B]/80 text-sm">Caminar 30 minutos continuos al atardecer.</p>
              </label>
              <label className="bg-white/70 hover:bg-white p-5 rounded-3xl flex items-start gap-4 cursor-pointer transition-all border border-transparent hover:border-[#6B8E7D]/20 shadow-sm hover:shadow-md">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-[#6B8E7D] rounded-full border-gray-300 cursor-pointer" />
                <p className="font-inter font-light text-[#2C332B]/80 text-sm">Cenar ensalada verde 2 horas antes de dormir.</p>
              </label>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* MODAL DE EDICIÓN DE PERFIL */}
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
                className="absolute top-6 right-6 text-[#2C332B]/40 hover:text-[#2C332B] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-8 tracking-tight">Tus Datos</h2>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }}>          
                {/* CAMPO DE CORREO DESHABILITADO */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Nombre Completo</label>
                  <input type="text" defaultValue={session?.user?.name || ""} className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" />
                </div>
                
                {/* CAMPO DE CORREO DESHABILITADO REAL */}
                <div className="opacity-70">
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Correo Electrónico (No editable)</label>
                  <input type="email" defaultValue={patientEmail} disabled className="w-full p-4 bg-[#EFECE5] border-none rounded-2xl cursor-not-allowed outline-none text-sm font-inter font-light text-[#2C332B]/60" />
                </div>

                {/* NUEVO CAMPO: CONTRASEÑA */}
                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    placeholder="Dejar en blanco para no cambiar" 
                    className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B] placeholder:text-[#2C332B]/30" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Edad</label>
                    <input type="number" defaultValue="35" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Peso (kg)</label>
                    <input type="number" defaultValue="75" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter font-light text-[#2C332B]" />
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