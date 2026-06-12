import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'prevenia-pruebas.loca.lt',
    'major-ghosts-sink.loca.lt' // Dejamos también la que ya te generó por si acaso
  ],
};

export default nextConfig;
