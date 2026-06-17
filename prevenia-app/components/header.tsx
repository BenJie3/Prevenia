"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react"; 
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // 👈 Añadido para el menú móvil

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // 🛡️ ESTADO: Controla si el menú de celular está abierto o cerrado
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return "Paciente";
    return fullName.split(" ")[0];
  };

  // REGLAS DE ARQUITECTO: Ocultar el Header en pantallas específicas
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/terms") || 
    pathname.startsWith("/privacy") || 
    pathname.startsWith("/reset-password") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    // CONTENEDOR FLOTANTE
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4">
      
      {/* LA PÍLDORA ACRÍLICA PRINCIPAL */}
      <header className="bg-white/80 backdrop-blur-md border border-white/60 shadow-sm rounded-full px-5 md:px-8 h-16 flex items-center justify-between relative z-50">
        
        {/* LOGO DE PREVENIA */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="relative w-9 h-9 md:w-10 md:h-10 transition-transform group-hover:scale-105">
            <Image
              src="/prevenialogo_x16.png" 
              alt="Logo oficial de Prevenia"
              fill
              sizes="(max-width: 768px) 100vw, 40px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-playfair text-lg md:text-xl tracking-wide text-[#2C332B]">
            Prevenia
          </span>
        </Link>

        {/* 💻 MENÚ CENTRAL DE NAVEGACIÓN (Solo visible en Computadoras / Tablets -> md:flex) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-inter font-light text-[#2C332B]/80">
          <Link href="/" className="hover:text-[#6B8E7D] transition-colors">Inicio</Link>
          <Link href="/diagnostic" className="hover:text-[#6B8E7D] transition-colors">Evaluación Predictiva</Link>
          
          {/* REQUISITO: El botón Admin solo aparece si el rol es exactamente ADMIN */}
          {session?.user && (session.user as any).role === "ADMIN" && (
            <Link href="/admin">
              <span className="bg-[#E6EAE5] text-[#6B8E7D] px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-[#6B8E7D] hover:text-white transition-all cursor-pointer shadow-sm">
                Portal Admin
              </span>
            </Link>
          )}
        </nav>

        {/* ACCIONES DE SESIÓN Y HAMBURGUESA */}
        <div className="flex items-center gap-3 md:gap-4">
          {status === "loading" ? (
            <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-[#6B8E7D] border-t-transparent rounded-full animate-spin" />
          ) : session ? (
            // CASO A: Usuario Logueado
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 group hover:bg-white/60 py-1 px-2 rounded-full transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                {/* Avatar */}
                {session.user?.image ? (
                  <img src={session.user.image} alt="Perfil" className="w-7 h-7 rounded-full object-cover border border-[#2C332B]/10 shadow-sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#6B8E7D]/10 flex items-center justify-center text-[#6B8E7D] text-[10px] font-medium">
                    {session.user?.name?.charAt(0) || "P"}
                  </div>
                )}
                {/* Nombre: Oculto en celular para ahorrar espacio (hidden sm:block) */}
                <span className="hidden sm:block text-sm font-inter font-medium text-[#2C332B] group-hover:text-[#6B8E7D] transition-colors">
                  {getFirstName(session.user?.name)}
                </span>
              </Link>
              
              <span className="text-[#2C332B]/10">|</span>
              
              {/* BOTÓN SALIR: Solo ícono en celular, texto en PC */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[#2C332B]/40 hover:text-red-500 transition-colors"
                title="Cerrar Sesión"
              >
                <span className="hidden sm:block text-[10px] uppercase tracking-widest font-inter font-medium">Salir</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            // CASO B: Sin sesión activa
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="bg-[#2C332B] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-inter font-light uppercase tracking-widest hover:bg-[#6B8E7D] transition-all shadow-sm hover:shadow-md duration-300 whitespace-nowrap">
                Iniciar Sesión
              </button>
            </Link>
          )}

          {/* 📱 BOTÓN DE HAMBURGUESA (Solo visible en celular -> md:hidden) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-1.5 ml-1 text-[#2C332B] hover:text-[#6B8E7D] transition-colors bg-[#F8F6F0] rounded-full"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* 📱 PANEL DE MENÚ DESPLEGABLE PARA CELULAR (Animado) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#2C332B]/10 shadow-xl rounded-3xl p-6 flex flex-col gap-4 md:hidden z-40"
          >
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C332B] font-playfair text-xl hover:text-[#6B8E7D] transition flex items-center justify-between">
              Inicio
              <svg className="w-5 h-5 text-[#2C332B]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </Link>
            
            <div className="h-px w-full bg-[#2C332B]/5"></div>
            
            <Link href="/diagnostic" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C332B] font-playfair text-xl hover:text-[#6B8E7D] transition flex items-center justify-between">
              Evaluación Predictiva
              <svg className="w-5 h-5 text-[#2C332B]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </Link>
            
            {session?.user && (session.user as any).role === "ADMIN" && (
              <>
                <div className="h-px w-full bg-[#2C332B]/5"></div>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-[#6B8E7D] font-playfair text-xl hover:text-[#2C332B] transition flex items-center justify-between">
                  Portal Admin
                  <svg className="w-5 h-5 text-[#6B8E7D]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}