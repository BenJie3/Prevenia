"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // 👈 Importamos sesión
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { status } = useSession(); // 👈 Verificamos si hay alguien logueado
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 🛡️ EL CADENERO INVERSO
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingresa un correo válido.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Buscando tu cuenta...");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Correo enviado exitosamente.", { id: toastId });
        setIsSubmitted(true);
      } else {
        toast.error("Hubo un problema al procesar tu solicitud.", { id: toastId });
      }
    } catch (error) {
      toast.error("Error de red. Inténtalo de nuevo.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // PANTALLA DE CARGA DE SEGURIDAD PARA EVITAR DESTELLOS
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 overflow-hidden bg-[#F8F6F0]">
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#EAE2D0] w-[30rem] h-[30rem] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md bg-white/90 backdrop-blur-md p-10 sm:p-14 rounded-[3rem] shadow-sm border border-white relative z-10">
        
        <Link href="/login" className="absolute top-8 left-8 text-[#2C332B]/40 hover:text-[#2C332B] transition p-2 bg-[#F8F6F0] rounded-full">
          <ArrowLeft size={18} />
        </Link>

        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-[#6B8E7D]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#6B8E7D]/20">
            <Mail className="w-8 h-8 text-[#6B8E7D]" />
          </div>
          <h2 className="text-2xl font-playfair text-[#2C332B]">Recuperar Acceso</h2>
          <p className="text-sm font-inter text-[#2C332B]/60 mt-2">Ingresa el correo electrónico asociado a tu cuenta.</p>
        </div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <input 
                  type="email" 
                  placeholder="ejemplo@correo.com" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" 
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Enviar Enlace</>}
              </button>
            </motion.form>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-[#F8F6F0] p-6 rounded-3xl">
              <p className="text-[#2C332B] font-inter text-sm leading-relaxed mb-4">
                Si <strong>{email}</strong> está registrado en nuestro sistema, recibirás un enlace seguro para restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="text-[#2C332B]/50 font-inter text-xs">No olvides revisar tu bandeja de SPAM.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}