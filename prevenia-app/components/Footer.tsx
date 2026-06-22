"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react"; 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

export default function Footer() {
    const pathname = usePathname();
    const { data: session } = useSession(); 
    
    // Control del Pop-up Legal
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    // Ocultar en pantallas de sistema
    if (pathname.startsWith("/login")||pathname.startsWith("/admin") || pathname.startsWith("/register") || pathname.startsWith("/terms") || pathname.startsWith("/privacy") || pathname.startsWith("/reset-password") || pathname.startsWith("/forgot-password") || pathname.startsWith("/dashboard") || pathname.startsWith("/diagnostic")) {
        return null;
    }

    return (
        <>
            <footer className="w-full bg-[#EAE2D0]/40 border-t border-[#2C332B]/10 pt-16 pb-8 mt-10 relative z-30">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
                    
                    {/* Columna Izquierda: Logo Oficial y Descripción */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-10 h-10">
                                <Image 
                                    src="/prevenialogo_x16.png" 
                                    alt="Prevenia Logo" 
                                    fill 
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="text-2xl font-playfair tracking-wide text-[#2C332B]">Prevenia</span>
                        </div>
                        <p className="text-[#2C332B]/60 font-inter font-light max-w-sm leading-relaxed">
                            Donde la prevención encuentra la claridad. Una herramienta de apoyo impulsada por IA médica diseñada para tu tranquilidad.
                        </p>
                    </div>
                    
                    {/* Columna Central: Navegación Inteligente */}
                    <div>
                        <h4 className="font-playfair text-[#2C332B] text-lg mb-4">Explorar</h4>
                        <ul className="space-y-3 text-[#2C332B]/60 font-inter font-light">
                            <li><Link href="/diagnostic" className="hover:text-[#6B8E7D] transition">Evaluación Predictiva</Link></li>
                            <li>
                                <Link href={session ? "/dashboard" : "/login"} className="hover:text-[#6B8E7D] transition">
                                    {session ? "Mi Panel Médico" : "Portal del Paciente"}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna Derecha: Legal y Clínico */}
                    <div>
                        <h4 className="font-playfair text-[#2C332B] text-lg mb-4">Clínico & Legal</h4>
                        <ul className="space-y-3 text-[#2C332B]/60 font-inter font-light">
                            <li><Link href="/privacy" className="hover:text-[#6B8E7D] transition">Políticas de Privacidad</Link></li>
                            <li><Link href="/terms" className="hover:text-[#6B8E7D] transition">Términos y Condiciones</Link></li>
                            <li><Link href="#" className="hover:text-[#6B8E7D] transition">Seguridad en IA</Link></li>
                            {/* NUEVO BOTÓN DE DERECHOS DE AUTOR */}
                            <li>
                                <button 
                                    onClick={() => setIsLegalModalOpen(true)} 
                                    className="hover:text-[#6B8E7D] transition text-left"
                                >
                                    Derechos de Autor (TDM)
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer y Copyright */}
                <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-[#2C332B]/10 text-center text-xs text-[#2C332B]/40 font-inter font-light tracking-wide">
                    &copy; {new Date().getFullYear()} Prevenia Healthtech. Esta plataforma no sustituye el diagnóstico oficial de un médico certificado.
                </div>
            </footer>

            {/* 🛡️ MODAL / POP-UP LEGAL */}
            <AnimatePresence>
                {isLegalModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C332B]/60 backdrop-blur-md px-4"
                        onClick={() => setIsLegalModalOpen(false)} // Cierra al hacer click afuera
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Evita que se cierre al clickear dentro de la tarjeta
                            className="bg-[#F8F6F0] w-full max-w-xl p-8 md:p-10 rounded-[3rem] shadow-2xl relative border border-white"
                        >
                            <button onClick={() => setIsLegalModalOpen(false)} className="absolute top-6 right-6 text-[#2C332B]/40 hover:text-[#2C332B] bg-white rounded-full p-2 transition-colors shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="w-16 h-16 bg-[#6B8E7D]/10 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldAlert className="text-[#6B8E7D] w-8 h-8" />
                            </div>
                            
                            <h2 className="text-2xl md:text-3xl font-playfair text-[#2C332B] mb-2 tracking-tight">
                                Minería de Textos y Datos (TDM)
                            </h2>
                            <p className="text-[10px] md:text-xs font-inter uppercase tracking-widest text-[#6B8E7D] font-medium mb-6">
                                Aviso de Uso Justo (Fair Use)
                            </p>
                            
                            <p className="text-sm font-inter font-light text-[#2C332B]/70 leading-relaxed text-justify">
                                Prevenia utiliza algoritmos de Inteligencia Artificial para el análisis de literatura clínica y documentos médicos públicos. Este procesamiento se realiza estrictamente bajo la doctrina de <strong>"Uso Justo" (Fair Use)</strong> y las normativas internacionales de <strong>Minería de Textos y Datos (TDM)</strong> para fines de investigación no comercial y educación en salud pública. 
                                <br/><br/>
                                Prevenia <strong>no almacena, distribuye ni comercializa</strong> obras protegidas por derechos de autor. Los resultados generados son resúmenes estadísticos preventivos y no constituyen un diagnóstico médico definitivo ni receta clínica.
                            </p>

                            <div className="mt-8 pt-6 border-t border-[#2C332B]/10 flex justify-end">
                                <button 
                                    onClick={() => setIsLegalModalOpen(false)}
                                    className="px-8 py-3 bg-[#2C332B] text-white rounded-full font-inter font-light text-sm hover:bg-[#6B8E7D] transition-colors shadow-md"
                                >
                                    Comprendido
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}