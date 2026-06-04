"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface InterviewFormData {
  role: string;
  techstack: string;
  level: "junior" | "Semi-Senior" | "Senior";
  type: "tecnica" | "conductual" | "combinada";
  amount: number;
}

interface InterviewFormProps {
  userId: string;
}

const LEVELS = ["junior", "Semi-Senior", "Senior"] as const;
const TYPES = [
  { value: "tecnica", label: "Técnica" },
  { value: "conductual", label: "Conductual" },
  { value: "combinada", label: "Combinada" },
] as const;
const AMOUNTS = [2, 5, 8, 10, 15];

const InterviewForm = ({ userId }: InterviewFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState<InterviewFormData>({
    role: "",
    techstack: "",
    level: "junior",
    type: "tecnica",
    amount: 5,
  });

  const handleSubmit = async () => {
    if (!form.role.trim() || !form.techstack.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const apiUrl = typeof window !== "undefined"
        ? "/api/proxy"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/vapi/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userid: userId }),
      });

      if (!res.ok) throw new Error("Error al generar la entrevista.");
      router.push("/dashboard");
    } catch (e) {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      <div className="card-border">
        <div className="card p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h3 className="text-primary-100">Configura tu entrevista</h3>
            <p className="text-sm text-light-400">
              Completa los datos para generar preguntas personalizadas
            </p>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">
              Rol / Puesto
            </label>
            <input
              className="bg-dark-200 rounded-full min-h-12 px-5 text-white placeholder:text-light-600 border border-input focus:outline-none focus:border-primary-200 transition-colors"
              placeholder="Ej: Frontend Developer, Backend, Fullstack..."
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>

          {/* Techstack */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">
              Tecnologías
            </label>
            <input
              className="bg-dark-200 rounded-full min-h-12 px-5 text-white placeholder:text-light-600 border border-input focus:outline-none focus:border-primary-200 transition-colors"
              placeholder="Ej: React, Node.js, TypeScript, PostgreSQL..."
              value={form.techstack}
              onChange={(e) => setForm({ ...form, techstack: e.target.value })}
            />
          </div>

          {/* Level */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">
              Nivel de experiencia
            </label>
            <div className="flex gap-3 flex-wrap">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setForm({ ...form, level })}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                    form.level === level
                      ? "bg-primary-200 text-dark-100 border-primary-200"
                      : "bg-dark-200 text-light-100 border-input hover:border-primary-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">
              Tipo de entrevista
            </label>
            <div className="flex gap-3 flex-wrap">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, type: value })}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                    form.type === value
                      ? "bg-primary-200 text-dark-100 border-primary-200"
                      : "bg-dark-200 text-light-100 border-input hover:border-primary-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">
              Número de preguntas
            </label>
            <div className="flex gap-3 flex-wrap items-center">
              {AMOUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setCustomAmount("");
                    setForm({ ...form, amount: n });
                  }}
                  className={`w-12 h-12 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                    form.amount === n && customAmount === ""
                      ? "bg-primary-200 text-dark-100 border-primary-200"
                      : "bg-dark-200 text-light-100 border-input hover:border-primary-200"
                  }`}
                >
                  {n}
                </button>
              ))}
              <div className="flex flex-col gap-1">
                <input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="Otro"
                  value={customAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomAmount(val);
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 1 && num <= 30) {
                      setForm({ ...form, amount: num });
                    }
                  }}
                  className="w-20 h-12 rounded-full text-sm font-bold border border-input bg-dark-200 text-white text-center placeholder:text-light-600 focus:outline-none focus:border-primary-200 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <p className="text-xs text-light-600">Elige una opción o escribe entre 1 y 30 preguntas.</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-destructive-100 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full min-h-12 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Generando entrevista..." : "Generar entrevista"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;
