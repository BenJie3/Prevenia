"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  // RAG Y CRUD ESTADOS
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [query, setQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [chat, setChat] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Hola, Doctor. La base de conocimiento médico local está lista. ¿Qué desea consultar?" }
  ]);

  // ANALÍTICAS ESTADOS
  const [stats, setStats] = useState({ 
    totalPatients: 0, 
    totalEvaluations: 0, 
    highRiskPercentage: 0,
    distribution: { bajo: 0, moderado: 0, alto: 0 }
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // ESTADO DEL BUSCADOR (NUEVO)
  const [searchTerm, setSearchTerm] = useState("");

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/rag/documents");
      const data = await res.json();
      if (data.success) {
        const formattedDocs = data.documents.map((doc: any) => ({
          ...doc, name: doc.source || "Documento Clínico", status: "Activo"
        }));
        setDocuments(formattedDocs);
      }
    } catch (e) {
      console.error("Error leyendo repositorio:", e);
    } finally { setIsLoadingDocs(false); }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPatients(data.patients);
      }
    } catch (e) {
      console.error("Error leyendo estadísticas:", e);
    } finally { setIsLoadingStats(false); }
  };

  useEffect(() => {
    if (status !== "loading") {
      if (!session || (session.user as any).role !== "ADMIN") {
        router.replace("/"); 
      } else {
        loadDocuments();
        loadStats();
      }
    }
  }, [session, status, router]);

  // FUNCIONES RAG (Sin cambios)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/rag/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success) { setFile(null); await loadDocuments(); } else alert(data.error);
    } catch (error) { alert("Error de red."); } finally { setIsUploading(false); }
  };

  const handleRename = async (id: number) => {
    if (!editName || !editName.trim()) return; 
    try {
      const response = await fetch("/api/rag/documents", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, newName: editName.trim() }) });
      const data = await response.json();
      if (data.success) { setEditingDocId(null); setEditName(""); await loadDocuments(); }
    } catch (e) { alert("No se pudo renombrar."); }
  };

  const handleSoftDelete = async (id: number) => {
    if (!confirm("¿Está seguro de archivar este documento médico?")) return;
    try {
      const response = await fetch(`/api/rag/documents?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) await loadDocuments();
    } catch (e) { alert("Error al archivar."); }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const currentQuery = query;
    setChat(prev => [...prev, { role: "user", text: currentQuery }]);
    setQuery("");
    setIsQuerying(true);
    try {
      const response = await fetch("/api/rag/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: currentQuery }) });
      const data = await response.json();
      if (data.success) setChat(prev => [...prev, { role: "ai", text: data.answer }]);
      else setChat(prev => [...prev, { role: "ai", text: "Error: " + data.error }]);
    } catch (error) { setChat(prev => [...prev, { role: "ai", text: "Error de conexión RAG." }]); } finally { setIsQuerying(false); }
  };

  // AUXILIARES UI
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin evaluaciones";
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Alto": return "bg-red-100 text-red-700 border-red-200"; 
      case "Moderado": return "bg-yellow-100 text-yellow-700 border-yellow-200"; 
      case "Bajo": return "bg-green-100 text-green-700 border-green-200"; 
      default: return "bg-gray-100 text-gray-500 border-gray-200"; 
    }
  };

  // FILTRO EN TIEMPO REAL
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // CÁLCULOS VISUALES PARA LA BARRA
  const totalRiesgos = stats.distribution.bajo + stats.distribution.moderado + stats.distribution.alto;
  const pbajo = totalRiesgos > 0 ? (stats.distribution.bajo / totalRiesgos) * 100 : 33;
  const pmoderado = totalRiesgos > 0 ? (stats.distribution.moderado / totalRiesgos) * 100 : 33;
  const palto = totalRiesgos > 0 ? (stats.distribution.alto / totalRiesgos) * 100 : 34;

  if (status === "loading" || !session || (session.user as any).role !== "ADMIN") {
    return <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin" /></div>;
  }

  return (
    <div className="relative h-screen bg-[#F8F6F0] pt-20 flex overflow-hidden">
      <aside className="w-64 bg-white/50 backdrop-blur-sm border-r border-[#2C332B]/5 p-8 flex flex-col gap-2 relative z-10 hidden md:flex h-full">
        <div className="flex items-center gap-2 mb-12 text-[#6B8E7D]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z"/></svg>
          <span className="text-xl font-playfair tracking-wide text-[#2C332B]">Portal Admin</span>
        </div>
        <button onClick={() => setActiveTab("dashboard")} className={`text-left px-4 py-3 font-inter font-light rounded-2xl transition flex items-center gap-3 ${activeTab === "dashboard" ? "bg-white shadow-sm text-[#2C332B]" : "text-[#2C332B]/60 hover:bg-white/50"}`}>
          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Visión General
        </button>
        <button onClick={() => setActiveTab("users")} className={`text-left px-4 py-3 font-inter font-light rounded-2xl transition flex items-center gap-3 ${activeTab === "users" ? "bg-white shadow-sm text-[#2C332B]" : "text-[#2C332B]/60 hover:bg-white/50"}`}>
          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Pacientes
        </button>
        <button onClick={() => setActiveTab("rag")} className={`text-left px-4 py-3 font-inter font-light rounded-2xl transition flex items-center gap-3 ${activeTab === "rag" ? "bg-white shadow-sm text-[#2C332B]" : "text-[#2C332B]/60 hover:bg-white/50"}`}>
          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Conocimiento IA
        </button>
        <div className="mt-auto pt-6 border-t border-[#2C332B]/10"><Link href="/"><button className="text-sm text-[#2C332B]/50 hover:text-[#2C332B] font-inter font-light uppercase tracking-widest transition flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Volver al Inicio</button></Link></div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10 h-full custom-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD REAL Y DINÁMICO */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto">
              <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Visión General</h1>
              <p className="text-[#2C332B]/60 font-inter font-light mb-8">Monitoreo de la plataforma y salud poblacional en tiempo real.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#6B8E7D]/5 rounded-full" />
                  <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 block mb-2 font-inter relative z-10">Total Pacientes</span>
                  {isLoadingStats ? <div className="h-10 bg-gray-100 animate-pulse rounded w-16" /> : <p className="text-4xl font-playfair text-[#2C332B] relative z-10">{stats.totalPatients}</p>}
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#6B8E7D]/5 rounded-full" />
                  <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 block mb-2 font-inter relative z-10">Evaluaciones IA</span>
                  {isLoadingStats ? <div className="h-10 bg-gray-100 animate-pulse rounded w-16" /> : <p className="text-4xl font-playfair text-[#2C332B] relative z-10">{stats.totalEvaluations}</p>}
                </div>
                <div className="bg-red-50 p-8 rounded-[2rem] shadow-sm border border-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full" />
                  <span className="text-xs uppercase tracking-widest text-red-800/60 block mb-2 font-inter relative z-10">Riesgo Alto</span>
                  {isLoadingStats ? <div className="h-10 bg-red-100 animate-pulse rounded w-16" /> : <p className="text-4xl font-playfair text-red-600 relative z-10">{stats.highRiskPercentage}%</p>}
                </div>
              </div>

              {/* SECCIÓN NUEVA: DISTRIBUCIÓN Y ACTIVIDAD */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-white">
                  <h3 className="text-lg font-playfair text-[#2C332B] mb-6">Distribución de Riesgo Poblacional</h3>
                  {isLoadingStats ? (
                    <div className="h-4 bg-gray-100 animate-pulse rounded-full w-full mb-6" />
                  ) : (
                    <>
                      <div className="w-full h-4 rounded-full overflow-hidden flex mb-6">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pbajo}%` }} transition={{ duration: 1 }} className="h-full bg-green-400" title={`Bajo: ${stats.distribution.bajo}`} />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pmoderado}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-yellow-400" title={`Moderado: ${stats.distribution.moderado}`} />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${palto}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-red-400" title={`Alto: ${stats.distribution.alto}`} />
                      </div>
                      <div className="flex justify-between text-xs font-inter text-[#2C332B]/60">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400"/> Bajo ({stats.distribution.bajo})</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400"/> Moderado ({stats.distribution.moderado})</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400"/> Alto ({stats.distribution.alto})</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-[#EFECE5] p-8 rounded-[2rem] shadow-sm border border-white">
                  <h3 className="text-lg font-playfair text-[#2C332B] mb-4">Últimas Evaluaciones</h3>
                  <div className="space-y-3">
                    {isLoadingStats ? (
                       [1,2].map(n => <div key={n} className="h-12 bg-white/50 animate-pulse rounded-2xl" />)
                    ) : patients.filter(p => p.status !== "Sin datos").slice(0,3).map(p => (
                      <div key={p.id} className="bg-white/80 p-3 px-4 rounded-2xl flex justify-between items-center text-sm shadow-sm">
                        <div>
                          <p className="font-medium text-[#2C332B] truncate max-w-[150px]">{p.name}</p>
                          <p className="text-[10px] text-[#2C332B]/50">{formatDate(p.lastEvaluation)}</p>
                        </div>
                        <span className={`${getStatusBadge(p.status)} border px-2 py-0.5 rounded-full text-[10px] font-medium`}>{p.status}</span>
                      </div>
                    ))}
                    {patients.filter(p => p.status !== "Sin datos").length === 0 && (
                      <p className="text-xs text-[#2C332B]/50 font-inter">No hay actividad reciente.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PACIENTES REALES (CON BUSCADOR) */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Directorio de Pacientes</h1>
                  <p className="text-[#2C332B]/60 font-inter font-light">Gestión clínica y seguimiento de perfiles.</p>
                </div>
                {/* BARRA DE BÚSQUEDA */}
                <div className="relative w-full sm:w-72">
                  <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#2C332B]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-none rounded-full py-3 pl-10 pr-4 text-sm font-inter text-[#2C332B] focus:ring-2 focus:ring-[#6B8E7D]/30 outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-white flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left text-sm font-inter font-light whitespace-nowrap">
                    <thead className="text-[#2C332B]/50 border-b border-[#2C332B]/5 bg-[#F8F6F0]/50 sticky top-0 z-10">
                      <tr>
                        <th className="p-5 font-normal uppercase tracking-widest text-xs">Paciente</th>
                        <th className="p-5 font-normal uppercase tracking-widest text-xs">Última Evaluación</th>
                        <th className="p-5 font-normal uppercase tracking-widest text-xs">Riesgo IA</th>
                        <th className="p-5 font-normal uppercase tracking-widest text-xs text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C332B]/5 text-[#2C332B]">
                      {isLoadingStats ? (
                        <tr><td colSpan={4} className="p-10 text-center"><div className="w-6 h-6 border-2 border-[#6B8E7D] border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                      ) : filteredPatients.length === 0 ? (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">No se encontraron pacientes.</td></tr>
                      ) : (
                        filteredPatients.map(patient => (
                          <tr key={patient.id} className="hover:bg-[#F8F6F0]/50 transition group">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#6B8E7D]/10 text-[#6B8E7D] flex items-center justify-center font-medium text-xs flex-shrink-0">
                                  {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-[#2C332B]">{patient.name}</p>
                                  <p className="text-xs opacity-50">{patient.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-[#2C332B]/70">{formatDate(patient.lastEvaluation)}</td>
                            <td className="p-5">
                              <span className={`${getStatusBadge(patient.status)} border px-3 py-1 rounded-full text-xs font-medium`}>
                                {patient.status}
                              </span>
                            </td>
                            <td className="p-5 text-right">
                              <button className="text-xs font-medium text-[#6B8E7D] hover:text-[#2C332B] opacity-0 group-hover:opacity-100 transition-opacity underline underline-offset-4 decoration-[#6B8E7D]/30">
                                Ver Perfil
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CONOCIMIENTO IA (RAG) - Sin Cambios */}
          {activeTab === "rag" && (
             <motion.div key="rag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto h-full flex flex-col">
              <div className="mb-8">
                <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Conocimiento Clínico Local</h1>
                <p className="text-[#2C332B]/60 font-inter font-light">Base de datos documental para el blindaje científico de Gemini.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 pb-8 items-start">
                <div className="space-y-6 flex flex-col">
                  {/* Zona de Subida */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-white">
                    <h2 className="text-lg font-playfair text-[#2C332B] mb-4">Nuevo Documento</h2>
                    <form onSubmit={handleUpload}>
                      <label className="border-2 border-dashed border-[#6B8E7D]/30 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8F6F0]/50 hover:border-[#6B8E7D]/60 transition-all group">
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <div className="w-14 h-14 bg-[#6B8E7D]/10 text-[#6B8E7D] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                        <span className="text-sm font-inter text-[#2C332B]/80 font-medium mb-1 text-center">{file ? file.name : "Haz clic para subir un PDF"}</span>
                        <span className="text-xs font-inter font-light text-[#2C332B]/50">{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Archivos médicos .pdf"}</span>
                      </label>
                      <button type="submit" disabled={!file || isUploading} className="w-full mt-4 bg-[#2C332B] text-white py-3.5 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isUploading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Indexando...</> : "Indexar Documento"}
                      </button>
                    </form>
                  </div>

                  {/* Tabla del CRUD Repotenciada */}
                  <div className="bg-[#EFECE5] rounded-[2rem] p-8 shadow-sm border border-white max-h-[400px] overflow-y-auto custom-scrollbar">
                    <h2 className="text-lg font-playfair text-[#2C332B] mb-4">Documentos Médicos Activos</h2>
                    <div className="space-y-3">
                      {isLoadingDocs ? (
                        [1, 2].map((n) => (
                          <div key={n} className="bg-white/50 p-4 rounded-2xl h-16 animate-pulse flex items-center justify-between"><div className="h-4 bg-[#2C332B]/10 rounded w-2/3"></div><div className="h-4 bg-[#2C332B]/10 rounded w-12"></div></div>
                        ))
                      ) : documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id} className="bg-white/80 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-[#6B8E7D]/20 transition-all group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingDocId === doc.id ? (
                                  <div className="flex gap-2 items-center">
                                    <input type="text" value={editName || ""} onChange={(e) => setEditName(e.target.value)} className="bg-white border border-[#6B8E7D] text-xs px-2 py-1 rounded outline-none w-full font-inter text-[#2C332B]" />
                                    <button onClick={() => handleRename(doc.id)} className="text-xs text-green-700 font-bold">✓</button>
                                    <button onClick={() => setEditingDocId(null)} className="text-xs text-red-700 font-bold">✕</button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-[#2C332B] truncate">{doc.name}</p>
                                    <p className="text-[10px] font-light text-[#2C332B]/40 uppercase tracking-widest mt-0.5">{doc.status}</p>
                                  </>
                                )}
                              </div>
                            </div>
                            {editingDocId !== doc.id && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button onClick={() => { setEditingDocId(doc.id); setEditName(doc.name || ""); }} className="text-[#2C332B]/50 hover:text-[#6B8E7D] p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                                <button onClick={() => handleSoftDelete(doc.id)} className="text-[#2C332B]/50 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#2C332B]/40 text-center py-6">No hay literatura clínica en el sistema.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: CHAT CONECTADO A EXPERIMENTOS */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-white flex flex-col h-[600px] lg:h-[550px] overflow-hidden">
                  <div className="p-6 border-b border-[#2C332B]/5 bg-[#F8F6F0]/50 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-playfair text-[#2C332B]">Laboratorio de Pruebas</h2>
                      <p className="text-xs font-inter font-light text-[#2C332B]/60 mt-0.5">Sincronizado con tus documentos activos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B8E7D] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B8E7D]"></span></span>
                      <span className="text-[10px] uppercase tracking-widest text-[#6B8E7D] font-medium">Prevenia Engine</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#F8F6F0]/20">
                    {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-inter leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#2C332B] text-white rounded-br-none' : 'bg-white border border-[#2C332B]/5 text-[#2C332B]/80 rounded-bl-none'}`}>{msg.text}</div>
                      </div>
                    ))}
                    {isQuerying && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-2xl bg-white border border-[#2C332B]/5 rounded-bl-none shadow-sm flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#6B8E7D] rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-[#6B8E7D] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /><div className="w-1.5 h-1.5 bg-[#6B8E7D] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} /></div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white border-t border-[#2C332B]/5">
                    <form onSubmit={handleQuery} className="flex gap-2 relative">
                      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} disabled={isQuerying} placeholder="Ej. ¿Qué dice el documento sobre la glucosa?" className="w-full bg-[#F8F6F0] text-sm font-inter text-[#2C332B] rounded-full py-4 pl-6 pr-14 outline-none focus:ring-1 focus:ring-[#6B8E7D] transition" />
                      <button type="submit" disabled={!query.trim() || isQuerying} className="absolute right-2 top-2 bottom-2 w-10 bg-[#2C332B] text-white rounded-full flex items-center justify-center hover:bg-[#6B8E7D] transition disabled:opacity-50"><svg className="w-4 h-4 translate-x-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}