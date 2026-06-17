"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react"; 
import Image from "next/image"; 

export default function LandingPage() {
  const { scrollY } = useScroll();
  const parallaxUp = useTransform(scrollY, [0, 1000], [0, 100]);
  const parallaxDown = useTransform(scrollY, [0, 1000], [0, -100]);

  const { scrollYProgress } = useScroll();
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120, 
    damping: 20,    
    restDelta: 0.001
  });

  const acceleratedProgress = useTransform(smoothProgress, [0, 0.8, 1], [0, 0.8, 1.05]);

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } }
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
    <div className="relative w-full flex flex-col items-center min-h-screen overflow-hidden bg-[#F8F6F0]">
      
      {/* Ambient Blurs */}
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#EAE2D0] w-[40rem] h-[40rem] top-0 left-[-10rem] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#DDE6DE] w-[30rem] h-[30rem] top-[20%] right-[-5rem] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ filter: "blur(25px)", opacity: 0, scale: 0.99 }}
        animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col items-center relative z-20"
      >
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-16 md:pb-24 md:pt-40 relative z-30 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
            <div className="w-full md:w-1/2 flex flex-col items-center text-center md:items-start md:text-left mt-8 md:mt-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[#6B8E7D]/20 text-[#6B8E7D] text-[10px] sm:text-xs font-inter font-medium uppercase tracking-widest mb-6 shadow-sm backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B8E7D] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B8E7D]"></span>
                    </span>
                    Inteligencia Artificial Médica
                </div>

                <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2C332B] tracking-tight mb-4 md:mb-6 leading-[1.1] sm:leading-[1.1]">
                    Tu salud metabólica,<br className="hidden sm:block"/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B8E7D] to-[#4A6357] italic"> comprendida a tiempo.</span>
                </h1>
                
                <p className="text-base sm:text-lg text-[#2C332B]/70 font-inter font-light max-w-lg leading-relaxed mb-8 md:mb-10 px-4 md:px-0">
                    Prevenia cruza tus biomarcadores con literatura clínica oficial mediante Inteligencia Artificial para evaluar tu riesgo en menos de 2 minutos.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 md:px-0">
                    <Link href="/diagnostic" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-8 py-4 bg-[#2C332B] text-white rounded-full font-inter font-light text-sm hover:bg-[#6B8E7D] transition-all shadow-md flex items-center justify-center gap-2">
                            Iniciar Evaluación Gratuita
                        </button>
                    </Link>
                </div>
            </div>

            <div className="w-full md:w-1/2 relative flex justify-center mt-12 md:mt-0 px-4 md:px-0">
                <motion.div style={{ y: parallaxUp }} className="relative w-full aspect-square max-w-[18rem] sm:max-w-md mx-auto rounded-[2rem] sm:rounded-[3rem] bg-[#E6EAE5] overflow-hidden shadow-xl">
                    <Image 
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
                        alt="Prevenia IA Dashboard" 
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-90" 
                    />
                </motion.div>
            </div>
        </section>

        {/* CONTENEDOR HILO */}
        <div className="relative w-full flex flex-col items-center">
            
            <div className="absolute top-0 bottom-[8.5rem] left-1/2 -translate-x-1/2 w-full max-w-4xl hidden md:block z-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <path d="M 50 0 C 80 5, 80 15, 50 20 C 20 25, 20 35, 50 40 C 80 45, 80 55, 50 60 C 20 65, 20 75, 50 80 L 50 100" stroke="#6B8E7D" strokeWidth="0.15" fill="none" strokeOpacity="0.2" />
                    <motion.path d="M 50 0 C 80 5, 80 15, 50 20 C 20 25, 20 35, 50 40 C 80 45, 80 55, 50 60 C 20 65, 20 75, 50 80 L 50 100" stroke="#6B8E7D" strokeWidth="0.5" fill="none" filter="url(#glow)" style={{ pathLength: acceleratedProgress }} />
                </svg>
            </div>

            {/* SECCIÓN IMÁGENES INTERCALADAS (BUG DE MARGEN SOLUCIONADO) */}
            <section className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-24 md:space-y-32 relative z-20 w-full">
                
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row items-center gap-8 md:gap-24">
                    <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-[#EFECE5] shadow-sm hover:shadow-md transition relative">
                        {/* 🚀 EL COLCHÓN AUMENTADO AL 180% y offset al 40% */}
                        <motion.div style={{ y: parallaxDown }} className="absolute inset-0 h-[180%] w-full -top-[40%]">
                            <Image src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" fill className="object-cover opacity-90" alt="Yoga/Salud" sizes="(max-width: 768px) 100vw, 50vw" />
                        </motion.div>
                    </div>
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <span className="text-2xl md:text-3xl font-playfair text-[#6B8E7D] mb-2 block italic">01</span>
                        <h2 className="text-2xl md:text-3xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Evaluación IA Inteligente</h2>
                        <p className="text-xs md:text-sm font-inter font-light text-[#2C332B]/70 uppercase tracking-widest">Tu Salud, Evaluada con Precisión</p>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-24">
                    <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-[#E6ECE9] shadow-sm hover:shadow-md transition relative">
                        {/* 🚀 EL COLCHÓN AUMENTADO AL 180% */}
                        <motion.div style={{ y: parallaxDown }} className="absolute inset-0 h-[180%] w-full -top-[40%]">
                            <Image src="https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?auto=format&fit=crop&q=80&w=600" fill className="object-cover opacity-90" alt="Naturaleza/Ciencia" sizes="(max-width: 768px) 100vw, 50vw" />
                        </motion.div>
                    </div>
                    <div className="w-full md:w-1/2 text-center md:text-left md:pl-12">
                        <span className="text-2xl md:text-3xl font-playfair text-[#6B8E7D] mb-2 block italic">02</span>
                        <h2 className="text-2xl md:text-3xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Conocimiento Médico Real</h2>
                        <p className="text-xs md:text-sm font-inter font-light text-[#2C332B]/70 uppercase tracking-widest">Respaldado por Guías Clínicas</p>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row items-center gap-8 md:gap-24">
                    <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition relative">
                        {/* 🚀 EL COLCHÓN AUMENTADO AL 180% */}
                        <motion.div style={{ y: parallaxDown }} className="absolute inset-0 h-[180%] w-full -top-[40%]">
                            <Image src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600" fill className="object-cover opacity-80" alt="Tranquilidad" sizes="(max-width: 768px) 100vw, 50vw" />
                        </motion.div>
                    </div>
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <span className="text-2xl md:text-3xl font-playfair text-[#6B8E7D] mb-2 block italic">03</span>
                        <h2 className="text-2xl md:text-3xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Privacidad Absoluta</h2>
                        <p className="text-xs md:text-sm font-inter font-light text-[#2C332B]/70 uppercase tracking-widest">Sumérgete en la Tranquilidad</p>
                    </div>
                </motion.div>
            </section>

            {/* SECCIÓN EDUCATIVA */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 mt-8 md:mt-10 relative z-20 w-full">
                <div className="text-center mb-10 md:mb-16 relative bg-[#F8F6F0] p-4 md:p-6 rounded-[2rem] sm:rounded-[3rem]">
                    <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-3 md:mb-4 tracking-tight">Comprende tu cuerpo</h2>
                    <p className="text-base md:text-lg text-[#2C332B]/60 font-inter font-light max-w-2xl mx-auto">Conoce los diferentes tipos de condiciones metabólicas. La educación y la claridad son el primer gran paso hacia una vida equilibrada.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#E6EAE5]/50 rounded-full blur-2xl -z-10"></div>
                        <span className="text-xl md:text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">01.</span>
                        <h3 className="text-xl md:text-2xl font-playfair text-[#2C332B] mb-3 md:mb-4">Diabetes Tipo 1</h3>
                        <p className="text-sm md:text-base text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Condición autoinmune donde el páncreas cesa la producción de insulina. Suele ser diagnosticada en etapas tempranas de la vida y requiere un acompañamiento médico constante.</p>
                    </div>
                    
                    <div className="p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-[#EFECE5] shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#DDE6DE]/50 rounded-full blur-2xl -z-10"></div>
                        <span className="text-xl md:text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">02.</span>
                        <h3 className="text-xl md:text-2xl font-playfair text-[#2C332B] mb-3 md:mb-4">Diabetes Tipo 2</h3>
                        <p className="text-sm md:text-base text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Afección crónica vinculada a la resistencia a la insulina. Está altamente influenciada por la edad y el estilo de vida. Es frecuentemente prevenible adoptando hábitos equilibrados.</p>
                    </div>

                    <div className="p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-[#E6ECE9] shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/50 rounded-full blur-2xl -z-10"></div>
                        <span className="text-xl md:text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">03.</span>
                        <h3 className="text-xl md:text-2xl font-playfair text-[#2C332B] mb-3 md:mb-4">Gestacional</h3>
                        <p className="text-sm md:text-base text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Se desarrolla exclusivamente durante el embarazo. Aunque los niveles suelen estabilizarse tras el parto, representa un indicador de alerta para el futuro cuidado metabólico.</p>
                    </div>

                    <div className="p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-[#E6EAE5] shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/50 rounded-full blur-2xl -z-10"></div>
                        <span className="text-xl md:text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">04.</span>
                        <h3 className="text-xl md:text-2xl font-playfair text-[#2C332B] mb-3 md:mb-4">Prediabetes</h3>
                        <p className="text-sm md:text-base text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Etapa donde los niveles de glucosa son más altos de lo habitual. Es la ventana dorada de oportunidad, ya que es cien por ciento reversible si se detecta y actúa a tiempo.</p>
                    </div>
                </div>
            </motion.section>

            {/* SECCIÓN ESTADÍSTICAS Y TESTIMONIOS */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-20 w-full">
                
                <div className="text-center mb-10 md:mb-16 relative bg-[#F8F6F0] p-4 rounded-[3rem]">
                    <h2 className="text-3xl md:text-4xl font-playfair mb-3 md:mb-4 text-[#2C332B]">El Impacto Prevenia</h2>
                    <p className="text-sm md:text-base text-[#2C332B]/70 font-inter max-w-2xl mx-auto">Más que números, somos una comunidad enfocada en la longevidad y el bienestar preventivo.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center mb-16">
                    <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white">
                        <div className="text-4xl md:text-5xl font-playfair text-[#2C332B]">85%</div>
                        <p className="mt-2 text-xs md:text-sm font-inter font-light text-[#2C332B]/80">Precisión predictiva</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white">
                        <div className="text-4xl md:text-5xl font-playfair text-[#2C332B]">5000+</div>
                        <p className="mt-2 text-xs md:text-sm font-inter font-light text-[#2C332B]/80">Evaluaciones</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white">
                        <div className="text-4xl md:text-5xl font-playfair text-[#2C332B]">24/7</div>
                        <p className="mt-2 text-xs md:text-sm font-inter font-light text-[#2C332B]/80">Disponibilidad</p>
                    </div>
                </div>

                {/* Testimonios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((test, idx) => (
                    <div key={idx} className="bg-[#E6EAE5] p-8 rounded-[2rem] shadow-sm relative">
                      <svg className="absolute top-6 left-6 w-8 h-8 text-[#6B8E7D]/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                      <p className="text-[#2C332B]/80 font-inter font-light italic leading-relaxed relative z-10 mt-6 mb-6">"{test.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-playfair text-[#6B8E7D] border border-white shadow-sm">{test.author.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-[#2C332B]">{test.author}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#6B8E7D]">{test.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

            </motion.section>

            {/* SECCIÓN FAQ */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-4xl mx-auto px-6 py-12 md:py-16 relative z-20 w-full">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-3">Preguntas Frecuentes</h2>
                <p className="text-sm md:text-base text-[#2C332B]/60 font-inter font-light">Todo lo que necesitas saber antes de comenzar tu evaluación.</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-[2rem] shadow-sm border border-white overflow-hidden transition-all">
                    <button 
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                    >
                      <span className="font-playfair text-lg text-[#2C332B] group-hover:text-[#6B8E7D] transition-colors">{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-[#6B8E7D] transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-0 text-[#2C332B]/70 font-inter font-light text-sm leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* SECCIÓN ENFOQUE Y CTA FINAL */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto px-6 pt-10 md:pt-16 pb-24 md:pb-32 text-center relative z-20">
                <div className="relative z-30 text-center flex flex-col items-center">
                    <h2 className="text-3xl md:text-4xl font-playfair text-[#2C332B] mb-8 md:mb-12 relative z-30">Nuestro Enfoque</h2>
                    <div className="space-y-3 md:space-y-4 font-playfair text-lg md:text-xl text-[#2C332B]/80 font-light leading-relaxed relative z-30">
                        <p>Creemos que...</p>
                        <p>La prevención cultiva la paz interior.</p>
                        <p>La claridad clínica es el camino al equilibrio.</p>
                        <p>El autocuidado no es un lujo, es una necesidad.</p>
                        <p>Prevenir a tiempo transforma vidas.</p>
                        <p>La IA debe guiar con empatía, no asustar.</p>
                        <p>Cada cuerpo es un ecosistema único.</p>
                    </div>
                </div>
                
                <div className="mt-12 md:mt-16 relative z-30 inline-block w-full sm:w-auto">
                    <Link href="/diagnostic" className="relative z-30 w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2C332B] text-white text-sm hover:bg-[#6B8E7D] transition duration-300 font-inter font-light tracking-wide shadow-md relative z-30">
                            Iniciar Evaluación Gratuita
                        </button>
                    </Link>
                </div>
            </motion.section>

        </div> 
      </motion.div>
    </div>
  );
}