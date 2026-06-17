import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import CookieBanner from "@/components/CookieBanner"; 
import { Toaster } from "react-hot-toast"; // 👈 1. Importamos las notificaciones

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Prevenia | Diagnóstico Inteligente",
  description: "Diagnóstico temprano de riesgo metabólico con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-inter bg-[#F8F6F0] text-[#2C332B] antialiased selection:bg-[#6B8E7D] selection:text-white flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          
          {/* 👈 2. Inyectamos el Toaster global con diseño Prevenia */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#fff',
                color: '#2C332B',
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(44, 51, 43, 0.05)'
              },
            }} 
          />
          
          <CookieBanner />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}