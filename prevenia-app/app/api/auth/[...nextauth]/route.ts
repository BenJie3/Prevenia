import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  // Conecta NextAuth automáticamente para que escriba en nuestras tablas de Prisma
  adapter: PrismaAdapter(prisma),
  providers: [
    // Opción A: Inicio con Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "PACIENTE", // Por defecto entran como pacientes
        }
      }
    }),
    
    // Opción B: Inicio tradicional (Correo y Contraseña)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Por favor, rellena todos los campos.");
        }
        
        // Buscamos al usuario en la base de datos
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        
        if (!user || !user.password) {
          throw new Error("Credenciales incorrectas o te registraste con Google.");
        }
        
        // VALIDADOR DE BORRADO LÓGICO: Si la cuenta fue eliminada, bloquear acceso
        if (user.deletedAt !== null) {
          throw new Error("Esta cuenta ha sido dada de baja voluntariamente.");
        }
        
        // Verificar contraseña encriptada con Bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta.");
        }
        
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Guarda el ID y Rol en el Token interno
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role; 
      }
      return token;
    },
    // Expone el ID y Rol al Frontend para ocultar/mostrar botones
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt", 
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };