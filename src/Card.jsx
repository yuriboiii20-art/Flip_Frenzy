import React from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import { animalConfig } from "./data";

export default function Card({ card, onClick, disabled }) {
  const config = animalConfig[card.emoji] || {
    icon: null,
    bg: "from-indigo-500/30 to-purple-600/40",
    border: "border-indigo-400/50",
    text: "text-indigo-300",
    glowClass: "shadow-[0_0_20px_rgba(99,102,241,0.8)] border-indigo-400"
  };

  const IconComponent = config.icon;

  return (
    <div
      className="w-20 h-24 sm:w-22 sm:h-28 perspective-800 cursor-pointer transition-all duration-300 hover:scale-105 select-none group"
      onClick={!disabled ? onClick : null}
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-3d relative rounded-2xl ${
          card.isFlipped || card.isMatched ? "rotate-y-180" : ""
        }`}
      >
        {/* Front (Revealed Card with Unique Color & Custom Animal Glow when matched) */}
        <div
          className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center backface-hidden bg-gradient-to-b ${config.bg} backdrop-blur-md border-2 transition-all duration-300 ${
            card.isFlipped || card.isMatched ? "rotate-y-180" : ""
          } ${
            card.isMatched
              ? `${config.glowClass} animate-pulse ring-2 ring-white/40`
              : `${config.border} shadow-lg`
          }`}
        >
          {/* Subtle sparkles background pattern */}
          <Sparkles className="absolute top-1.5 right-1.5 w-3 h-3 text-white/20" />

          {/* Render Vector Animal Icon */}
          {IconComponent ? (
            <div className={`p-2 rounded-xl bg-slate-950/40 border border-white/10 ${config.text} drop-shadow-md transform transition-transform duration-300 group-hover:scale-110`}>
              <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.25]" />
            </div>
          ) : (
            <span className="text-4xl filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-110">
              {card.emoji}
            </span>
          )}

          {/* Animal Label */}
          <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase text-slate-200/80">
            {config.name || "Animal"}
          </span>
        </div>

        {/* Back (Hidden Card: Identical dark slate glass pattern on all facedown cards) */}
        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center backface-hidden bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 backdrop-blur-md border border-slate-700/60 shadow-xl group-hover:border-indigo-500/50 transition-colors duration-300">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400/80 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-300">
            <HelpCircle className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
