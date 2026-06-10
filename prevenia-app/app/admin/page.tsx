"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminPanel() {
  // Estado para controlar la pestaña activa ('dashboard', 'users' o 'rag')
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex overflow-hidden">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white/50 backdrop-blur-sm border-r border-[#2C332B]/5 p-8 flex flex-col gap-2 relative z-10 hidden md:flex">
        <div className="flex items-center gap-2 mb-12 text-[#6B8E7D]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z"/></svg>
          <span className="text-xl font-playfair tracking-wide text-[#2C332B]">Portal</span>
        </div>
        
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`text-left px-4 py-3 font-inter font-light rounded-2xl transition ${activeTab === "dashboard" ? "bg-white shadow-sm text-[#2C332B]" : "text-[#2C332B]/60 hover:bg-white/50"}`}
        >
          Visión General
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`text-left px-4 py-3 font-inter font-light rounded-2xl transition ${activeTab === "users" ? "bg-white shadow-sm text-[#2C332B]" : "text-[#2C332B]/60 hover:bg-white/50"}`}
        >
          Pacientes
        </button>
        <button 
          onClick={() => setActiveTab("rag")}
          className={`text-left px-4 py-3 font-inter font-light rounded-2xl transition ${activeTab === "rag" ? "bg-white shadow-sm text-[#2C332B]" : "text-[#2C332B]/60 hover:bg-white/50"}`}
        >
          Conocimiento IA
        </button>
        
        <div className="mt-auto pt-6 border-t border-[#2C332B]/10">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-[#2C332B]/50 hover:text-[#2C332B] font-inter font-light uppercase tracking-widest transition">
              Volver al Inicio
            </button>
          </Link>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-5xl">
              <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Visión General</h1>
              <p className="text-[#2C332B]/60 font-inter font-light mb-12">Monitoreo de la plataforma y salud poblacional.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition">
                  <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 block mb-2 font-inter">Total Pacientes</span>
                  <p className="text-4xl font-playfair text-[#2C332B]">1,248</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition">
                  <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 block mb-2 font-inter">Evaluaciones IA</span>
                  <p className="text-4xl font-playfair text-[#2C332B]">4,892</p>
                </div>
                <div className="bg-[#F4ECEC] p-8 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition">
                  <span className="text-xs uppercase tracking-widest text-[#A56868]/70 block mb-2 font-inter">Riesgo Alto</span>
                  <p className="text-4xl font-playfair text-[#A56868]">18%</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PACIENTES */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-5xl">
              <h1 className="text-4xl font-playfair text-[#2C332B] mb-12">Directorio de Pacientes</h1>
              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-white p-4">
                <table className="w-full text-left text-sm font-inter font-light">
                  <thead className="text-[#2C332B]/50 border-b border-[#2C332B]/5">
                    <tr>
                      <th className="p-4 font-normal uppercase tracking-widest text-xs">Paciente</th>
                      <th className="p-4 font-normal uppercase tracking-widest text-xs">Última Evaluación</th>
                      <th className="p-4 font-normal uppercase tracking-widest text-xs">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C332B]/5 text-[#2C332B]">
                    <tr className="hover:bg-[#F8F6F0] transition">
                      <td className="p-4"><p className="font-medium text-base">Carlos Mendoza</p><p className="text-xs opacity-60">carlos@email.com</p></td>
                      <td className="p-4 text-[#2C332B]/70">Hace 2 días</td>
                      <td className="p-4"><span className="bg-[#F2E8D5] text-[#8C7345] px-3 py-1 rounded-full text-xs font-medium">Atención Moderada</span></td>
                    </tr>
                    <tr className="hover:bg-[#F8F6F0] transition">
                      <td className="p-4"><p className="font-medium text-base">Ana Lucía Torres</p><p className="text-xs opacity-60">ana.t@email.com</p></td>
                      <td className="p-4 text-[#2C332B]/70">Hace 5 horas</td>
                      <td className="p-4"><span className="bg-[#E4EDE7] text-[#557B63] px-3 py-1 rounded-full text-xs font-medium">Saludable</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CONOCIMIENTO IA (RAG) */}
          {activeTab === "rag" && (
            <motion.div key="rag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-5xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                <div>
                  <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Conocimiento Clínico</h1>
                  <p className="text-[#2C332B]/60 font-inter font-light">Documentos médicos (ChromaDB) que alimentan la IA.</p>
                </div>
                <button className="bg-[#2C332B] text-white px-6 py-3 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition shadow-md whitespace-nowrap">
                  Añadir Documento
                </button>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-white p-4">
                <table className="w-full text-left text-sm font-inter font-light">
                  <thead className="text-[#2C332B]/50 border-b border-[#2C332B]/5">
                    <tr>
                      <th className="p-4 font-normal uppercase tracking-widest text-xs">Fuente de Datos</th>
                      <th className="p-4 font-normal uppercase tracking-widest text-xs">Indexación</th>
                      <th className="p-4 font-normal uppercase tracking-widest text-xs">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C332B]/5 text-[#2C332B]">
                    <tr className="hover:bg-[#F8F6F0] transition">
                      <td className="p-4 font-medium">Guía ADA 2024 - Estándares Médicos</td>
                      <td className="p-4 text-[#2C332B]/70">12 Oct 2024</td>
                      <td className="p-4"><span className="bg-[#E4EDE7] text-[#557B63] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 w-max"><span className="w-1.5 h-1.5 rounded-full bg-[#557B63]"></span> Activo</span></td>
                    </tr>
                    <tr className="hover:bg-[#F8F6F0] transition">
                      <td className="p-4 font-medium">Estudio OMS - Riesgo Metabólico</td>
                      <td className="p-4 text-[#2C332B]/70">15 Oct 2024</td>
                      <td className="p-4"><span className="bg-[#E4EDE7] text-[#557B63] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 w-max"><span className="w-1.5 h-1.5 rounded-full bg-[#557B63]"></span> Activo</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}