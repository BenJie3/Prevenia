"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

// Separamos la lógica en un componente interno para usar Suspense (Obligatorio en Next.js)
function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No se encontró ningún código de seguridad en el enlace.");
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          
          // 🚀 MAGIA DE TELEPATÍA: Avisar a las otras pestañas
          const channel = new BroadcastChannel('prevenia_auth');
          channel.postMessage('email_verified');
          channel.close();
          
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Ocurrió un error al verificar tu cuenta.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Error de conexión con el servidor.");
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-sm border border-white text-center relative z-10">
      
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-[#6B8E7D] animate-spin mb-6" />
          <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">Autenticando...</h2>
          <p className="text-sm font-inter text-[#2C332B]/60">Validando credenciales de seguridad con el servidor.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#6B8E7D]/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#6B8E7D]" />
          </div>
          <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">¡Identidad Verificada!</h2>
          <p className="text-sm font-inter text-[#2C332B]/60 mb-8 leading-relaxed">
            Tu correo ha sido validado exitosamente. Ahora cuentas con acceso completo a los motores predictivos de Prevenia.
          </p>
          <Link href="/login" className="w-full">
            <button className="w-full bg-[#2C332B] text-white py-4 rounded-full font-inter text-sm hover:bg-[#6B8E7D] transition shadow-md">
              Iniciar Sesión
            </button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">Enlace no válido</h2>
          <p className="text-sm font-inter text-[#2C332B]/60 mb-8 leading-relaxed">
            {errorMessage}
          </p>
          <Link href="/login" className="w-full">
            <button className="w-full bg-white border border-[#2C332B]/20 text-[#2C332B] py-4 rounded-full font-inter text-sm hover:bg-[#F8F6F0] transition shadow-sm">
              Volver al inicio
            </button>
          </Link>
        </div>
      )}

    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#F8F6F0]">
      <div className="absolute rounded-full filter blur-[80px] opacity-60 bg-[#EAE2D0] w-[30rem] h-[30rem] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <Suspense fallback={<div className="w-10 h-10 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}