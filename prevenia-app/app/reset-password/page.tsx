"use client";

import { useState, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // 👈 Importamos sesión
import Link from "next/link";
import toast from "react-hot-toast";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-[#2C332B]/10">
        <p className="text-red-500 font-inter mb-4">Enlace de seguridad inválido o caducado.</p>
        <Link href="/forgot-password">
          <button className="bg-[#2C332B] text-white px-6 py-2 rounded-full font-inter text-sm hover:bg-[#6B8E7D] transition">Volver a intentar</button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Actualizando contraseña...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Contraseña actualizada correctamente.", { id: toastId });
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(data.error || "Error al actualizar.", { id: toastId });
      }
    } catch (error) {
      toast.error("Error de conexión.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-10 rounded-3xl shadow-sm border border-[#2C332B]/10 flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-[#6B8E7D] mb-4" />
        <h2 className="text-2xl font-playfair text-[#2C332B] mb-2">¡Todo listo!</h2>
        <p className="text-sm font-inter text-[#2C332B]/60 mb-6">Tu contraseña ha sido blindada y actualizada con éxito.</p>
        <p className="text-xs font-inter text-[#2C332B]/40 animate-pulse">Redirigiendo al inicio de sesión...</p>
      </motion.div>
    );
  }

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-6 w-full bg-white/90 backdrop-blur-md p-10 sm:p-14 rounded-[3rem] shadow-sm border border-white">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#6B8E7D]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#6B8E7D]/20">
          <KeyRound className="w-8 h-8 text-[#6B8E7D]" />
        </div>
        <h2 className="text-2xl font-playfair text-[#2C332B]">Nueva Contraseña</h2>
        <p className="text-sm font-inter text-[#2C332B]/60 mt-2">Crea una nueva contraseña segura para tu cuenta.</p>
      </div>

      <div className="relative group">
        <input type={showPassword ? "text" : "password"} placeholder="Nueva Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 pr-12 bg-[#F8F6F0] border border-transparent focus:outline-none focus:border-[#6B8E7D] focus:bg-white rounded-2xl transition text-sm font-inter text-[#2C332B]" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#2C332B]/40 hover:text-[#6B8E7D] transition-colors focus:outline-none">
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="relative group">
        <input type={showPassword ? "text" : "password"} placeholder="Confirmar Contraseña" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-4 pr-12 bg-[#F8F6F0] border border-transparent focus:outline-none focus:border-[#6B8E7D] focus:bg-white rounded-2xl transition text-sm font-inter text-[#2C332B]" />
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition shadow-md disabled:opacity-50 flex items-center justify-center">
        {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Guardar y Entrar"}
      </button>
    </motion.form>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { status } = useSession();

  // 🛡️ EL CADENERO INVERSO GLOBAL
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // PANTALLA DE CARGA DE SEGURIDAD
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
      <div className="w-full max-w-md relative z-10">
        <Suspense fallback={<div className="text-center p-10"><div className="w-8 h-8 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin mx-auto" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}