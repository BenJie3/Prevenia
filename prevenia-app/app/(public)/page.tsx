import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-teal-700">
          Bienvenido a Prevenia
        </h1>
        <p className="mt-2 text-slate-600">
          Evaluación predictiva impulsada por IA clínica
        </p>
      </div>
      
      <Button className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-6 rounded-xl text-lg shadow-sm">
        Comenzar Evaluación
      </Button>
    </main>
  );
}