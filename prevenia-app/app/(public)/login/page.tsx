"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react"; // <- La magia de NextAuth
import { useRouter } from "next/navigation"; // <- Para redirigir al Dashboard

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. FUNCIÓN: Iniciar sesión con Google (Sirve tanto para registro como para login)
  const handleGoogleLogin = () => {
    setIsLoading(true);
    // signIn le dice a NextAuth que abra la ventana de Google y luego nos lleve al dashboard
    signIn("google", { callbackUrl: "/dashboard" }); 
  };

  // 2. FUNCIÓN: Iniciar sesión tradicional (Correo/Contraseña)
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await signIn("credentials", {
        redirect: false, // Evitamos que la página recargue bruscamente
        email,
        password,
      });

      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        // Si todo sale bien, lo empujamos al dashboard privado
        router.push("/dashboard");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al iniciar sesión." });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FUNCIÓN: Registro tradicional (La que ya teníamos)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "¡Cuenta creada! Por favor inicia sesión." });
        setName(""); setPassword(""); setIsLogin(true); 
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión con el servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 overflow-hidden">
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#EAE2D0] w-[30rem] h-[30rem] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md bg-white/90 backdrop-blur-md p-10 sm:p-14 rounded-[3rem] shadow-sm border border-white relative z-10">
        <Link href="/" className="absolute top-8 right-8 text-[#2C332B]/40 hover:text-[#2C332B] transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </Link>

        {/* Pestañas */}
        <div className="flex justify-center gap-6 mb-8 border-b border-[#2C332B]/10 pb-4">
          <button onClick={() => { setIsLogin(true); setMessage({ type: "", text: "" }); }} className={`text-sm transition ${isLogin ? "font-playfair italic text-[#2C332B]" : "font-inter font-light text-[#2C332B]/40 hover:text-[#2C332B]"}`}>Ingresar</button>
          <button onClick={() => { setIsLogin(false); setMessage({ type: "", text: "" }); }} className={`text-sm transition ${!isLogin ? "font-playfair italic text-[#2C332B]" : "font-inter font-light text-[#2C332B]/40 hover:text-[#2C332B]"}`}>Registrarse</button>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-6 p-3 rounded-2xl text-xs font-inter text-center border ${message.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-[#6B8E7D] border-green-100"}`}>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTÓN DE GOOGLE (Aparece en ambas pestañas) */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full mb-6 flex items-center justify-center gap-3 bg-white border border-[#2C332B]/10 text-[#2C332B] font-inter font-light py-3.5 rounded-full hover:bg-[#F8F6F0] transition shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar con Google
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-[#2C332B]/10"></div>
          <span className="flex-shrink-0 mx-4 text-[#2C332B]/40 text-xs font-inter font-light uppercase tracking-widest">O con correo</span>
          <div className="flex-grow border-t border-[#2C332B]/10"></div>
        </div>

        {/* Formularios Dinámicos */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <form className="space-y-5" onSubmit={handleCredentialsLogin}>
                <div>
                  <input type="email" placeholder="Correo Electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                <div>
                  <input type="password" placeholder="Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition mt-8 tracking-wide shadow-md disabled:opacity-50">
                  {isLoading ? "Iniciando..." : "Acceder"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <form className="space-y-5" onSubmit={handleRegister}>
                <div>
                  <input type="text" placeholder="Nombre Completo" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                <div>
                  <input type="email" placeholder="Correo Electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                <div>
                  <input type="password" placeholder="Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#6B8E7D] text-white font-inter font-light py-4 rounded-full hover:bg-[#2C332B] transition mt-8 tracking-wide shadow-md disabled:opacity-50">
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}