"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { z } from "zod"; 
import toast from "react-hot-toast"; // 👈 Integración de alertas premium
import { ChevronRight, ChevronLeft, Sparkles, Activity, HeartPulse, ShieldAlert, Apple, Pill } from "lucide-react"; // 👈 Íconos para microinteracciones

// ==========================================
// 🛡️ REGLAS ESTRICTAS DE ZOD
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

  const [formData, setFormData] = useState({
    age: "", weight: "", height: "", waist: "",
    physicalActivity: "Moderada",
    familyHistory: false,
    healthyDiet: true,              
    previousHighGlucose: false,     
    bloodPressureMedication: false, 
    fastingGlucose: "", systolicPressure: ""
  });

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

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
        toast.error("Por favor, revisa los campos en rojo."); // 👈 Microinteracción de error
        return; 
      }
    }
    setStep(prev => prev + 1);
    setErrors({});
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    const parsedStep3 = {
      fastingGlucose: formData.fastingGlucose ? Number(formData.fastingGlucose) : '',
      systolicPressure: formData.systolicPressure ? Number(formData.systolicPressure) : '',
    };
    
    const validation = step3Schema.safeParse(parsedStep3);
    if (!validation.success) {
      const newErrors: any = {};
      validation.error.issues.forEach(issue => { newErrors[issue.path[0]] = issue.message; });
      setErrors(newErrors);
      toast.error("Datos clínicos fuera de rangos normales.");
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
        toast.success("Análisis completado con éxito."); // 👈 Éxito
      } else {
        toast.error(data.error); // 👈 Reemplazo de alert()
        setStep(3); 
      }
    } catch (e) {
      toast.error("Error de conexión. Intente nuevamente."); // 👈 Reemplazo de alert()
      setStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const InputError = ({ msg }: { msg?: string }) => msg ? <p className="text-red-500 text-xs mt-1.5 animate-pulse flex items-center gap-1"><ShieldAlert size={12}/> {msg}</p> : null;

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-24 px-4 pb-12 flex flex-col items-center">
      
      {/* Título Principal */}
      {step < 4 && (
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-2">Evaluación Clínica Asistida</h1>
          <p className="text-[#2C332B]/60 font-inter font-light flex items-center justify-center gap-2">
            <Activity size={16} className="text-[#6B8E7D]" /> Paso {step} de 3
          </p>
          <div className="flex justify-center gap-2 mt-5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? "bg-[#6B8E7D] shadow-sm" : "bg-[#6B8E7D]/20"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Contenedor del Wizard */}
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-sm border border-white relative overflow-hidden z-10">
        
        <AnimatePresence mode="wait">
          {/* PASO 1: MÉTRICAS FÍSICAS */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-6 flex items-center gap-2">
                Métricas Físicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2 transition-colors group-focus-within:text-[#6B8E7D]">Edad (años) *</label>
                  <input type="text" inputMode="numeric" name="age" value={formData.age} onChange={handleNumberInput} placeholder="Ej. 45" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter transition-all focus:bg-white focus:ring-2 focus:ring-[#6B8E7D]/30 ${errors.age ? 'border border-red-500/50 focus:ring-red-500/30' : 'border border-transparent'}`} />
                  <InputError msg={errors.age} />
                </div>
                <div className="group">
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2 transition-colors group-focus-within:text-[#6B8E7D]">Peso (kg) *</label>
                  <input type="text" inputMode="numeric" name="weight" value={formData.weight} onChange={handleNumberInput} placeholder="Ej. 75" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter transition-all focus:bg-white focus:ring-2 focus:ring-[#6B8E7D]/30 ${errors.weight ? 'border border-red-500/50 focus:ring-red-500/30' : 'border border-transparent'}`} />
                  <InputError msg={errors.weight} />
                </div>
                <div className="group">
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2 transition-colors group-focus-within:text-[#6B8E7D]">Altura (cm) *</label>
                  <input type="text" inputMode="numeric" name="height" value={formData.height} onChange={handleNumberInput} placeholder="Ej. 170" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter transition-all focus:bg-white focus:ring-2 focus:ring-[#6B8E7D]/30 ${errors.height ? 'border border-red-500/50 focus:ring-red-500/30' : 'border border-transparent'}`} />
                  <InputError msg={errors.height} />
                </div>
                <div className="group">
                  <label className="block text-sm font-inter text-[#2C332B]/70 mb-2 transition-colors group-focus-within:text-[#6B8E7D]">Cintura (cm) <span className="text-xs opacity-50">(Opcional)</span></label>
                  <input type="text" inputMode="numeric" name="waist" value={formData.waist} onChange={handleNumberInput} placeholder="Ej. 90" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter transition-all focus:bg-white focus:ring-2 focus:ring-[#6B8E7D]/30 ${errors.waist ? 'border border-red-500/50 focus:ring-red-500/30' : 'border border-transparent'}`} />
                  <InputError msg={errors.waist} />
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 2: ESTILO DE VIDA E HISTORIAL */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-6">Hábitos e Historial</h2>
              
              <div className="space-y-4">
                <div className="bg-[#F8F6F0] p-5 rounded-3xl">
                  <label className="block text-sm font-inter text-[#2C332B] mb-4">Nivel de Actividad Física</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Baja", "Moderada", "Alta"].map(level => (
                      <button key={level} onClick={() => setFormData({ ...formData, physicalActivity: level })} className={`py-3 rounded-2xl text-sm font-inter transition-all duration-300 ${formData.physicalActivity === level ? 'bg-[#6B8E7D] text-white shadow-md scale-105' : 'bg-white text-[#2C332B]/60 hover:bg-white/60'}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between group hover:bg-[#EFECE5] transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-white rounded-full text-green-600 shadow-sm"><Apple size={18}/></div>
                    <div>
                      <h4 className="font-inter text-[#2C332B] text-sm font-medium">Dieta Saludable</h4>
                      <p className="text-xs text-[#2C332B]/60 mt-0.5">¿Comes verduras o frutas todos los días?</p>
                    </div>
                  </div>
                  <button onClick={() => setFormData({ ...formData, healthyDiet: !formData.healthyDiet })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner flex-shrink-0 ${formData.healthyDiet ? 'bg-[#6B8E7D]' : 'bg-[#D1D5DB]'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.healthyDiet ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between group hover:bg-[#EFECE5] transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><HeartPulse size={18}/></div>
                    <div>
                      <h4 className="font-inter text-[#2C332B] text-sm font-medium">Historial Familiar</h4>
                      <p className="text-xs text-[#2C332B]/60 mt-0.5">¿Padres o abuelos con diabetes?</p>
                    </div>
                  </div>
                  <button onClick={() => setFormData({ ...formData, familyHistory: !formData.familyHistory })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner flex-shrink-0 ${formData.familyHistory ? 'bg-[#6B8E7D]' : 'bg-[#D1D5DB]'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.familyHistory ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between group hover:bg-[#EFECE5] transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-white rounded-full text-red-500 shadow-sm"><Activity size={18}/></div>
                    <div>
                      <h4 className="font-inter text-[#2C332B] text-sm font-medium">Glucosa Alta Previa</h4>
                      <p className="text-xs text-[#2C332B]/60 mt-0.5 max-w-[200px]">¿Alguna vez te han detectado glucosa alta?</p>
                    </div>
                  </div>
                  <button onClick={() => setFormData({ ...formData, previousHighGlucose: !formData.previousHighGlucose })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner flex-shrink-0 ${formData.previousHighGlucose ? 'bg-[#6B8E7D]' : 'bg-[#D1D5DB]'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.previousHighGlucose ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 3: DATOS CLÍNICOS */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">Datos Clínicos</h2>
              <p className="text-xs text-[#2C332B]/50 font-inter mb-6">Si no conoces estos datos, puedes dejarlos en blanco.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-inter text-[#2C332B]/70 mb-2 transition-colors group-focus-within:text-[#6B8E7D]">Glucosa en Ayunas (mg/dL)</label>
                    <input type="text" inputMode="numeric" name="fastingGlucose" value={formData.fastingGlucose} onChange={handleNumberInput} placeholder="Ej. 95" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter transition-all focus:bg-white focus:ring-2 focus:ring-[#6B8E7D]/30 ${errors.fastingGlucose ? 'border border-red-500/50' : 'border border-transparent'}`} />
                    <InputError msg={errors.fastingGlucose} />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-inter text-[#2C332B]/70 mb-2 transition-colors group-focus-within:text-[#6B8E7D]">Presión Sistólica (mmHg)</label>
                    <input type="text" inputMode="numeric" name="systolicPressure" value={formData.systolicPressure} onChange={handleNumberInput} placeholder="Ej. 120" className={`w-full bg-[#F8F6F0] p-4 rounded-2xl outline-none font-inter transition-all focus:bg-white focus:ring-2 focus:ring-[#6B8E7D]/30 ${errors.systolicPressure ? 'border border-red-500/50' : 'border border-transparent'}`} />
                    <InputError msg={errors.systolicPressure} />
                  </div>
                </div>

                <div className="bg-[#F8F6F0] p-5 rounded-3xl flex items-center justify-between group hover:bg-[#EFECE5] transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-white rounded-full text-[#6B8E7D] shadow-sm"><Pill size={18}/></div>
                    <div>
                      <h4 className="font-inter text-[#2C332B] text-sm font-medium">Medicación</h4>
                      <p className="text-xs text-[#2C332B]/60 mt-0.5">¿Tomas medicamento para la presión arterial?</p>
                    </div>
                  </div>
                  <button onClick={() => setFormData({ ...formData, bloodPressureMedication: !formData.bloodPressureMedication })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner flex-shrink-0 ${formData.bloodPressureMedication ? 'bg-[#6B8E7D]' : 'bg-[#D1D5DB]'}`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.bloodPressureMedication ? 'translate-x-6' : 'translate-x-0'}`} />
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
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#6B8E7D] animate-pulse" />
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
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest mt-4 shadow-sm border border-white ${
                  result.riskLevel === 'Alto' ? 'bg-red-100 text-red-700' :
                  result.riskLevel === 'Moderado' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  <Activity size={16} /> Riesgo {result.riskLevel}
                </div>
              </div>

              <div className="bg-[#F8F6F0] p-6 rounded-3xl mb-6 shadow-sm border border-white">
                <h4 className="font-playfair text-[#2C332B] text-lg mb-3 flex items-center gap-2"><Sparkles size={18} className="text-[#6B8E7D]"/> Análisis Clínico</h4>
                <p className="text-[#2C332B]/80 font-inter font-light text-sm leading-relaxed">{result.aiAnalysis}</p>
              </div>

              <div className="bg-[#EFECE5] p-6 rounded-3xl mb-8 shadow-sm border border-white">
                <h4 className="font-playfair text-[#2C332B] text-lg mb-4">Plan de Acción Recomendado</h4>
                <ul className="space-y-4">
                  {result.recommendedPlan.split(';').map((action: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm font-inter text-[#2C332B]/80 items-start bg-white/50 p-3 rounded-2xl">
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
              <button onClick={prevStep} className="flex items-center gap-2 text-sm font-inter text-[#2C332B]/50 hover:text-[#2C332B] transition group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Atrás
              </button>
            ) : <div />}
            
            {step < 3 ? (
              <button onClick={nextStep} className="px-8 py-3 bg-[#2C332B] text-white rounded-full font-inter font-light text-sm hover:bg-[#6B8E7D] transition-all shadow-md flex items-center gap-2 group">
                Siguiente <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-8 py-3 bg-[#6B8E7D] text-white rounded-full font-inter font-medium text-sm hover:bg-[#4A6357] transition-all shadow-md flex items-center gap-2 group">
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> Analizar con IA
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}