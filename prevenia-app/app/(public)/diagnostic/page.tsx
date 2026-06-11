"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DiagnosticWizard() {
  const { data: session } = useSession(); // Para saber si hay alguien logueado
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 1. EL ESTADO CON LOS NUEVOS DATOS MÉDICOS
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    waist: "",
    physicalActivity: "",
    familyHistory: false,
    fastingGlucose: "",
    systolicPressure: "",
  });

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 2. FUNCIÓN PARA ENVIAR A LA IA
  const analyzeData = async () => {
    setIsLoading(true);
    setStep(4); // Movemos a la pantalla de carga/resultado

    try {
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id || null, // Si hay sesión, mandamos el ID para guardarlo
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.diagnostic);
      } else {
        console.error(data.error);
        setResult({ error: "Hubo un error al procesar el análisis." });
      }
    } catch (error) {
      setResult({ error: "Error de conexión." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-32 pb-20 px-4 relative overflow-hidden flex flex-col items-center">
      
      {/* Blobs de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6B8E7D]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#EFECE5] rounded-full blur-[100px] pointer-events-none" />

      {/* Contenedor Principal Acrílico */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-sm border border-white p-8 md:p-14 relative z-10">
        
        {/* Barra de Progreso */}
        {step < 4 && (
          <div className="mb-10">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#2C332B]/40 mb-3 font-medium">
              <span>Paso {step} de 3</span>
              <span>Evaluación Metabólica</span>
            </div>
            <div className="w-full h-1.5 bg-[#2C332B]/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#6B8E7D]"
                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* PASO 1: Biometría Básica */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-2 tracking-tight">Biometría Básica</h2>
              <p className="text-[#2C332B]/60 font-inter font-light text-sm mb-8">Datos esenciales para calcular tu índice de masa corporal.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Edad (años)</label>
                    <input type="number" value={formData.age} onChange={(e) => updateForm("age", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter" placeholder="Ej. 35" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Peso (kg)</label>
                    <input type="number" value={formData.weight} onChange={(e) => updateForm("weight", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter" placeholder="Ej. 70" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Altura (cm)</label>
                  <input type="number" value={formData.height} onChange={(e) => updateForm("height", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter" placeholder="Ej. 175" />
                </div>
                
                <button onClick={() => setStep(2)} disabled={!formData.age || !formData.weight || !formData.height} className="w-full mt-8 bg-[#2C332B] text-white py-4 rounded-full font-inter font-light hover:bg-[#6B8E7D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 2: Estilo de Vida y Genética */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-2 tracking-tight">Estilo de Vida</h2>
              <p className="text-[#2C332B]/60 font-inter font-light text-sm mb-8">Indicadores de riesgo cardiovascular y genético.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Cintura (cm) - Opcional</label>
                  <input type="number" value={formData.waist} onChange={(e) => updateForm("waist", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter" placeholder="Mide a la altura del ombligo" />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Actividad Física</label>
                  <select value={formData.physicalActivity} onChange={(e) => updateForm("physicalActivity", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter text-[#2C332B]">
                    <option value="">Selecciona una opción</option>
                    <option value="Sedentario">Sedentario (Poco o ningún ejercicio)</option>
                    <option value="Moderado">Moderado (Ejercicio 2-3 veces por semana)</option>
                    <option value="Activo">Activo (Ejercicio 4+ veces por semana)</option>
                  </select>
                </div>

                <div className="p-4 bg-white/50 border border-white rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => updateForm("familyHistory", !formData.familyHistory)}>
                  <span className="text-sm font-inter text-[#2C332B]">¿Familiares directos con Diabetes?</span>
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.familyHistory ? 'bg-[#6B8E7D]' : 'bg-[#2C332B]/20'}`}>
                    <motion.div className="w-4 h-4 bg-white rounded-full absolute top-1" animate={{ left: formData.familyHistory ? '26px' : '4px' }} />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="w-1/3 py-4 rounded-full font-inter font-light text-[#2C332B] hover:bg-black/5 transition-colors border border-black/5">Atrás</button>
                  <button onClick={() => setStep(3)} disabled={!formData.physicalActivity} className="w-2/3 bg-[#2C332B] text-white py-4 rounded-full font-inter font-light hover:bg-[#6B8E7D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Continuar</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Clínicos Opcionales */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-playfair text-[#2C332B] mb-2 tracking-tight">Datos Clínicos</h2>
              <p className="text-[#2C332B]/60 font-inter font-light text-sm mb-8">Si tienes análisis recientes, inclúyelos. Si no, déjalos en blanco.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Glucosa en ayunas (mg/dL)</label>
                  <input type="number" value={formData.fastingGlucose} onChange={(e) => updateForm("fastingGlucose", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter" placeholder="Ej. 95" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2C332B]/60 mb-2 ml-2">Presión Arterial Sistólica (mmHg)</label>
                  <input type="number" value={formData.systolicPressure} onChange={(e) => updateForm("systolicPressure", e.target.value)} className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-1 focus:ring-[#6B8E7D] outline-none transition text-sm font-inter" placeholder="Ej. 120" />
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="w-1/3 py-4 rounded-full font-inter font-light text-[#2C332B] hover:bg-black/5 transition-colors border border-black/5">Atrás</button>
                  <button onClick={analyzeData} className="w-2/3 bg-[#6B8E7D] text-white py-4 rounded-full font-inter font-medium tracking-wide hover:bg-[#2C332B] shadow-md transition-all">
                    Generar Diagnóstico IA
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 4: Resultados / Loading */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin mb-6" />
                  <h3 className="font-playfair text-2xl text-[#2C332B] mb-2">Gemini está analizando...</h3>
                  <p className="font-inter text-sm text-[#2C332B]/60">Evaluando biomarcadores y calculando riesgos.</p>
                </div>
              ) : result?.error ? (
                <div className="text-red-500">
                  <p>{result.error}</p>
                  <button onClick={() => setStep(1)} className="mt-4 text-[#6B8E7D] underline">Intentar de nuevo</button>
                </div>
              ) : (
                <div className="text-left">
                  {/* Tarjeta de Nivel de Riesgo */}
                  <div className={`p-6 rounded-3xl mb-6 text-center ${result.riskLevel === 'Alto' ? 'bg-red-50 text-red-800' : result.riskLevel === 'Moderado' ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
                    <span className="block text-xs uppercase tracking-widest opacity-60 mb-2">Nivel de Riesgo</span>
                    <h3 className="text-4xl font-playfair font-bold">{result.riskLevel}</h3>
                  </div>

                  <h4 className="font-playfair text-xl mb-3 text-[#2C332B]">Análisis de la Inteligencia Artificial</h4>
                  <p className="font-inter text-sm text-[#2C332B]/80 leading-relaxed mb-8 p-6 bg-white/50 border border-white rounded-3xl">
                    {result.aiAnalysis}
                  </p>

                  <h4 className="font-playfair text-xl mb-3 text-[#2C332B]">Plan de Acción</h4>
                  <ul className="space-y-3 mb-8">
                    {result.recommendedPlan?.split(';').filter((p:string) => p.trim() !== '').map((point: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm font-inter text-[#2C332B]/80 items-start">
                        <div className="w-5 h-5 rounded-full bg-[#6B8E7D]/20 text-[#6B8E7D] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">✓</div>
                        {point.trim()}
                      </li>
                    ))}
                  </ul>

                  {/* Acciones Finales */}
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="w-1/2 py-4 rounded-full font-inter font-light text-[#2C332B] hover:bg-black/5 transition-colors border border-black/5">Reevaluar</button>
                    <Link href={session ? "/dashboard" : "/login"} className="w-1/2 text-center bg-[#2C332B] text-white py-4 rounded-full font-inter font-light hover:bg-[#6B8E7D] transition-colors">
                      {session ? "Ir a mi panel" : "Guardar mis datos"}
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}