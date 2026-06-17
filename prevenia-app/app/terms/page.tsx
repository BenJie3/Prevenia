import Link from "next/link";
import Footer from "@/components/Footer";


export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col relative overflow-hidden">
      
      {/* Ambient Blurs */}
      <div className="absolute rounded-full filter blur-[120px] opacity-60 bg-[#DDE6DE] w-[40rem] h-[40rem] top-[-10%] left-[-10%] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[100px] opacity-40 bg-[#EAE2D0] w-[30rem] h-[30rem] bottom-[10%] right-[-5%] -z-10 pointer-events-none" />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-[3rem] shadow-sm border border-white">
          
          <div className="mb-12 border-b border-[#2C332B]/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-playfair text-[#2C332B] mb-4 tracking-tight">Términos y Condiciones de Uso</h1>
            <p className="text-sm font-inter text-[#2C332B]/60 uppercase tracking-widest">Entrada en vigor: {currentDate}</p>
          </div>

          <div className="space-y-8 font-inter text-[#2C332B]/80 text-sm md:text-base leading-relaxed font-light">
            
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">1. Aceptación de los Términos</h2>
              <p>
                Al acceder, registrarse o utilizar la plataforma <strong>Prevenia</strong>, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna de las normativas aquí descritas, no debe utilizar nuestros servicios. El uso de esta plataforma está restringido a personas mayores de 18 años.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">2. Naturaleza del Servicio (No es Consejo Médico)</h2>
              <p>
                Prevenia es una herramienta tecnológica que utiliza modelos de lenguaje de Inteligencia Artificial (LLM) para cruzar datos proporcionados por el usuario con literatura clínica de dominio público. 
                <strong className="block mt-2 text-[#2C332B]">Limitación estricta:</strong> Prevenia NO es un hospital, clínica, ni proveedor de atención médica. Ningún contenido, reporte PDF o texto generado por la plataforma debe interpretarse como diagnóstico clínico, tratamiento, receta o asesoramiento médico profesional.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">3. Limitación de Responsabilidad</h2>
              <p>
                La Inteligencia Artificial es una tecnología experimental que puede sufrir de "alucinaciones" (generar información inexacta). Al usar Prevenia, usted comprende y acepta que:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#2C332B]/70">
                <li>Los desarrolladores, propietarios y afiliados de Prevenia no serán responsables por daños directos, indirectos, incidentales o de salud derivados del uso de la información proporcionada por la plataforma.</li>
                <li>Usted es el único responsable de consultar a un médico certificado antes de realizar cambios en su dieta, estilo de vida o consumo de medicamentos basándose en nuestros reportes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">4. Obligaciones del Usuario</h2>
              <p>Usted se compromete a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#2C332B]/70">
                <li>Proporcionar información verdadera, exacta y actual en sus evaluaciones.</li>
                <li>No utilizar la plataforma para fines ilegales, automatizados (bots/scraping) o malintencionados.</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso. Prevenia no se hace responsable por el acceso no autorizado a su cuenta debido a negligencia del usuario.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">5. Propiedad Intelectual</h2>
              <p>
                Todo el contenido visual, logotipos (incluyendo la marca Prevenia), diseño de interfaz, código fuente, algoritmos y estructura de bases de datos son propiedad exclusiva de Prevenia HealthTech o se utilizan bajo licencia. Queda estrictamente prohibida su copia, reproducción o distribución sin autorización previa por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">6. Suspensión de la Cuenta</h2>
              <p>
                Nos reservamos el derecho de suspender, desactivar o eliminar permanentemente la cuenta de cualquier usuario que viole estos términos, intente vulnerar la seguridad de la plataforma o proporcione datos deliberadamente falsos, sin necesidad de previo aviso.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-[#2C332B]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#2C332B]/50 uppercase tracking-widest">
                Términos Legales Prevenia © {new Date().getFullYear()}
              </p>
              <Link href="/">
                <button className="px-6 py-2 bg-[#2C332B] text-white rounded-full text-sm font-inter hover:bg-[#6B8E7D] transition-all shadow-sm">
                  Volver al Inicio
                </button>
              </Link>
            </div>

          </div>
        </div>
      </main>
      
    </div>
  );
}