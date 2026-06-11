"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react"; 
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return "Paciente";
    return fullName.split(" ")[0];
  };

  return (
    // CONTENEDOR FLOTANTE
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4">
      
      {/* LA PÍLDORA ACRÍLICA (Glassmorphism + Rounded Full) */}
      <header className="bg-white/80 backdrop-blur-md border border-white/60 shadow-sm rounded-full px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO DE PREVENIA */}
<Link href="/" className="flex items-center gap-2 group">
  <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
    <Image
      src="/prevenialogo_x16.png" // Asegúrate de que el nombre coincida con tu archivo en public/
      alt="Logo oficial de Prevenia"
      fill
      sizes="(max-width: 768px) 100vw, 40px"
      className="object-contain"
      priority
    />
  </div>
  <span className="font-playfair text-xl tracking-wide text-[#2C332B]">
    Prevenia
  </span>
</Link>

        {/* MENÚ CENTRAL DE NAVEGACIÓN */}
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

        {/* ACCIONES DE SESIÓN DERECHA */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            // Spinner de carga sutil
            <div className="w-6 h-6 border-2 border-[#6B8E7D] border-t-transparent rounded-full animate-spin" />
          ) : session ? (
            // CASO A: El usuario ya inició sesión
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 group hover:bg-white/60 py-1 px-2 rounded-full transition-all">
                {/* Avatar */}
                {session.user?.image ? (
                  <img src={session.user.image} alt="Perfil" className="w-7 h-7 rounded-full object-cover border border-[#2C332B]/10 shadow-sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#6B8E7D]/10 flex items-center justify-center text-[#6B8E7D] text-[10px] font-medium">
                    {session.user?.name?.charAt(0) || "P"}
                  </div>
                )}
                {/* Nombre */}
                <span className="text-sm font-inter font-medium text-[#2C332B] group-hover:text-[#6B8E7D] transition-colors">
                  {getFirstName(session.user?.name)}
                </span>
              </Link>
              
              <span className="text-[#2C332B]/10">|</span>
              
              {/* BOTÓN PARA CERRAR SESIÓN */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[10px] uppercase tracking-widest text-[#2C332B]/40 hover:text-red-500 transition-colors font-inter font-medium"
              >
                Salir
              </button>
            </div>
          ) : (
            // CASO B: No hay sesión activa (Usuario invitado)
            <Link href="/login">
              <button className="bg-[#2C332B] text-white px-6 py-2.5 rounded-full text-xs font-inter font-light uppercase tracking-widest hover:bg-[#6B8E7D] transition-all shadow-sm hover:shadow-md duration-300">
                Iniciar Sesión
              </button>
            </Link>
          )}
        </div>

      </header>
    </div>
  );
}