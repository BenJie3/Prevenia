"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Diagnostic() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Función para simular el tiempo de análisis de la IA
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulamos un retraso de 3 segundos mientras la IA "piensa"
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(3);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 overflow-hidden">
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#DDE6DE] w-[30rem] h-[30rem] top-[10%] left-1/2 -translate-x-1/2 -z-10 pointer-events-none" />

      {/* Pantalla de Carga Simulada */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F6F0]/90 backdrop-blur-md"
        >
          <div className="w-16 h-16 border-4 border-[#6B8E7D] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="font-playfair text-2xl text-[#2C332B] mb-2">Prevenia está analizando tus datos</h3>
          <p className="font-inter font-light text-[#2C332B]/60 text-sm">Consultando base de conocimiento médico...</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full ${step === 3 ? "max-w-4xl" : "max-w-2xl"} bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-sm border border-white relative z-10 transition-all duration-500`}
      >
        
        {/* Cabecera (Oculta en el paso 3 de resultados) */}
        {step !== 3 && (
          <>
            <div className="flex justify-between items-center mb-10 text-sm">
              <span className="font-playfair italic text-[#6B8E7D] text-lg">Paso 0{step}</span>
              <Link href="/">
                <button className="text-[#2C332B]/50 hover:text-[#2C332B] transition uppercase tracking-widest text-xs">Cancelar</button>
              </Link>
            </div>
            <h2 className="text-3xl md:text-4xl font-playfair mb-10 text-[#2C332B] text-center tracking-tight">
              {step === 1 ? "Conozcamos tu cuerpo" : "Tus biomarcadores"}
            </h2>
          </>
        )}

        {/* PASO 1: Datos Básicos */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-3 ml-2">Edad</label>
                <input type="number" placeholder="Ej. 35" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-lg font-inter font-light placeholder:text-[#2C332B]/30" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-3 ml-2">Peso (kg)</label>
                <input type="number" placeholder="Ej. 75" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-lg font-inter font-light placeholder:text-[#2C332B]/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-3 ml-2">Historial Familiar de Diabetes</label>
              <div className="flex gap-4">
                <button className="flex-1 py-4 border border-[#2C332B]/10 rounded-2xl hover:border-[#6B8E7D] hover:text-[#6B8E7D] transition font-inter font-light focus:bg-[#E6EAE5]">Sí, existe</button>
                <button className="flex-1 py-4 border border-[#2C332B]/10 rounded-2xl hover:border-[#6B8E7D] hover:text-[#6B8E7D] transition font-inter font-light focus:bg-[#E6EAE5]">No que yo sepa</button>
              </div>
            </div>

            <div className="pt-8">
              <button onClick={() => setStep(2)} className="w-full bg-[#2C332B] text-white px-8 py-4 rounded-full font-inter font-light hover:bg-[#6B8E7D] transition text-lg tracking-wide shadow-md">Continuar</button>
            </div>
          </motion.div>
        )}

        {/* PASO 2: Biomarcadores */}
        {step === 2 && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-3 ml-2 flex items-center gap-2">
                  Glucosa en Ayunas <span className="text-[10px] bg-[#EAE2D0] px-2 py-0.5 rounded-full text-[#2C332B]/70 lowercase tracking-normal">mg/dL</span>
                </label>
                <input type="number" placeholder="Ej. 95" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-lg font-inter font-light placeholder:text-[#2C332B]/30" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-3 ml-2 flex items-center gap-2">
                  Presión Sistólica <span className="text-[10px] bg-[#EAE2D0] px-2 py-0.5 rounded-full text-[#2C332B]/70 lowercase tracking-normal">mmHg</span>
                </label>
                <input type="number" placeholder="Ej. 120" className="w-full p-4 bg-[#F8F6F0] border-none rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-lg font-inter font-light placeholder:text-[#2C332B]/30" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#E6EAE5]/50 border border-[#6B8E7D]/20 text-sm font-inter font-light text-[#2C332B]/80 flex gap-3">
               <svg className="w-5 h-5 text-[#6B8E7D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p>Estos datos son cruciales para que la IA determine tu riesgo metabólico con precisión clínica.</p>
            </div>
             
             <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setStep(1)} className="w-full sm:w-1/3 border border-[#2C332B]/20 text-[#2C332B] px-8 py-4 rounded-full font-inter font-light hover:bg-[#F8F6F0] transition text-lg tracking-wide shadow-sm">Volver</button>
              {/* Botón que activa la animación de carga */}
              <button onClick={handleAnalyze} className="w-full sm:w-2/3 bg-[#2C332B] text-white px-8 py-4 rounded-full font-inter font-light hover:bg-[#6B8E7D] transition text-lg tracking-wide shadow-md">Analizar con IA</button>
            </div>
           </motion.div>
        )}

        {/* PASO 3: Resultados (El Dashboard de IA) */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            
            {/* Encabezado de Resultados */}
            <div className="text-center border-b border-[#2C332B]/10 pb-8">
              <h2 className="text-4xl font-playfair mb-4 text-[#2C332B]">Tu Evaluación de Salud</h2>
              <p className="font-inter font-light text-[#2C332B]/70 max-w-xl mx-auto">
                Basado en las guías de la ADA (American Diabetes Association), la IA ha analizado tus marcadores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              
              {/* Columna Izquierda: Medidor Visual (Gauge) */}
              <div className="flex flex-col items-center bg-[#F8F6F0] p-8 rounded-[2rem]">
                <span className="text-sm uppercase tracking-widest text-[#2C332B]/50 mb-6 font-inter font-medium">Nivel de Riesgo Actual</span>
                
                {/* Simulación de un Medidor Gráfico */}
                <div className="relative w-48 h-24 overflow-hidden mb-6">
                  {/* Arco base */}
                  <div className="absolute top-0 left-0 w-full h-full border-[1.5rem] border-[#EAE2D0] rounded-t-full border-b-0"></div>
                  {/* Arco de color animado (Riesgo Moderado) */}
                  <motion.div 
                    initial={{ rotate: -180 }} animate={{ rotate: -90 }} transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 w-full h-full border-[1.5rem] border-[#E4A853] rounded-t-full border-b-0 origin-bottom"
                  ></motion.div>
                </div>
                
                <h3 className="text-3xl font-playfair text-[#E4A853] mb-2">Moderado</h3>
                <p className="text-center text-sm font-inter font-light text-[#2C332B]/60">Ventana de oportunidad ideal para prevención.</p>
              </div>

              {/* Columna Derecha: Explicación de la IA y Plan */}
              <div className="space-y-6">
                <div className="bg-[#EFECE5] p-6 rounded-3xl">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#6B8E7D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <h4 className="font-playfair text-lg text-[#2C332B]">Análisis Clínico (IA)</h4>
                  </div>
                  <p className="font-inter font-light text-[#2C332B]/80 text-sm leading-relaxed">
                    Tus niveles de glucosa (95 mg/dL) están dentro del rango normal. Sin embargo, tu historial familiar y la presión arterial sugieren que mantener un peso saludable y mejorar la actividad cardiovascular reducirá drásticamente tu riesgo futuro de desarrollar resistencia a la insulina.
                  </p>
                </div>

                <div>
                  <h4 className="font-inter font-medium text-sm uppercase tracking-widest text-[#2C332B]/50 mb-4">Plan de Acción Recomendado</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-inter font-light text-[#2C332B]/80">
                      <span className="w-2 h-2 rounded-full bg-[#6B8E7D]"></span> Caminar 30 minutos al día.
                    </li>
                    <li className="flex items-center gap-3 text-sm font-inter font-light text-[#2C332B]/80">
                      <span className="w-2 h-2 rounded-full bg-[#6B8E7D]"></span> Reducir carbohidratos refinados en cenas.
                    </li>
                    <li className="flex items-center gap-3 text-sm font-inter font-light text-[#2C332B]/80">
                      <span className="w-2 h-2 rounded-full bg-[#6B8E7D]"></span> Monitoreo preventivo en 6 meses.
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Footer del Resultado */}
            <div className="pt-8 mt-4 border-t border-[#2C332B]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-inter font-light text-[#2C332B]/50 max-w-md text-center sm:text-left">
                *Este es un análisis predictivo. Te recomendamos consultar con un profesional médico para un diagnóstico oficial.
              </p>
              <Link href="/login">
                <button className="bg-[#2C332B] text-white px-6 py-3 rounded-full font-inter font-light hover:bg-[#6B8E7D] transition shadow-md whitespace-nowrap">
                  Guardar mi Historial
                </button>
              </Link>
            </div>

          </motion.div>
        )}

      </motion.div>
    </div>
  );
}