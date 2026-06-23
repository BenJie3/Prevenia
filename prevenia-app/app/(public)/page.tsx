"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react"; 
import Image from "next/image"; 

export default function LandingPage() {
  const { scrollY } = useScroll();
  const parallaxUp = useTransform(scrollY, [0, 1000], [0, 80]);
  const parallaxDown = useTransform(scrollY, [0, 1000], [0, -80]);

const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" as const } } // EL CANDADO DE SEGURIDAD
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Prevenia reemplaza a mi médico de cabecera?",
      answer: "No. Prevenia es una herramienta de cribado preventivo impulsada por Inteligencia Artificial. Su objetivo es detectar patrones de riesgo temprano basados en literatura clínica para que puedas tomar acción, pero nunca debe sustituir un diagnóstico médico formal ni un análisis de laboratorio."
    },
    {
      question: "¿Mis datos médicos están seguros?",
      answer: "Absolutamente. Utilizamos bases de datos con encriptación de nivel industrial. Además, los datos que compartes con nuestra IA (Gemini) se transmiten por canales seguros y no son utilizados para entrenar modelos públicos."
    },
    {
      question: "¿Necesito pagar para realizar la evaluación?",
      answer: "La evaluación de riesgo metabólico base es y siempre será 100% gratuita. Creemos firmemente que la educación y la prevención temprana deben ser accesibles para todos."
    }
  ];

  const testimonials = [
    { text: "Me ayudó a entender por qué me sentía tan cansada. Supe qué preguntas hacerle a mi médico gracias al reporte.", author: "María G.", label: "Riesgo Moderado Revertido" },
    { text: "La interfaz es tan limpia que no me sentí abrumado al ingresar mis datos de salud. El plan de acción fue muy claro.", author: "Carlos D.", label: "Usuario de Prevenia" },
  ];

  return (
    // <div className="relative w-full flex flex-col items-center min-h-screen overflow-hidden bg-[#F8F6F0]">
      
    //   {/* Ambient Blurs (Fondo de cristal) - Mantenidos */}
    //   <div className="absolute rounded-full filter blur-[100px] opacity-60 bg-[#EAE2D0] w-[40rem] h-[40rem] top-[-5rem] left-[-10rem] -z-10 pointer-events-none" />
    //   <div className="absolute rounded-full filter blur-[100px] opacity-50 bg-[#DDE6DE] w-[35rem] h-[35rem] top-[15%] right-[-5rem] -z-10 pointer-events-none" />

    //   <motion.div 
    //     initial={{ filter: "blur(20px)", opacity: 0, scale: 0.98 }}
    //     animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
    //     transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    //     className="w-full flex flex-col items-center relative z-20"
    //   >
        
    //     {/* ============================================================
    //         1. HERO SECTION (EL ENCABEZADO "DREAMY DEPTH" - MODIFICADO)
    //     ============================================================ */}
    //     <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 md:pt-40 overflow-hidden select-none">
            
    //         {/* 🖼️ Imagen de Fondo Desenfocada Atmosférica */}
    //         <div className="absolute inset-0 z-0">
    //             <Image 
    //                 src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1600" 
    //                 alt="Atmosfera Clinica Prevenia" 
    //                 fill
    //                 priority
    //                 className="object-cover blur-sm opacity-[0.15] scale-105" // Desenfocada, baja opacidad y escala para el blur
    //             />
    //             {/* Degradado para integrar con el fondo de la página */}
    //             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8F6F0]/50 to-[#F8F6F0]" />
    //         </div>

    //         {/* 🖋️ Contenido Centralizado Premium */}
    //         <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
                
    //             {/* Badge Sutilmente Mejorado */}
    //             <motion.div 
    //               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
    //               className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/80 text-[#2C332B] text-[10px] sm:text-xs font-inter font-semibold uppercase tracking-[0.2em] mb-10 shadow-sm"
    //             >
    //                 <Sparkles className="w-3.5 h-3.5 text-[#6B8E7D]" />
    //                 Medicina Preventiva IA
    //             </motion.div>

    //             {/* Tipografía Monumental Centrada */}
    //             <motion.h1 
    //               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
    //               className="font-playfair text-5xl sm:text-7xl md:text-[6rem] lg:text-[7.5rem] text-[#2C332B] tracking-tighter mb-8 leading-[1] md:leading-[0.9] max-w-5xl mx-auto"
    //             >
    //                 Tu metabolismo, <br />
    //                 <span className="text-[#6B8E7D] italic font-light pr-2">al descubierto.</span>
    //             </motion.h1>
                
    //             {/* Párrafo Centrado y Refinado */}
    //             <motion.p 
    //               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
    //               className="text-base sm:text-lg lg:text-xl text-[#2C332B]/60 font-inter font-light max-w-2xl leading-relaxed mb-12"
    //             >
    //                 La precisión de la literatura clínica mundial, traducida por inteligencia artificial en un plan de acción para tu longevidad.
    //             </motion.p>
                
    //             {/* Botón Centralizado Único */}
    //             <motion.div 
    //               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
    //               className="w-full flex justify-center"
    //             >
    //                 <Link href="/diagnostic">
    //                     <button className="group px-12 py-5 bg-[#2C332B] text-white rounded-full font-inter font-light text-base hover:bg-[#6B8E7D] transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3">
    //                         Iniciar Evaluación
    //                         <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
    //                     </button>
    //                 </Link>
    //             </motion.div>
    //         </div>
    //     </section>

    //     {/* ============================================================
    //         CONTENEDOR DE SECCIONES INTERCALADAS (MANTENIDAS INTACTAS)
    //     ============================================================ */}
    //     <div className="relative w-full flex flex-col items-center">

    //         <section className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-32 md:space-y-40 relative z-20 w-full">
                
    //             {/* Bloque 1 - Mantenido */}
    //             <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row items-center gap-8 md:gap-24">
    //                 <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-[#EFECE5] shadow-sm hover:shadow-md transition relative">
    //                     <motion.div style={{ y: parallaxDown }} className="absolute inset-0 h-[180%] w-full -top-[40%]">
    //                         <Image src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" fill className="object-cover opacity-90" alt="Yoga/Salud" sizes="(max-width: 768px) 100vw, 50vw" />
    //                     </motion.div>
    //                 </div>
    //                 <div className="w-full md:w-1/2 text-center md:text-left relative">
    //                     <span className="absolute -top-12 -left-6 text-[6rem] font-playfair italic text-[#6B8E7D]/10 select-none z-0">01</span>
    //                     <div className="relative z-10">
    //                       <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Evaluación IA Inteligente</h2>
    //                       <p className="text-sm md:text-base font-inter font-light text-[#2C332B]/70 leading-relaxed">Analizamos más de 12 puntos de datos clínicos en milisegundos para ofrecerte un panorama claro de tu salud actual.</p>
    //                     </div>
    //                 </div>
    //             </motion.div>

    //             {/* Bloque 2 - Mantenido */}
    //             <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-24">
    //                 <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-[#E6ECE9] shadow-sm hover:shadow-md transition relative">
    //                     <motion.div style={{ y: parallaxDown }} className="absolute inset-0 h-[180%] w-full -top-[40%]">
    //                         <Image src="https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?auto=format&fit=crop&q=80&w=600" fill className="object-cover opacity-90" alt="Naturaleza/Ciencia" sizes="(max-width: 768px) 100vw, 50vw" />
    //                     </motion.div>
    //                 </div>
    //                 <div className="w-full md:w-1/2 text-center md:text-left md:pl-12 relative">
    //                     <span className="absolute -top-12 -left-6 text-[6rem] font-playfair italic text-[#6B8E7D]/10 select-none z-0">02</span>
    //                     <div className="relative z-10">
    //                       <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Conocimiento Médico Real</h2>
    //                       <p className="text-sm md:text-base font-inter font-light text-[#2C332B]/70 leading-relaxed">Respaldado por las últimas guías clínicas internacionales. La inteligencia artificial no inventa, traduce la ciencia a tu idioma.</p>
    //                     </div>
    //                 </div>
    //             </motion.div>

    //             {/* Bloque 3 - Mantenido */}
    //             <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row items-center gap-8 md:gap-24">
    //                 <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition relative">
    //                     <motion.div style={{ y: parallaxDown }} className="absolute inset-0 h-[180%] w-full -top-[40%]">
    //                         <Image src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600" fill className="object-cover opacity-80" alt="Tranquilidad" sizes="(max-width: 768px) 100vw, 50vw" />
    //                     </motion.div>
    //                 </div>
    //                 <div className="w-full md:w-1/2 text-center md:text-left relative">
    //                     <span className="absolute -top-12 -left-6 text-[6rem] font-playfair italic text-[#6B8E7D]/10 select-none z-0">03</span>
    //                     <div className="relative z-10">
    //                       <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Privacidad Absoluta</h2>
    //                       <p className="text-sm md:text-base font-inter font-light text-[#2C332B]/70 leading-relaxed">Sumérgete en la tranquilidad. Tus datos están resguardados bajo estándares de encriptación y privacidad.</p>
    //                     </div>
    //                 </div>
    //             </motion.div>
    //         </section>

    //         {/* SECCIÓN EDUCATIVA (MANTENIDA INTACTA) */}
    //         <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="w-full max-w-6xl mx-auto px-6 py-24 md:py-32 relative z-20">
    //             <div className="flex flex-col md:flex-row gap-12 md:gap-24">
    //               <div className="md:w-1/3">
    //                 <h2 className="text-4xl md:text-5xl font-playfair text-[#2C332B] mb-6 tracking-tight">Comprende tu cuerpo.</h2>
    //                 <p className="font-inter font-light text-[#2C332B]/60 leading-relaxed text-sm md:text-base">La educación es el primer paso hacia la longevidad. Conoce las diferencias metabólicas fundamentales.</p>
    //               </div>
                  
    //               <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
    //                 <div className="group">
    //                   <span className="text-[#6B8E7D] font-inter text-[11px] tracking-[0.2em] mb-4 block font-medium uppercase">Tipo 1</span>
    //                   <h3 className="text-2xl font-playfair text-[#2C332B] mb-3 group-hover:text-[#6B8E7D] transition-colors">Condición Autoinmune</h3>
    //                   <p className="font-inter font-light text-[#2C332B]/60 text-sm leading-relaxed">El páncreas cesa la producción de insulina. Suele ser diagnosticada en etapas tempranas y requiere acompañamiento médico de por vida.</p>
    //                 </div>
    //                 <div className="group">
    //                   <span className="text-[#6B8E7D] font-inter text-[11px] tracking-[0.2em] mb-4 block font-medium uppercase">Tipo 2</span>
    //                   <h3 className="text-2xl font-playfair text-[#2C332B] mb-3 group-hover:text-[#6B8E7D] transition-colors">Resistencia Insulínica</h3>
    //                   <p className="font-inter font-light text-[#2C332B]/60 text-sm leading-relaxed">Afección crónica altamente influenciada por el estilo de vida. Es frecuentemente prevenible y tratable adoptando hábitos equilibrados.</p>
    //                 </div>
    //                 <div className="group">
    //                   <span className="text-[#6B8E7D] font-inter text-[11px] tracking-[0.2em] mb-4 block font-medium uppercase">Gestacional</span>
    //                   <h3 className="text-2xl font-playfair text-[#2C332B] mb-3 group-hover:text-[#6B8E7D] transition-colors">Durante el Embarazo</h3>
    //                   <p className="font-inter font-light text-[#2C332B]/60 text-sm leading-relaxed">Representa un indicador de alerta temporal. Aunque suele estabilizarse, requiere cuidado preventivo post-parto.</p>
    //                 </div>
    //                 <div className="group">
    //                   <span className="text-[#6B8E7D] font-inter text-[11px] tracking-[0.2em] mb-4 block font-medium uppercase">Prediabetes</span>
    //                   <h3 className="text-2xl font-playfair text-[#2C332B] mb-3 group-hover:text-[#6B8E7D] transition-colors">La Ventana de Acción</h3>
    //                   <p className="font-inter font-light text-[#2C332B]/60 text-sm leading-relaxed">Etapa de alerta temprana. Es la oportunidad dorada, ya que es cien por ciento reversible si se detecta a tiempo.</p>
    //                 </div>
    //               </div>
    //             </div>
    //         </motion.section>

    //         {/* SECCIÓN ESTADÍSTICAS Y TESTIMONIOS (MANTENIDA INTACTA) */}
    //         <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-20 w-full border-t border-[#2C332B]/5">
                
    //             <div className="text-center mb-10 md:mb-16 relative bg-[#F8F6F0] p-4 rounded-[3rem]">
    //                 <h2 className="text-3xl md:text-4xl font-playfair mb-3 md:mb-4 text-[#2C332B]">El Impacto Prevenia</h2>
    //                 <p className="text-sm md:text-base text-[#2C332B]/70 font-inter max-w-2xl mx-auto">Más que números, somos una comunidad enfocada en la longevidad y el bienestar preventivo.</p>
    //             </div>
    //             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center mb-16">
    //                 <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white">
    //                     <div className="text-4xl md:text-5xl font-playfair text-[#2C332B]">85%</div>
    //                     <p className="mt-2 text-xs md:text-sm font-inter font-medium uppercase tracking-widest text-[#2C332B]/60">Precisión predictiva</p>
    //                 </div>
    //                 <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white">
    //                     <div className="text-4xl md:text-5xl font-playfair text-[#2C332B]">5000+</div>
    //                     <p className="mt-2 text-xs md:text-sm font-inter font-light text-[#2C332B]/80">Evaluaciones</p>
    //                 </div>
    //                 <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white">
    //                     <div className="text-4xl md:text-5xl font-playfair text-[#2C332B]">24/7</div>
    //                     <p className="mt-2 text-xs md:text-sm font-inter font-light text-[#2C332B]/80">Disponibilidad</p>
    //                 </div>
    //             </div>

    //             {/* Testimonios */}
    //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //               {testimonials.map((test, idx) => (
    //                 <div key={idx} className="bg-[#E6EAE5] p-8 rounded-[2rem] shadow-sm relative">
    //                   <svg className="absolute top-6 left-6 w-8 h-8 text-[#6B8E7D]/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
    //                   <p className="text-[#2C332B]/80 font-inter font-light italic leading-relaxed relative z-10 mt-6 mb-6">"{test.text}"</p>
    //                   <div className="flex items-center gap-3">
    //                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-playfair text-[#6B8E7D] border border-white shadow-sm">{test.author.charAt(0)}</div>
    //                     <div>
    //                       <p className="text-sm font-medium text-[#2C332B]">{test.author}</p>
    //                       <p className="text-[10px] uppercase tracking-widest text-[#6B8E7D]">{test.label}</p>
    //                     </div>
    //                   </div>
    //                 </div>
    //               ))}
    //             </div>
    //         </motion.section>

    //         {/* SECCIÓN FAQ (MANTENIDA INTACTA) */}
    //         <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="w-full max-w-4xl mx-auto px-6 py-16 md:py-24 relative z-20">
    //           <div className="mb-16">
    //             <h2 className="text-4xl md:text-5xl font-playfair text-[#2C332B] mb-12 text-center tracking-tight">Transparencia Total</h2>
                
    //             <div className="border-t border-[#2C332B]/10">
    //               {faqs.map((faq, index) => (
    //                 <div key={index} className="border-b border-[#2C332B]/10">
    //                   <button 
    //                     onClick={() => setOpenFaq(openFaq === index ? null : index)}
    //                     className="w-full flex items-center justify-between py-8 text-left focus:outline-none group"
    //                   >
    //                     <span className="font-playfair text-xl md:text-2xl text-[#2C332B] group-hover:text-[#6B8E7D] transition-colors pr-4">{faq.question}</span>
    //                     <ChevronDown className={`w-5 h-5 text-[#2C332B]/40 transition-transform duration-500 ${openFaq === index ? "rotate-180 text-[#6B8E7D]" : ""}`} />
    //                   </button>
    //                   <AnimatePresence>
    //                     {openFaq === index && (
    //                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
    //                         <div className="pb-8 font-inter font-light text-[#2C332B]/60 text-sm md:text-base leading-relaxed md:pr-12">
    //                           {faq.answer}
    //                         </div>
    //                       </motion.div>
    //                     )}
    //                   </AnimatePresence>
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         </motion.section>

    //         {/* SECCIÓN ENFOQUE Y CTA FINAL (MANTENIDA INTACTA) */}
    //         <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto px-6 pt-10 md:pt-16 pb-24 md:pb-32 text-center relative z-20 border-t border-[#2C332B]/5">
    //             <div className="relative z-30 text-center flex flex-col items-center">
    //                 <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-8 md:mb-12 relative z-30">Nuestro Enfoque</h2>
    //                 <div className="space-y-3 md:space-y-4 font-playfair text-lg md:text-xl text-[#2C332B]/80 font-light leading-relaxed relative z-30">
    //                     <p className="text-[#6B8E7D] italic mb-4 font-medium">Creemos que...</p>
    //                     <p>La prevención cultiva la paz interior.</p>
    //                     <p>La claridad clínica es el camino al equilibrio.</p>
    //                     <p>El autocuidado no es un lujo, es una necesidad.</p>
    //                     <p>Prevenir a tiempo transforma vidas.</p>
    //                     <p>La IA debe guiar con empatía, no asustar.</p>
    //                     <p>Cada cuerpo es un ecosistema único.</p>
    //                 </div>
    //             </div>
                
    //             <div className="mt-12 md:mt-16 relative z-30 inline-block w-full sm:w-auto">
    //                 <Link href="/diagnostic" className="relative z-30 w-full sm:w-auto">
    //                     <button className="group w-full sm:w-auto px-10 py-5 rounded-full bg-[#2C332B] text-white text-sm hover:bg-[#6B8E7D] transition-all duration-500 font-inter font-light tracking-wide shadow-xl hover:-translate-y-1 flex justify-center items-center gap-3 relative z-30">
    //                         Iniciar Evaluación
    //                         <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
    //                     </button>
    //                 </Link>
    //             </div>
    //         </motion.section>

    //     </div> 
    //   </motion.div>
    // </div>


    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]">
      <h1 className="text-3xl font-playfair text-[#2C332B]">
        Prevenia estará disponible muy pronto. 🚀
      </h1>
    </div>
  );
}