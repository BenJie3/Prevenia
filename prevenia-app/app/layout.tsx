import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider"; // 1. Importamos el Provider

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
        {/* 2. Envolvemos todo dentro del AuthProvider */}
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
