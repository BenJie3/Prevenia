import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'prevenia-pruebas.loca.lt',
    'major-ghosts-sink.loca.lt' // Dejamos también la que ya te generó por si acaso
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Avatares de Google
      }
    ],
  },
  // 🛡️ CABECERAS DE SEGURIDAD EXTREMA
  async headers() {
    return [
      {
        source: '/(.*)', // Aplica a todas las rutas de la web
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Evita ataques de Clickjacking (nadie puede meter tu web en un iframe)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Evita que los hackers engañen al navegador con tipos de archivos falsos
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protege la privacidad de dónde vienen tus usuarios
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Obliga a usar siempre HTTPS seguro
          },
        ],
        
      },
    ];
  },
};

export default nextConfig;
