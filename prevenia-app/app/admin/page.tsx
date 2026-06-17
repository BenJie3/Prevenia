"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Users, Activity, FileText, BrainCircuit, Search, 
  Trash2, Edit3, X, Check, UploadCloud, LogOut, ArrowLeft, BarChart3, TrendingUp, Mail 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

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

  // ANALÍTICAS Y PACIENTES ESTADOS
  const [stats, setStats] = useState({ 
    totalPatients: 0, 
    totalEvaluations: 0, 
    highRiskPercentage: 0,
    distribution: { bajo: 0, moderado: 0, alto: 0 }
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // 🛡️ ESTADOS NUEVOS (Buscador potente y Modal de Perfil)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

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
      toast.error("Error leyendo repositorio RAG");
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
      toast.error("Error leyendo métricas");
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

  // FUNCIONES RAG
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    const tId = toast.loading("Indexando PDF...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/rag/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success) { 
        toast.success("Documento blindado en la BD Vectorial", { id: tId });
        setFile(null); 
        await loadDocuments(); 
      } else toast.error(data.error, { id: tId });
    } catch (error) { toast.error("Error de red", { id: tId }); } finally { setIsUploading(false); }
  };

  const handleRename = async (id: number) => {
    if (!editName || !editName.trim()) return; 
    try {
      const response = await fetch("/api/rag/documents", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, newName: editName.trim() }) });
      const data = await response.json();
      if (data.success) { setEditingDocId(null); setEditName(""); await loadDocuments(); toast.success("Nombre actualizado"); }
    } catch (e) { toast.error("Error al renombrar"); }
  };

  const handleSoftDelete = async (id: number) => {
    if (!confirm("¿Está seguro de archivar este documento médico?")) return;
    try {
      const response = await fetch(`/api/rag/documents?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) { await loadDocuments(); toast.success("Documento archivado"); }
    } catch (e) { toast.error("Error al archivar"); }
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

  // 🛡️ BUSCADOR MEJORADO: Busca por nombre o por correo electrónico
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const riskChartData = useMemo(() => {
    return [
      { name: 'Bajo', value: stats.distribution.bajo, color: '#4ade80' },
      { name: 'Moderado', value: stats.distribution.moderado, color: '#facc15' },
      { name: 'Alto', value: stats.distribution.alto, color: '#f87171' },
    ];
  }, [stats]);

  const activityData = useMemo(() => {
    return [
      { month: 'Semana 1', eval: Math.floor(stats.totalEvaluations * 0.15) },
      { month: 'Semana 2', eval: Math.floor(stats.totalEvaluations * 0.25) },
      { month: 'Semana 3', eval: Math.floor(stats.totalEvaluations * 0.20) },
      { month: 'Actual', eval: Math.floor(stats.totalEvaluations * 0.40) },
    ];
  }, [stats]);

  if (status === "loading" || !session || (session.user as any).role !== "ADMIN") {
    return <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#6B8E7D]/20 border-t-[#6B8E7D] rounded-full animate-spin" /></div>;
  }

  return (
    <div className="relative h-screen bg-[#F8F6F0] pt-20 flex overflow-hidden">
      
      {/* SIDEBAR MODERNO */}
      <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-[#2C332B]/5 p-6 flex flex-col gap-2 relative z-10 hidden md:flex h-full shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="p-2 bg-[#6B8E7D]/10 rounded-xl text-[#6B8E7D]">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h2 className="text-lg font-playfair tracking-wide text-[#2C332B] leading-tight">Prevenia</h2>
            <span className="text-[10px] uppercase tracking-widest text-[#2C332B]/50 font-medium">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 font-inter font-light rounded-2xl transition flex items-center gap-3 ${activeTab === "dashboard" ? "bg-[#2C332B] text-white shadow-md" : "text-[#2C332B]/60 hover:bg-white hover:shadow-sm"}`}>
            <BarChart3 size={18} className={activeTab === "dashboard" ? "text-white" : "text-[#6B8E7D]"} />
            Dashboard
          </button>
          <button onClick={() => setActiveTab("users")} className={`w-full text-left px-4 py-3 font-inter font-light rounded-2xl transition flex items-center gap-3 ${activeTab === "users" ? "bg-[#2C332B] text-white shadow-md" : "text-[#2C332B]/60 hover:bg-white hover:shadow-sm"}`}>
            <Users size={18} className={activeTab === "users" ? "text-white" : "text-[#6B8E7D]"} />
            Pacientes
          </button>
          <button onClick={() => setActiveTab("rag")} className={`w-full text-left px-4 py-3 font-inter font-light rounded-2xl transition flex items-center gap-3 ${activeTab === "rag" ? "bg-[#2C332B] text-white shadow-md" : "text-[#2C332B]/60 hover:bg-white hover:shadow-sm"}`}>
            <FileText size={18} className={activeTab === "rag" ? "text-white" : "text-[#6B8E7D]"} />
            Inteligencia RAG
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#2C332B]/10 space-y-2">
          <Link href="/">
            <button className="w-full text-left px-4 py-3 text-xs text-[#2C332B]/50 hover:text-[#2C332B] font-inter font-medium uppercase tracking-widest transition flex items-center gap-3 hover:bg-white rounded-2xl">
              <ArrowLeft size={16} /> Volver a la App
            </button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10 h-full custom-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SÚPER DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Visión Clínica Global</h1>
                  <p className="text-[#2C332B]/60 font-inter font-light">Métricas poblacionales en tiempo real.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#6B8E7D]/20 transition relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#6B8E7D]/5 rounded-full group-hover:scale-150 transition duration-500" />
                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-medium">Total Pacientes</span>
                    <Users size={20} className="text-[#6B8E7D]" />
                  </div>
                  {isLoadingStats ? <div className="h-10 bg-[#F8F6F0] animate-pulse rounded-lg w-16" /> : <p className="text-5xl font-playfair text-[#2C332B] relative z-10">{stats.totalPatients}</p>}
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#6B8E7D]/20 transition relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#6B8E7D]/5 rounded-full group-hover:scale-150 transition duration-500" />
                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <span className="text-xs uppercase tracking-widest text-[#2C332B]/50 font-medium">Evaluaciones IA</span>
                    <Activity size={20} className="text-[#6B8E7D]" />
                  </div>
                  {isLoadingStats ? <div className="h-10 bg-[#F8F6F0] animate-pulse rounded-lg w-16" /> : <p className="text-5xl font-playfair text-[#2C332B] relative z-10">{stats.totalEvaluations}</p>}
                </div>
                <div className="bg-[#FFF5F5] p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-red-200 transition relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-red-500/5 rounded-full group-hover:scale-150 transition duration-500" />
                  <div className="flex justify-between items-start relative z-10 mb-4">
                    <span className="text-xs uppercase tracking-widest text-red-800/60 font-medium">Alerta: Riesgo Alto</span>
                    <TrendingUp size={20} className="text-red-400" />
                  </div>
                  {isLoadingStats ? <div className="h-10 bg-red-100/50 animate-pulse rounded-lg w-16" /> : <p className="text-5xl font-playfair text-red-600 relative z-10">{stats.highRiskPercentage}%</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-white flex flex-col">
                  <h3 className="text-lg font-playfair text-[#2C332B] mb-1">Actividad Reciente</h3>
                  <p className="text-xs font-inter text-[#2C332B]/40 uppercase tracking-widest mb-6">Volumen de Evaluaciones</p>
                  <div className="flex-1 min-h-[250px] w-full">
                    {isLoadingStats ? (
                      <div className="w-full h-full bg-[#F8F6F0]/50 animate-pulse rounded-2xl" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A0AEC0' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A0AEC0' }} />
                          <RechartsTooltip cursor={{ fill: '#F8F6F0' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                          <Bar dataKey="eval" fill="#6B8E7D" radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-2 bg-[#EFECE5] p-8 rounded-[2rem] shadow-sm border border-white flex flex-col items-center justify-center relative">
                  <h3 className="text-lg font-playfair text-[#2C332B] mb-1 w-full text-left">Distribución</h3>
                  <p className="text-xs font-inter text-[#2C332B]/40 uppercase tracking-widest mb-2 w-full text-left">Niveles de Riesgo</p>
                  <div className="w-full h-[220px]">
                    {isLoadingStats ? (
                      <div className="w-40 h-40 mx-auto rounded-full border-8 border-white/50 animate-pulse mt-4" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={riskChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                            {riskChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  {!isLoadingStats && (
                    <div className="flex gap-4 mt-2">
                      {riskChartData.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-inter text-[#2C332B]/70">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 👥 TAB 2: PACIENTES Y BUSCADOR */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Directorio de Pacientes</h1>
                  <p className="text-[#2C332B]/60 font-inter font-light">Gestión clínica y seguimiento de perfiles.</p>
                </div>
                {/* 🔍 BARRA DE BÚSQUEDA FUNCIONAL (Busca por Nombre o Correo) */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#2C332B]/40" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o correo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#2C332B]/5 rounded-full py-3 pl-11 pr-4 text-sm font-inter text-[#2C332B] focus:ring-2 focus:ring-[#6B8E7D]/30 outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-[#2C332B]/5 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left text-sm font-inter font-light whitespace-nowrap">
                    <thead className="text-[#2C332B]/50 border-b border-[#2C332B]/5 bg-[#F8F6F0]/30 sticky top-0 z-10">
                      <tr>
                        <th className="p-5 font-normal uppercase tracking-widest text-[10px]">Paciente</th>
                        <th className="p-5 font-normal uppercase tracking-widest text-[10px]">Última Evaluación</th>
                        <th className="p-5 font-normal uppercase tracking-widest text-[10px]">Riesgo IA</th>
                        <th className="p-5 font-normal uppercase tracking-widest text-[10px] text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C332B]/5 text-[#2C332B]">
                      {isLoadingStats ? (
                        <tr><td colSpan={4} className="p-10 text-center"><div className="w-6 h-6 border-2 border-[#6B8E7D] border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                      ) : filteredPatients.length === 0 ? (
                        <tr><td colSpan={4} className="p-16 text-center text-[#2C332B]/40 font-inter">No se encontraron pacientes que coincidan con "{searchTerm}".</td></tr>
                      ) : (
                        filteredPatients.map(patient => (
                          <tr key={patient.id} className="hover:bg-[#F8F6F0]/50 transition group">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#6B8E7D]/10 text-[#6B8E7D] flex items-center justify-center font-medium text-sm flex-shrink-0 border border-[#6B8E7D]/20">
                                  {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-[#2C332B]">{patient.name}</p>
                                  <p className="text-[11px] opacity-50">{patient.email}</p>
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
                              {/* 🛡️ BOTÓN VER PERFIL FUNCIONAL */}
                              <button 
                                onClick={() => setSelectedPatient(patient)}
                                className="text-xs font-medium text-[#6B8E7D] hover:text-[#2C332B] opacity-0 group-hover:opacity-100 transition-opacity bg-[#6B8E7D]/10 px-4 py-2 rounded-full"
                              >
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

          {/* 🧠 TAB 3: CONOCIMIENTO IA (RAG) */}
          {activeTab === "rag" && (
             <motion.div key="rag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto h-full flex flex-col">
              <div className="mb-8">
                <h1 className="text-4xl font-playfair text-[#2C332B] mb-2">Conocimiento Clínico Local</h1>
                <p className="text-[#2C332B]/60 font-inter font-light">Base de datos vectorial para el blindaje de la IA (Gemini).</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 pb-8 items-start">
                <div className="space-y-6 flex flex-col">
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#2C332B]/5">
                    <h2 className="text-lg font-playfair text-[#2C332B] mb-4 flex items-center gap-2">
                      <UploadCloud size={20} className="text-[#6B8E7D]" /> Nuevo Documento
                    </h2>
                    <form onSubmit={handleUpload}>
                      <label className="border-2 border-dashed border-[#6B8E7D]/30 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8F6F0]/50 hover:border-[#6B8E7D]/60 transition-all group">
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <div className="w-14 h-14 bg-[#6B8E7D]/10 text-[#6B8E7D] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <FileText size={24} />
                        </div>
                        <span className="text-sm font-inter text-[#2C332B]/80 font-medium mb-1 text-center">{file ? file.name : "Haz clic para subir un PDF Clínico"}</span>
                        <span className="text-xs font-inter font-light text-[#2C332B]/50">{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Límites de tamaño aplicables"}</span>
                      </label>
                      <button type="submit" disabled={!file || isUploading} className="w-full mt-4 bg-[#2C332B] text-white py-3.5 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                        {isUploading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Indexando (Vectorizando)...</> : "Indexar Documento en IA"}
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#EFECE5] rounded-[2rem] p-8 shadow-sm border border-white max-h-[400px] overflow-y-auto custom-scrollbar">
                    <h2 className="text-lg font-playfair text-[#2C332B] mb-4">Archivos en el Sistema</h2>
                    <div className="space-y-3">
                      {isLoadingDocs ? (
                        [1, 2].map((n) => <div key={n} className="bg-white/50 p-4 rounded-2xl h-16 animate-pulse" />)
                      ) : documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id} className="bg-white/80 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-[#6B8E7D]/20 transition-all group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
                                <FileText size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingDocId === doc.id ? (
                                  <div className="flex gap-2 items-center">
                                    <input type="text" value={editName || ""} onChange={(e) => setEditName(e.target.value)} className="bg-white border border-[#6B8E7D] text-xs px-3 py-1.5 rounded-lg outline-none w-full font-inter text-[#2C332B]" />
                                    <button onClick={() => handleRename(doc.id)} className="text-green-600 hover:scale-110 transition"><Check size={16} /></button>
                                    <button onClick={() => setEditingDocId(null)} className="text-red-500 hover:scale-110 transition"><X size={16} /></button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-[#2C332B] truncate">{doc.name}</p>
                                    <p className="text-[10px] font-light text-[#6B8E7D] uppercase tracking-widest mt-0.5">{doc.status}</p>
                                  </>
                                )}
                              </div>
                            </div>
                            {editingDocId !== doc.id && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button onClick={() => { setEditingDocId(doc.id); setEditName(doc.name || ""); }} className="text-[#2C332B]/40 hover:text-[#6B8E7D] p-1.5 bg-[#F8F6F0] rounded-lg transition"><Edit3 size={14} /></button>
                                <button onClick={() => handleSoftDelete(doc.id)} className="text-[#2C332B]/40 hover:text-red-500 p-1.5 bg-[#F8F6F0] rounded-lg transition"><Trash2 size={14} /></button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#2C332B]/40 text-center py-6 font-inter">No hay literatura clínica. La IA usará su conocimiento base.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-[#2C332B]/5 flex flex-col h-[600px] lg:h-full overflow-hidden">
                  <div className="p-6 border-b border-[#2C332B]/5 bg-[#F8F6F0]/50 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-playfair text-[#2C332B]">Terminal de Pruebas RAG</h2>
                      <p className="text-xs font-inter font-light text-[#2C332B]/60 mt-0.5">Consulta la base documental</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B8E7D] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B8E7D]"></span></span>
                      <span className="text-[10px] uppercase tracking-widest text-[#6B8E7D] font-medium">Motor IA Online</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#F8F6F0]/20">
                    {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-inter leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#2C332B] text-white rounded-br-none' : 'bg-white border border-[#2C332B]/5 text-[#2C332B]/80 rounded-bl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isQuerying && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-2xl bg-white border border-[#2C332B]/5 rounded-bl-none shadow-sm flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-[#6B8E7D] rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#6B8E7D] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <div className="w-1.5 h-1.5 bg-[#6B8E7D] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white border-t border-[#2C332B]/5">
                    <form onSubmit={handleQuery} className="flex gap-2 relative">
                      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} disabled={isQuerying} placeholder="Pregunta sobre los PDFs indexados..." className="w-full bg-[#F8F6F0] text-sm font-inter text-[#2C332B] rounded-full py-4 pl-6 pr-14 outline-none focus:ring-1 focus:ring-[#6B8E7D] transition" />
                      <button type="submit" disabled={!query.trim() || isQuerying} className="absolute right-2 top-2 bottom-2 w-10 bg-[#2C332B] text-white rounded-full flex items-center justify-center hover:bg-[#6B8E7D] transition disabled:opacity-50">
                        <svg className="w-4 h-4 translate-x-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 🛡️ MODAL DE PERFIL CLÍNICO DEL PACIENTE */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C332B]/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-xl relative"
            >
              <button onClick={() => setSelectedPatient(null)} className="absolute top-6 right-6 text-[#2C332B]/40 hover:text-[#2C332B] transition-colors p-2 bg-[#F8F6F0] rounded-full">
                <X size={18} />
              </button>
              
              <h2 className="text-2xl font-playfair text-[#2C332B] mb-6">Ficha del Paciente</h2>
              
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-full bg-[#6B8E7D]/10 text-[#6B8E7D] flex items-center justify-center font-playfair text-2xl border border-[#6B8E7D]/20 flex-shrink-0">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-[#2C332B] truncate">{selectedPatient.name}</h3>
                  <a href={`mailto:${selectedPatient.email}`} className="text-sm font-inter text-[#6B8E7D] hover:underline flex items-center gap-2 mt-1 truncate">
                    <Mail size={14} /> {selectedPatient.email}
                  </a>
                </div>
              </div>

              <div className="bg-[#EFECE5] p-5 rounded-2xl mb-8 border border-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-[#2C332B]/50 uppercase tracking-widest font-medium">Estado Metabólico</span>
                  <span className={`${getStatusBadge(selectedPatient.status)} border px-3 py-1 rounded-full text-xs font-medium`}>
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="h-px w-full bg-[#2C332B]/5 mb-4" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#2C332B]/50 uppercase tracking-widest font-medium">Última Evaluación IA</span>
                  <span className="text-sm text-[#2C332B] font-medium">{formatDate(selectedPatient.lastEvaluation)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a href={`mailto:${selectedPatient.email}`} className="flex-1">
                  <button className="w-full bg-[#2C332B] text-white py-3.5 rounded-full text-sm font-inter font-light hover:bg-[#6B8E7D] transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Mail size={16} /> Contactar
                  </button>
                </a>
                <button onClick={() => setSelectedPatient(null)} className="flex-1 bg-white border border-[#2C332B]/10 text-[#2C332B] py-3.5 rounded-full text-sm font-inter font-light hover:bg-[#F8F6F0] transition-colors">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}