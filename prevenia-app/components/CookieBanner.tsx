"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Revisamos si el usuario ya aceptó las cookies antes
    const hasAccepted = localStorage.getItem("prevenia_cookies_accepted");
    if (!hasAccepted) {
      // Damos un pequeño retraso de 1 segundo para que la página cargue primero
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("prevenia_cookies_accepted", "true");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 50, transition: { duration: 0.3 } }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100] bg-white/90 backdrop-blur-xl border border-[#2C332B]/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#F8F6F0] rounded-full text-[#6B8E7D] mt-1 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-playfair font-bold text-[#2C332B] mb-1">Tu privacidad es clínica</h4>
              <p className="text-xs font-inter text-[#2C332B]/70 leading-relaxed">
                Utilizamos cookies estrictamente necesarias para mantener tu sesión segura. No utilizamos rastreadores publicitarios. Conoce más en nuestras <Link href="/privacy" className="underline hover:text-[#6B8E7D] transition">Políticas de Privacidad</Link>.
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-1">
            <button 
              onClick={handleAccept}
              className="px-6 py-2.5 bg-[#2C332B] text-white text-xs font-inter rounded-full hover:bg-[#6B8E7D] transition-colors shadow-md"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}