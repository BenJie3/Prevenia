"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { z } from "zod"; // 🛡️ EL BLINDAJE DE SEGURIDAD

// ==========================================
// 🛡️ REGLAS ESTRICTAS DE ZOD (Evita Inyecciones y Errores)
// ==========================================
const step1Schema = z.object({
  age: z.number({ invalid_type_error: "Debe ser un número válido" }).min(18, "Debes ser mayor de 18 años").max(120, "Edad irreal"),
  weight: z.number({ invalid_type_error: "Debe ser un número válido" }).min(30, "Peso mínimo 30kg").max(300, "Peso irreal"),
  height: z.number({ invalid_type_error: "Debe ser un número válido" }).min(100, "Altura mínima 100cm").max(250, "Altura irreal"),
  waist: z.number().min(40).max(200).optional().or(z.literal('')),
});

const step3Schema = z.object({
  fastingGlucose: z.number().min(40).max(500).optional().or(z.literal('')),
  systolicPressure: z.number().min(70).max(250).optional().or(z.literal('')),
});

export default function DiagnosticWizard() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ESTADOS DEL FORMULARIO (Agregados los 3 nuevos campos)
  const [formData, setFormData] = useState({
    age: "", weight: "", height: "", waist: "",
    physicalActivity: "Moderada",
    familyHistory: false,
    healthyDiet: true,              // 🍎 NUEVO
    previousHighGlucose: false,     // 🩸 NUEVO
    bloodPressureMedication: false, // 💊 NUEVO
    fastingGlucose: "", systolicPressure: ""
  });

  // MANEJO SEGURO DE INPUTS (Solo permite números y limpia el texto)
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si no es un número y no está vacío, no lo deja escribir
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Borramos el error si existía
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // NAVEGACIÓN ENTRE PASOS CON VALIDACIÓN ZOD 🛡️
  const nextStep = () => {
    if (step === 1) {
      const parsedData = {
        age: Number(formData.age), weight: Number(formData.weight),
        height: Number(formData.height), waist: formData.waist ? Number(formData.waist) : ''
      };
      
      const validation = step1Schema.safeParse(parsedData);
      if (!validation.success) {
        const newErrors: any = {};
        validation.error.issues.forEach(issue => { newErrors[issue.path[0]] = issue.message; });
        setErrors(newErrors);
        return; // El Cadenero Zod bloquea el avance
      }
    }
    setStep(prev => prev + 1);
    setErrors({});
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setErrors({});
  };

  // ENVIAR AL MOTOR RAG (GEMINI)
  const handleSubmit = async () => {
    // Validamos el último paso antes de enviar
    const parsedStep3 = {
      fastingGlucose: formData.fastingGlucose ? Number(formData.fastingGlucose) : '',
      systolicPressure: formData.systolicPressure ? Number(formData.systolicPressure) : '',
    };
    
    const validation = step3Schema.safeParse(parsedStep3);
    if (!validation.success) {
      const newErrors: any = {};
      validation.error.issues.forEach(issue => { newErrors[issue.path[0]] = issue.message; });
      setErrors(newErrors);
      return;
    }

    setIsAnalyzing(true);
    setStep(4);

    try {
      const payload = {
        ...formData,
        userId: session?.user ? (session.user as any).id : null
      };

      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.diagnostic);
        setStep(5);
      } else {
        alert(data.error);
        setStep(3); // Regresa en caso de error
      }
    } catch (e) {
      alert("Error de conexión. Intente nuevamente.");
      setStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // COMPONENTES UI AUXILIARES
  const InputError = ({ msg }: { msg?: string }) => msg ? <p className="text-red-500 text-xs mt-1 animate-pulse">{msg}</p> : null;

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-24 px-4 pb-12 flex flex-col items-center">
      
      {/* Título Principal */}
      {step < 4 && (
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-2">Evaluación Clínica Asistida</h1>
          <p className="text-[#2C332B]/60 font-inter font-light">Paso {step} de 3</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? "bg-[#6B8E7D]" : "bg-[#6B8E7D]/20"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Contenedor del Wizard */}
      <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-white relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {/* PASO 1: MÉTRICAS FÍSICAS */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-6">Métricas Físicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2">Edad (años) *</label>
                  <input type="text" inputMode="numeric" name="age" value={formData.age} onChange={handleNumberInput} placeholder="Ej. 45" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter ${errors.age ? 'border border-red-500' : ''}`} />
                  <InputError msg={errors.age} />
                </div>
                <div>
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2">Peso (kg) *</label>
                  <input type="text" inputMode="numeric" name="weight" value={formData.weight} onChange={handleNumberInput} placeholder="Ej. 75" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter ${errors.weight ? 'border border-red-500' : ''}`} />
                  <InputError msg={errors.weight} />
                </div>
                <div>
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2">Altura (cm) *</label>
                  <input type="text" inputMode="numeric" name="height" value={formData.height} onChange={handleNumberInput} placeholder="Ej. 170" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter ${errors.height ? 'border border-red-500' : ''}`} />
                  <InputError msg={errors.height} />
                </div>
                <div>
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2">Cintura (cm) <span className="text-xs opacity-50">(Opcional)</span></label>
                  <input type="text" inputMode="numeric" name="waist" value={formData.waist} onChange={handleNumberInput} placeholder="Ej. 90" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter ${errors.waist ? 'border border-red-500' : ''}`} />
                  <InputError msg={errors.waist} />
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 2: ESTILO DE VIDA E HISTORIAL (NUEVAS PREGUNTAS) */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-6">Hábitos e Historial</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-3">Nivel de Actividad Física</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Baja", "Moderada", "Alta"].map(level => (
                      <button key={level} onClick={() => setFormData({ ...formData, physicalActivity: level })} className={`py-3 rounded-2xl text-sm font-inter transition-all ${formData.physicalActivity === level ? 'bg-[#6B8E7D] text-white shadow-md' : 'bg-[#F8F6F0] text-[#2C332B]/60 hover:bg-[#EAE2D0]'}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🍎 PREGUNTA NUEVA 1 */}
                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <h4 className="font-inter text-[#2C332B] text-sm">Dieta Saludable</h4>
                    <p className="text-xs text-[#2C332B]/60 mt-1">¿Comes verduras o frutas todos los días?</p>
                  </div>
                  <button onClick={() => setFormData({ ...formData, healthyDiet: !formData.healthyDiet })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.healthyDiet ? 'bg-[#6B8E7D]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.healthyDiet ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <h4 className="font-inter text-[#2C332B] text-sm">Historial Familiar</h4>
                    <p className="text-xs text-[#2C332B]/60 mt-1">¿Padres o abuelos con diabetes?</p>
                  </div>
                  <button onClick={() => setFormData({ ...formData, familyHistory: !formData.familyHistory })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.familyHistory ? 'bg-[#6B8E7D]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.familyHistory ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 🩸 PREGUNTA NUEVA 2 */}
                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <h4 className="font-inter text-[#2C332B] text-sm">Glucosa Alta Previa</h4>
                    <p className="text-xs text-[#2C332B]/60 mt-1 max-w-[200px]">¿Alguna vez te han detectado glucosa alta (ej. embarazo, exámenes previos)?</p>
                  </div>
                  <button onClick={() => setFormData({ ...formData, previousHighGlucose: !formData.previousHighGlucose })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.previousHighGlucose ? 'bg-[#6B8E7D]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.previousHighGlucose ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 3: DATOS CLÍNICOS (OPCIONALES + 💊 NUEVO) */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">Datos Clínicos</h2>
              <p className="text-xs text-[#2C332B]/50 font-inter mb-6">Si no conoces estos datos, puedes dejarlos en blanco.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-inter text-[#2C332B]/70 mb-2">Glucosa en Ayunas (mg/dL)</label>
                    <input type="text" inputMode="numeric" name="fastingGlucose" value={formData.fastingGlucose} onChange={handleNumberInput} placeholder="Ej. 95" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter ${errors.fastingGlucose ? 'border border-red-500' : ''}`} />
                    <InputError msg={errors.fastingGlucose} />
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-[#2C332B]/70 mb-2">Presión Sistólica (mmHg)</label>
                    <input type="text" inputMode="numeric" name="systolicPressure" value={formData.systolicPressure} onChange={handleNumberInput} placeholder="Ej. 120" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter ${errors.systolicPressure ? 'border border-red-500' : ''}`} />
                    <InputError msg={errors.systolicPressure} />
                  </div>
                </div>

                {/* 💊 PREGUNTA NUEVA 3 */}
                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <h4 className="font-inter text-[#2C332B] text-sm">Medicación</h4>
                    <p className="text-xs text-[#2C332B]/60 mt-1">¿Tomas medicamento para la presión arterial?</p>
                  </div>
                  <button onClick={() => setFormData({ ...formData, bloodPressureMedication: !formData.bloodPressureMedication })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.bloodPressureMedication ? 'bg-[#6B8E7D]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.bloodPressureMedication ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 4: PANTALLA DE CARGA IA */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 relative mb-8">
                <div className="absolute inset-0 border-4 border-[#6B8E7D]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#6B8E7D] border-t-transparent rounded-full animate-spin" />
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#6B8E7D] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-2 text-center">Gemini está analizando...</h2>
              <p className="text-sm text-[#2C332B]/50 font-inter text-center animate-pulse">Cruzando biomarcadores con guías médicas oficiales</p>
            </motion.div>
          )}

          {/* PASO 5: RESULTADO FINAL */}
          {step === 5 && result && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair text-[#2C332B] mb-2">Tu Evaluación</h2>
                <div className={`inline-block px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest mt-4 ${
                  result.riskLevel === 'Alto' ? 'bg-red-100 text-red-700' :
                  result.riskLevel === 'Moderado' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>Riesgo {result.riskLevel}</div>
              </div>

              <div className="bg-[#F8F6F0] p-6 rounded-3xl mb-6">
                <h4 className="font-playfair text-[#2C332B] text-lg mb-3">Análisis Clínico</h4>
                <p className="text-[#2C332B]/80 font-inter font-light text-sm leading-relaxed">{result.aiAnalysis}</p>
              </div>

              <div className="bg-[#EFECE5] p-6 rounded-3xl mb-8">
                <h4 className="font-playfair text-[#2C332B] text-lg mb-3">Plan de Acción Recomendado</h4>
                <ul className="space-y-3">
                  {result.recommendedPlan.split(';').map((action: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm font-inter text-[#2C332B]/80 items-start">
                      <span className="text-[#6B8E7D] mt-0.5">✦</span> <span>{action.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <Link href={session ? "/dashboard" : "/"} className="w-full">
                  <button className="w-full py-4 bg-[#2C332B] text-white rounded-full font-inter font-light text-sm hover:bg-[#6B8E7D] transition-all shadow-md">
                    {session ? "Ir a mi Panel Médico" : "Finalizar y Volver al Inicio"}
                  </button>
                </Link>
                {!session && (
                  <p className="text-xs text-center text-[#2C332B]/50 font-inter">Crea una cuenta la próxima vez para guardar tu historial histórico.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTROLES DE NAVEGACIÓN */}
        {step < 4 && (
          <div className="mt-10 flex items-center justify-between border-t border-[#2C332B]/5 pt-6">
            {step > 1 ? (
              <button onClick={prevStep} className="text-sm font-inter text-[#2C332B]/50 hover:text-[#2C332B] transition">Atrás</button>
            ) : <div />}
            
            {step < 3 ? (
              <button onClick={nextStep} className="px-8 py-3 bg-[#2C332B] text-white rounded-full font-inter font-light text-sm hover:bg-[#6B8E7D] transition-all shadow-md">Siguiente</button>
            ) : (
              <button onClick={handleSubmit} className="px-8 py-3 bg-[#6B8E7D] text-white rounded-full font-inter font-medium text-sm hover:bg-[#4A6357] transition-all shadow-md">Analizar con IA</button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}