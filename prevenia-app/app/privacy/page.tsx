import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col relative overflow-hidden">
      
      {/* Ambient Blurs */}
      <div className="absolute rounded-full filter blur-[120px] opacity-60 bg-[#DDE6DE] w-[40rem] h-[40rem] top-[-10%] left-[-10%] -z-10 pointer-events-none" />
      <div className="absolute rounded-full filter blur-[100px] opacity-40 bg-[#EAE2D0] w-[30rem] h-[30rem] bottom-[10%] right-[-5%] -z-10 pointer-events-none" />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-[3rem] shadow-sm border border-white">
          
          <div className="mb-12 border-b border-[#2C332B]/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-playfair text-[#2C332B] mb-4 tracking-tight">Política de Privacidad</h1>
            <p className="text-sm font-inter text-[#2C332B]/60 uppercase tracking-widest">Entrada en vigor: {currentDate}</p>
          </div>

          <div className="space-y-8 font-inter text-[#2C332B]/80 text-sm md:text-base leading-relaxed font-light">
            
            {/* 1. Propietario del sitio web (Iubenda Requirement) */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">1. ¿Quién es el Propietario y Responsable del Tratamiento?</h2>
              <p>
                El responsable del tratamiento de los datos recogidos a través de esta plataforma es <strong>Prevenia HealthTech</strong> ("nosotros", "la Plataforma"). Puede contactarnos en cualquier momento a través de los canales de soporte indicados en nuestro sitio web para cualquier consulta sobre la privacidad de sus datos.
              </p>
            </section>

            {/* 2. Qué datos se recogen y fuentes (Iubenda Requirement) */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">2. ¿Qué datos personales recogemos y de qué fuentes?</h2>
              <p>Recopilamos dos categorías de información mediante las siguientes fuentes:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#2C332B]/70">
                <li><strong>Proporcionados automáticamente (Terceros):</strong> Al iniciar sesión mediante Google OAuth, recibimos su nombre público, dirección de correo electrónico y fotografía de perfil.</li>
                <li><strong>Proporcionados por el usuario (Directamente):</strong> Datos sensibles de salud que usted ingresa voluntariamente en nuestros formularios, los cuales incluyen: edad, peso, estatura, circunferencia de cintura, historial familiar, nivel de actividad física, dieta, medicación, nivel de glucosa en ayunas y presión arterial.</li>
              </ul>
            </section>

            {/* 3 y 4. Finalidad y Base Jurídica (Iubenda Requirement) */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">3. Finalidad y Base Jurídica del Procesamiento</h2>
              <p>
                <strong>Finalidad:</strong> Utilizamos sus datos exclusivamente para generar un reporte predictivo de riesgo metabólico utilizando modelos de Inteligencia Artificial basados en literatura clínica oficial (ej. OMS). 
              </p>
              <p className="mt-2">
                <strong>Base Jurídica:</strong> Al tratarse de datos médicos (considerados de categoría especial), la base jurídica para el tratamiento de su información es el <strong>consentimiento explícito</strong> que usted otorga al enviar el formulario de evaluación.
              </p>
            </section>

            {/* 5, 6 y 7. Terceros y Transferencia Internacional (Iubenda Requirement) */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">4. Compartición con Terceros y Transferencias Internacionales</h2>
              <p>
                Para prestar nuestros servicios, dependemos de infraestructuras tecnológicas externas. Sus datos pueden ser compartidos de forma encriptada con los siguientes proveedores:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#2C332B]/70">
                <li><strong>Google Cloud & Gemini API:</strong> Procesamiento del algoritmo de Inteligencia Artificial. Garantizamos que los datos compartidos con este proveedor <strong>no son utilizados para entrenar modelos públicos de IA</strong>.</li>
                <li><strong>Proveedores de Base de Datos:</strong> Alojamiento en la nube (Servidores seguros en EE.UU. o Europa).</li>
              </ul>
              <p className="mt-2">
                Al utilizar Prevenia, usted consiente la transferencia internacional de sus datos a las jurisdicciones donde operan estos proveedores, amparados bajo cláusulas contractuales tipo y estándares de encriptación modernos.
              </p>
            </section>

            {/* 8. Derechos del Usuario (Iubenda Requirement) */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">5. ¿Cuáles son sus Derechos? (ARCO y RGPD)</h2>
              <p>
                Usted mantiene el control total sobre su información y tiene derecho a:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#2C332B]/70">
                <li><strong>Acceder:</strong> Solicitar y visualizar todo el historial médico almacenado en su Dashboard.</li>
                <li><strong>Rectificar:</strong> Actualizar o corregir su información personal en la sección de "Ajustes de Perfil".</li>
                <li><strong>Cancelar/Borrar:</strong> Solicitar la eliminación irreversible de sus registros clínicos y cuenta.</li>
                <li><strong>Oponerse:</strong> Revocar su consentimiento para el procesamiento futuro de datos.</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">6. Uso de Cookies</h2>
              <p>
                Este sitio web utiliza cookies <strong>estrictamente necesarias</strong> (proporcionadas por NextAuth.js) con la única finalidad de mantener su sesión abierta de manera segura y prevenir ataques de falsificación de solicitudes (CSRF). No utilizamos cookies de rastreo publicitario.
              </p>
            </section>

            {/* 9. Notificación de Cambios (Iubenda Requirement) */}
            <section>
              <h2 className="text-xl font-playfair text-[#2C332B] mb-3 font-medium">7. Notificaciones sobre Actualizaciones</h2>
              <p>
                Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Si realizamos cambios sustanciales sobre cómo tratamos sus datos de salud, le notificaremos de forma destacada dentro de nuestro sitio web o mediante la dirección de correo electrónico vinculada a su cuenta antes de que el cambio entre en vigor.
              </p>
            </section>

            {/* Disclaimer Médico (Importante en HealthTech) */}
            <section className="bg-[#EFECE5]/50 p-6 rounded-2xl border border-[#2C332B]/10 mt-8">
              <h2 className="text-lg font-playfair text-[#2C332B] mb-2 font-medium">Aviso de Exención de Responsabilidad Médica</h2>
              <p className="text-xs">
                Prevenia es una herramienta informativa. Los datos procesados y los informes generados por Inteligencia Artificial no equivalen a una consulta, diagnóstico o tratamiento médico formal. El uso de esta plataforma es bajo su propio riesgo y discreción. Siempre busque la orientación de su médico u otro proveedor de salud calificado ante cualquier pregunta que pueda tener con respecto a una afección médica.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-[#2C332B]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#2C332B]/50 uppercase tracking-widest">
                Protección de Datos Prevenia © {new Date().getFullYear()}
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