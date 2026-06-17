import React, { useId } from "react";
import { Meal } from "../types";
import { Sparkles, Check, Flame, Trophy } from "lucide-react";

interface AiAnalysisStampProps {
  result: Partial<Meal>;
  onLogMeal: () => void;
  isLoading: boolean;
}

export default function AiAnalysisStamp({ result, onLogMeal, isLoading }: AiAnalysisStampProps) {
  const stampId = useId();
  if (isLoading) {
    return (
      <div 
        id={`loading-${stampId}`}
        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#8b7355]/40 rounded-xl bg-amber-50/20 my-4"
      >
        <span className="w-10 h-10 border-4 border-[#8d6e63] border-t-transparent rounded-full animate-spin mb-3"></span>
        <p className="font-handwritten text-xl text-[#5d4037] text-center animate-pulse">
          Mengambil tinta emas... Menganalisis piring makan Anda dengan AI...
        </p>
      </div>
    );
  }

  if (!result || !result.name) return null;

  return (
    <div 
      id={`ai-stamp-${stampId}`}
      className="relative p-6 border-4 border-emerald-800/80 rounded-lg bg-[#faf8f5] shadow-md my-4 transform rotate-[-1deg] transition-all"
    >
      {/* Ink Stamp Overlay Effect */}
      <div className="absolute top-2 right-2 border-2 border-emerald-800/40 text-emerald-800/80 font-serif text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase rotate-12 pointer-events-none select-none">
        AI VERIFIED
      </div>

      <h3 className="font-serif font-bold text-lg text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
        Stampel Analisis Gizi AI
      </h3>

      <div className="space-y-2">
        <div id={`food-name-${stampId}`}>
          <span className="text-xs uppercase text-emerald-800/70 font-semibold block tracking-wider">Makanan terdeteksi</span>
          <span className="font-serif font-medium text-lg text-slate-800 tracking-tight leading-snug">
            {result.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-emerald-50/30 p-2.5 rounded border border-emerald-100">
          <div id={`calories-${stampId}`} className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-full text-orange-700">
              <Flame className="w-4 h-4 fill-orange-100" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-800/70 block font-semibold leading-none">Energi</span>
              <span className="font-serif font-bold text-lg text-slate-800 leading-none">
                {result.calories} <span className="text-xs font-normal text-slate-500">kkal</span>
              </span>
            </div>
          </div>

          <div id={`macros-${stampId}`}>
            <span className="text-[10px] uppercase text-emerald-800/70 block font-semibold tracking-wider mb-1">Kandungan Makro</span>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-sans">
              <div className="bg-amber-100/60 px-1 py-0.5 rounded text-center text-amber-800 border border-amber-200">
                <span className="block text-[8px] font-bold">Karb</span>
                <span className="font-semibold">{result.carbs ?? 0}g</span>
              </div>
              <div className="bg-rose-100/60 px-1 py-0.5 rounded text-center text-rose-800 border border-rose-200">
                <span className="block text-[8px] font-bold">Prot</span>
                <span className="font-semibold">{result.protein ?? 0}g</span>
              </div>
              <div className="bg-blue-100/60 px-1 py-0.5 rounded text-center text-blue-800 border border-blue-200">
                <span className="block text-[8px] font-bold">Lemak</span>
                <span className="font-semibold">{result.fat ?? 0}g</span>
              </div>
            </div>
          </div>
        </div>

        {result.explanation && (
          <div id={`explanation-${stampId}`} className="text-slate-600 text-xs leading-relaxed border-t border-dashed border-emerald-100 pt-2 font-sans italic">
            <strong>Penaksiran Porsi:</strong> {result.explanation}
          </div>
        )}

        {result.journalNote && (
          <div id={`journal-note-${stampId}`} className="border-t border-emerald-800/20 pt-2">
            <span className="text-[10px] uppercase text-amber-800 font-semibold block tracking-wider font-sans">Catatan Gizi handwritten</span>
            <p className="font-handwritten text-xl text-amber-900 leading-snug pt-1 pl-1 filter drop-shadow-[0_1px_rgba(255,255,255,1)]">
              "{result.journalNote}"
            </p>
          </div>
        )}

        <button
          id={`btn-log-${stampId}`}
          type="button"
          onClick={onLogMeal}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-serif py-2 rounded-md shadow-sm transition-all border border-emerald-950 font-bold tracking-wide"
        >
          <Trophy className="w-4 h-4 text-emerald-200 fill-emerald-800" />
          Tulis ke Buku Harian
        </button>
      </div>
    </div>
  );
}
