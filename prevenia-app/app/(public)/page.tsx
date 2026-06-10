"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LandingPage() {
  // Configuración de Framer Motion para el efecto Parallax
  const { scrollY } = useScroll();
  const parallaxUp = useTransform(scrollY, [0, 1000], [0, 100]);
  const parallaxDown = useTransform(scrollY, [0, 1000], [0, -100]);

  // Animación de entrada suave al hacer scroll (reemplaza al IntersectionObserver)
  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } }
  };

  return (
    <div className="relative w-full flex flex-col items-center min-h-screen overflow-hidden bg-[#F8F6F0]">
      
      {/* 1. Ambient Blurs de Fondo */}
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#EAE2D0] w-[40rem] h-[40rem] top-0 left-[-10rem] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#DDE6DE] w-[30rem] h-[30rem] top-[20%] right-[-5rem] -z-10 pointer-events-none" />

      {/* 2. Animación Inicial (Efecto Blur Intro de tu CSS) */}
      <motion.div 
        initial={{ filter: "blur(25px)", opacity: 0, scale: 0.99 }}
        animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col items-center"
      >
        
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-24 md:pt-40 pb-24 text-center relative z-20">
            <h1 className="font-playfair text-5xl md:text-6xl text-[#2C332B] tracking-tight mb-8 leading-tight">
                Donde la Prevención <br /> Encuentra la Claridad.
            </h1>
            <p className="text-lg text-[#2C332B]/70 font-inter font-light max-w-2xl mx-auto leading-relaxed mb-12">
                Encuentra un respiro frente a la incertidumbre y reconecta con tu salud metabólica. Nuestro enfoque único, impulsado por inteligencia artificial clínica, te guía hacia una vida de equilibrio y bienestar preventivo.
            </p>
            {/* Foto Pequeña Central con Parallax */}
            <div className="w-24 h-24 mx-auto rounded-[3rem] bg-[#E6EAE5] flex items-center justify-center mb-12 shadow-sm overflow-hidden">
                <motion.img 
                  style={{ y: parallaxUp }} 
                  src="https://images.unsplash.com/photo-1498837167922-41c373b526f8?auto=format&fit=crop&q=80&w=200" 
                  alt="Equilibrio" 
                  className="w-full h-[150%] object-cover opacity-80" 
                />
            </div>
        </section>

        {/* SECCIÓN IMÁGENES INTERCALADAS */}
        <section className="max-w-5xl mx-auto px-6 py-16 space-y-32 relative z-20 w-full">
            
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                <div className="w-full md:w-1/2 h-80 rounded-[3rem] overflow-hidden bg-[#EFECE5] shadow-sm hover:shadow-md transition">
                    <motion.img style={{ y: parallaxDown }} src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" className="w-full h-[150%] object-cover opacity-90" alt="Yoga/Salud" />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <span className="text-3xl font-playfair text-[#6B8E7D] mb-2 block italic">01</span>
                    <h2 className="text-3xl font-playfair text-[#2C332B] mb-4 tracking-tight">Evaluación IA Inteligente</h2>
                    <p className="text-sm font-inter font-light text-[#2C332B]/70 uppercase tracking-widest">Tu Salud, Evaluada con Precisión</p>
                </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                <div className="w-full md:w-1/2 h-80 rounded-[3rem] overflow-hidden bg-[#E6ECE9] shadow-sm hover:shadow-md transition">
                    <motion.img style={{ y: parallaxDown }} src="https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?auto=format&fit=crop&q=80&w=600" className="w-full h-[150%] object-cover opacity-90" alt="Naturaleza/Ciencia" />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left md:pl-12">
                    <span className="text-3xl font-playfair text-[#6B8E7D] mb-2 block italic">02</span>
                    <h2 className="text-3xl font-playfair text-[#2C332B] mb-4 tracking-tight">Conocimiento Médico Real</h2>
                    <p className="text-sm font-inter font-light text-[#2C332B]/70 uppercase tracking-widest">Respaldado por Guías Clínicas</p>
                </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                <div className="w-full md:w-1/2 h-80 rounded-[3rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                    <motion.img style={{ y: parallaxDown }} src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600" className="w-full h-[150%] object-cover opacity-80" alt="Tranquilidad" />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <span className="text-3xl font-playfair text-[#6B8E7D] mb-2 block italic">03</span>
                    <h2 className="text-3xl font-playfair text-[#2C332B] mb-4 tracking-tight">Privacidad Absoluta</h2>
                    <p className="text-sm font-inter font-light text-[#2C332B]/70 uppercase tracking-widest">Sumérgete en la Tranquilidad</p>
                </div>
            </motion.div>

        </section>

        {/* SECCIÓN EDUCATIVA (Squircles / Organic Shapes) */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-6 py-24 mt-10 relative z-20 w-full">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-playfair text-[#2C332B] mb-4 tracking-tight">Comprende tu cuerpo</h2>
                <p className="text-lg text-[#2C332B]/60 font-inter font-light max-w-2xl mx-auto">Conoce los diferentes tipos de condiciones metabólicas. La educación y la claridad son el primer gran paso hacia una vida equilibrada.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 rounded-[3rem] bg-white shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#E6EAE5]/50 rounded-full blur-2xl -z-10"></div>
                    <span className="text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">01.</span>
                    <h3 className="text-2xl font-playfair text-[#2C332B] mb-4">Diabetes Tipo 1</h3>
                    <p className="text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Condición autoinmune donde el páncreas cesa la producción de insulina. Suele ser diagnosticada en etapas tempranas de la vida y requiere un acompañamiento médico constante.</p>
                </div>
                
                <div className="p-10 rounded-[3rem] bg-[#EFECE5] shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#DDE6DE]/50 rounded-full blur-2xl -z-10"></div>
                    <span className="text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">02.</span>
                    <h3 className="text-2xl font-playfair text-[#2C332B] mb-4">Diabetes Tipo 2</h3>
                    <p className="text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Afección crónica vinculada a la resistencia a la insulina. Está altamente influenciada por la edad y el estilo de vida. Es frecuentemente prevenible adoptando hábitos equilibrados.</p>
                </div>

                <div className="p-10 rounded-[3rem] bg-[#E6ECE9] shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/50 rounded-full blur-2xl -z-10"></div>
                    <span className="text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">03.</span>
                    <h3 className="text-2xl font-playfair text-[#2C332B] mb-4">Gestacional</h3>
                    <p className="text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Se desarrolla exclusivamente durante el embarazo. Aunque los niveles suelen estabilizarse tras el parto, representa un indicador de alerta para el futuro cuidado metabólico.</p>
                </div>

                <div className="p-10 rounded-[3rem] bg-[#E6EAE5] shadow-sm border border-transparent hover:border-[#6B8E7D]/30 transition duration-300 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/50 rounded-full blur-2xl -z-10"></div>
                    <span className="text-2xl font-playfair text-[#6B8E7D] mb-2 block italic">04.</span>
                    <h3 className="text-2xl font-playfair text-[#2C332B] mb-4">Prediabetes</h3>
                    <p className="text-[#2C332B]/70 font-inter font-light leading-relaxed relative z-10">Etapa donde los niveles de glucosa son más altos de lo habitual. Es la ventana dorada de oportunidad, ya que es cien por ciento reversible si se detecta y actúa a tiempo.</p>
                </div>
            </div>
        </motion.section>

        {/* SECCIÓN ESTADÍSTICAS */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-6 py-24 relative z-20 w-full">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-playfair mb-4 text-[#2C332B]">IA Preventiva</h2>
                <p className="text-[#2C332B]/70 font-inter max-w-2xl mx-auto">Analizamos factores de riesgo, antecedentes familiares y hábitos para ofrecer orientación preventiva personalizada.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm"><div className="text-5xl font-playfair text-[#2C332B]">85%</div><p className="mt-2 font-inter font-light text-[#2C332B]/80">Precisión predictiva</p></div>
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm"><div className="text-5xl font-playfair text-[#2C332B]">5000+</div><p className="mt-2 font-inter font-light text-[#2C332B]/80">Evaluaciones</p></div>
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm"><div className="text-5xl font-playfair text-[#2C332B]">24/7</div><p className="mt-2 font-inter font-light text-[#2C332B]/80">Disponibilidad</p></div>
            </div>
        </motion.section>

        {/* SECCIÓN ENFOQUE Y CTA */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto px-6 pt-16 pb-32 text-center relative z-20">
            <h2 className="text-4xl font-playfair text-[#2C332B] mb-12">Nuestro Enfoque</h2>
            <div className="space-y-4 font-playfair text-xl text-[#2C332B]/80 font-light leading-relaxed">
                <p>Creemos que...</p>
                <p>La prevención cultiva la paz interior.</p>
                <p>La claridad clínica es el camino al equilibrio.</p>
                <p>El autocuidado no es un lujo, es una necesidad.</p>
                <p>Prevenir a tiempo transforma vidas.</p>
                <p>La IA debe guiar con empatía, no asustar.</p>
                <p>Cada cuerpo es un ecosistema único.</p>
            </div>
            
            <Link href="/diagnostic">
                <button className="mt-16 px-8 py-4 rounded-full bg-[#2C332B] text-white text-sm hover:bg-[#6B8E7D] transition duration-300 font-inter font-light tracking-wide shadow-md">
                    Iniciar Evaluación Gratuita
                </button>
            </Link>
        </motion.section>

      </motion.div>
    </div>
  );
}