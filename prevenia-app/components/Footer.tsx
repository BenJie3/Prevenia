"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react"; // 👈 Añadimos la sesión

export default function Footer() {
    const pathname = usePathname();
    const { data: session } = useSession(); // 👈 Leemos el estado del usuario
    
    // 🪄 Si la ruta empieza con /admin, el componente se desvanece por completo
    if (pathname.startsWith("/admin")) {
        return null;
    }

    return (
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
                        
                        {/* 🧠 Enlace Dinámico: Cambia si hay sesión */}
                        <li>
                            <Link href={session ? "/dashboard" : "/login"} className="hover:text-[#6B8E7D] transition">
                                {session ? "Mi Panel Médico" : "Portal del Paciente"}
                            </Link>
                        </li>

                        {/* RAG solo para Admins o lo dejas público si así lo deseas */}
                        {/* <li><Link href="/admin" className="hover:text-[#6B8E7D] transition">Conocimiento RAG</Link></li> */}
                    </ul>
                </div>

                {/* Columna Derecha: Legal y Clínico */}
                <div>
                    <h4 className="font-playfair text-[#2C332B] text-lg mb-4">Clínico & Legal</h4>
                    <ul className="space-y-3 text-[#2C332B]/60 font-inter font-light">
                        <li><Link href="/privacy" className="hover:text-[#6B8E7D] transition">Políticas de Privacidad</Link></li>
                        <li><Link href="#" className="hover:text-[#6B8E7D] transition">Términos Médicos</Link></li>
                        <li><Link href="#" className="hover:text-[#6B8E7D] transition">Seguridad en IA</Link></li>
                    </ul>
                </div>
            </div>

            {/* Disclaimer y Copyright */}
            <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-[#2C332B]/10 text-center text-xs text-[#2C332B]/40 font-inter font-light tracking-wide">
                &copy; {new Date().getFullYear()} Prevenia Healthtech. Esta plataforma no sustituye el diagnóstico oficial de un médico certificado.
            </div>
        </footer>
    );
}