"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react"; 
import { useRouter } from "next/navigation"; 
import toast from "react-hot-toast"; 
import { Eye, EyeOff, Mail } from "lucide-react"; 
import { Turnstile } from '@marsidev/react-turnstile';


export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); 
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  // ESTADO NUEVO PARA LA EXPERIENCIA DE ÉXITO
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      if ((session?.user as any)?.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);
  // 🛡️ MAGIA DE TELEPATÍA: Escuchar si el usuario verifica en otra pestaña
  useEffect(() => {
    if (isRegisteredSuccess) {
      const channel = new BroadcastChannel('prevenia_auth');
      
      channel.onmessage = (event) => {
        if (event.data === 'email_verified') {
          // Si escucha el grito, cambia la pantalla mágicamente
          toast.success("¡Cuenta verificada exitosamente! Ya puedes entrar.");
          setIsRegisteredSuccess(false); // Oculta el mensaje del sobre
          setIsLogin(true); // Regresa al formulario de login
        }
      };

      // Limpieza cuando el componente se desmonta
      return () => channel.close();
    }
  }, [isRegisteredSuccess]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingresa un correo electrónico válido.");
      return false;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" }); 
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const toastId = toast.loading("Verificando credenciales...");

    try {
      const res = await signIn("credentials", {
        redirect: false, 
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("¡Bienvenido de vuelta!", { id: toastId });
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Error interno al iniciar sesión.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("Debes aceptar las políticas de privacidad.");
      return;
    }
    if (!turnstileToken) {
      toast.error("Por favor, espera la validación de seguridad anti-bots.");
      return;
    }
    if (!validateForm()) return;

    setIsLoading(true);
    const toastId = toast.loading("Creando tu cuenta clínica...");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, turnstileToken }), 
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error, { id: toastId });
      } else {
        toast.success("¡Cuenta pre-creada!", { id: toastId });
        // MOSTRAR LA PANTALLA DE ÉXITO EN LUGAR DE REDIRIGIR AL LOGIN DE GOLPE
        setIsRegisteredSuccess(true); 
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

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
        <Link href="/" className="absolute top-8 right-8 text-[#2C332B]/40 hover:text-[#2C332B] transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </Link>

        {/* OCULTAR ELEMENTOS SUPERIORES SI ESTAMOS EN LA PANTALLA DE ÉXITO */}
        {!isRegisteredSuccess && (
          <>
            <div className="flex justify-center gap-6 mb-8 border-b border-[#2C332B]/10 pb-4">
              <button onClick={() => { setIsLogin(true); setEmail(""); setPassword(""); }} className={`text-sm transition ${isLogin ? "font-playfair italic text-[#2C332B]" : "font-inter font-light text-[#2C332B]/40 hover:text-[#2C332B]"}`}>Ingresar</button>
              <button onClick={() => { setIsLogin(false); setEmail(""); setPassword(""); setName(""); }} className={`text-sm transition ${!isLogin ? "font-playfair italic text-[#2C332B]" : "font-inter font-light text-[#2C332B]/40 hover:text-[#2C332B]"}`}>Registrarse</button>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#2C332B]/10 text-[#2C332B] font-inter font-light py-3.5 rounded-full hover:bg-[#F8F6F0] transition shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>

            <div className="flex items-center mt-6 mb-6">
              <div className="flex-grow border-t border-[#2C332B]/10"></div>
              <span className="flex-shrink-0 mx-4 text-[#2C332B]/40 text-xs font-inter font-light uppercase tracking-widest">O con correo</span>
              <div className="flex-grow border-t border-[#2C332B]/10"></div>
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          
          {/* 📧 PANTALLA DE ÉXITO (MENSJAE BONITO) */}
          {isRegisteredSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-20 h-20 bg-[#6B8E7D]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#6B8E7D]/20">
                <Mail className="w-10 h-10 text-[#6B8E7D]" />
              </div>
              <h3 className="text-2xl font-playfair text-[#2C332B] mb-3">Revisa tu bandeja</h3>
              <p className="text-sm font-inter text-[#2C332B]/60 leading-relaxed mb-8">
                Hemos enviado un enlace de activación seguro a <br/><strong className="text-[#2C332B]">{email}</strong>.
                <br/><br/>
                Haz clic en el enlace del correo para verificar tu identidad y poder iniciar sesión.
              </p>
              <button 
                onClick={() => { setIsRegisteredSuccess(false); setIsLogin(true); setEmail(""); setPassword(""); setName(""); }} 
                className="text-xs font-inter font-medium text-[#6B8E7D] hover:text-[#2C332B] transition-colors underline underline-offset-4"
              >
                Ya activé mi cuenta, ir al Login
              </button>
            </motion.div>
          ) : 

          /* 🟢 LOGIN NORMAL */
          isLogin ? (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <form className="space-y-5" onSubmit={handleCredentialsLogin}>
                <div>
                  <input type="email" placeholder="Correo Electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 pr-12 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#2C332B]/40 hover:text-[#6B8E7D] transition-colors focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex justify-end mt-1">
                  <button type="button" onClick={handleForgotPassword} className="text-[11px] font-inter font-light text-[#2C332B]/60 hover:text-[#6B8E7D] transition-colors underline decoration-[#6B8E7D]/30 underline-offset-4">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-[#2C332B] text-white font-inter font-light py-4 rounded-full hover:bg-[#6B8E7D] transition mt-6 tracking-wide shadow-md disabled:opacity-50 flex items-center justify-center">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Acceder"}
                </button>

                <p className="text-[10px] text-center font-inter font-light text-[#2C332B]/40 mt-4 px-2 leading-relaxed">
                  Al acceder, confirmas que aceptas nuestras <Link href="/privacy" className="underline hover:text-[#6B8E7D] transition">Políticas de Privacidad</Link>, <Link href="/terms" className="underline hover:text-[#6B8E7D] transition">Términos y Condiciones</Link> y el cribado automatizado.
                </p>
              </form>
            </motion.div>
          ) : (

            /* 🔵 FORMULARIO DE REGISTRO CON TURNSTILE */
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <form className="space-y-5" onSubmit={handleRegister}>
                <div>
                  <input type="text" placeholder="Nombre Completo" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                <div>
                  <input type="email" placeholder="Correo Electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                </div>
                
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Crear Contraseña (Mín. 6 letras)" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 pr-12 bg-transparent border-b border-[#2C332B]/20 focus:outline-none focus:border-[#6B8E7D] transition text-sm font-inter font-light placeholder:text-[#2C332B]/40 text-[#2C332B]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#2C332B]/40 hover:text-[#6B8E7D] transition-colors focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* 1. CONSENTIMIENTO LEGAL */}
                <div className="flex items-start gap-3 mt-4 pt-1 px-1 mb-6">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 flex-shrink-0 cursor-pointer accent-[#6B8E7D]" 
                  />
                  <label htmlFor="terms" className="text-[11px] font-inter font-light text-[#2C332B]/60 leading-relaxed cursor-pointer select-none">
                    He leído y acepto las <Link href="/privacy" className="underline text-[#6B8E7D] hover:text-[#2C332B] transition">Políticas de Privacidad</Link> y <Link href="/terms" className="underline text-[#6B8E7D] hover:text-[#2C332B] transition">Términos y Condiciones</Link>.
                  </label>
                </div>

                {/* 2. CAPTCHA INVISIBLE */}
                <div className="flex justify-center w-full mb-4">
                  <Turnstile 
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} 
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
                
                {/* 3. BOTÓN DE REGISTRO */}
                <button 
                  type="submit" 
                  disabled={isLoading || !termsAccepted || !turnstileToken} 
                  className="w-full bg-[#6B8E7D] text-white font-inter font-light py-4 rounded-full hover:bg-[#2C332B] transition mt-2 tracking-wide shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Crear Cuenta"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}