"use client";

import { Tractor, TranslationDict } from "@mp-auto/content";
import { speakText } from "./AudioPlayer";

interface TractorCardProps {
  tractor: Tractor;
  lang: 'en' | 'hi';
  translations: TranslationDict;
  phone: string;
}

export default function TractorCard({ tractor, lang, translations, phone }: TractorCardProps) {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    let text = "";
    if (lang === 'hi') {
      text = `यह न्यू हॉलैंड का ${tractor.name} ट्रैक्टर है। इसकी क्षमता ${tractor.hp} हॉर्सपावर है।`;
      if (tractor.engine) text += ` इसमें ${tractor.cylinders || ''} सिलेंडर ${tractor.engine} इंजन लगा है।`;
      if (tractor.ptoHp) text += ` PTO पावर ${tractor.ptoHp} है।`;
      if (tractor.liftingCapacity) text += ` लिफ्टिंग कैपेसिटी ${tractor.liftingCapacity} है।`;
      text += ` कीमत जानने के लिए ${phone.replace(/[^0-9]/g, '')} पर कॉल करें।`;
    } else {
      text = `This is the ${tractor.name} tractor with ${tractor.hp} Horsepower.`;
      if (tractor.engine) text += ` It features a ${tractor.cylinders || ''} cylinder ${tractor.engine} engine.`;
      if (tractor.ptoHp) text += ` PTO power output is ${tractor.ptoHp}.`;
      if (tractor.liftingCapacity) text += ` Hydraulic lifting capacity is ${tractor.liftingCapacity}.`;
      text += ` Call ${phone.replace(/[^0-9]/g, '')} for the best price.`;
    }
    
    speakText(text, lang);
  };

  const categoryColors: Record<string, string> = {
    "Heavy Duty": "bg-red-500",
    "Premium Heavy Duty": "bg-purple-600",
    "Best Seller": "bg-amber-500",
    "Fuel Efficient": "bg-emerald-500",
    "All Rounder": "bg-blue-500",
    "Mini / Compact": "bg-teal-500",
  };

  const categoryBgColor = tractor.category ? (categoryColors[tractor.category] || "bg-slate-500") : "bg-slate-500";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover-scale glow-blue flex flex-col h-full group">
      {/* Tractor Image */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        <img
          src={tractor.imageUrl}
          alt={tractor.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category Badge */}
        {tractor.category && (
          <span className={`absolute top-3 left-3 px-3 py-1 ${categoryBgColor} text-white text-xs font-extrabold rounded-full uppercase tracking-wider shadow-md`}>
            {tractor.category}
          </span>
        )}
        {/* HP Badge */}
        <span className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-800 text-sm font-black rounded-full shadow-md">
          {tractor.hp} HP
        </span>
      </div>

      {/* Card Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-tight">
            {tractor.name}
          </h3>
          {/* Read Aloud Button */}
          <button
            onClick={handleSpeak}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0051BA]/10 hover:bg-[#0051BA] text-[#0051BA] hover:text-white transition-all duration-200 cursor-pointer border-2 border-[#0051BA]/20 shrink-0"
            title={translations.speakText || "Listen"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </svg>
          </button>
        </div>

        {/* Price Display */}
        <div className="mb-4 px-3 py-2 bg-gradient-to-r from-[#0051BA]/5 to-[#0051BA]/10 rounded-xl border border-[#0051BA]/15">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'एक्स-शोरूम कीमत' : 'Ex-Showroom Price'}
            </span>
          </div>
          <span className="text-[#0051BA] font-black text-lg block mt-0.5">
            {tractor.price === "Price on Request" ? (translations.priceOnCall || "Call Us") : tractor.price}
          </span>
        </div>

        {/* Technical Specs Grid */}
        <div className="space-y-1.5 mb-4 text-sm">
          {tractor.engine && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">⚙️</span>
                {lang === 'hi' ? 'इंजन' : 'Engine'}
              </span>
              <span className="text-slate-800 font-bold text-right">{tractor.engine}</span>
            </div>
          )}
          {tractor.cylinders && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">🔧</span>
                {lang === 'hi' ? 'सिलेंडर' : 'Cylinders'}
              </span>
              <span className="text-slate-800 font-bold">{tractor.cylinders}</span>
            </div>
          )}
          {tractor.displacement && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">📏</span>
                {lang === 'hi' ? 'डिस्प्लेसमेंट' : 'Displacement'}
              </span>
              <span className="text-slate-800 font-bold">{tractor.displacement}</span>
            </div>
          )}
          {tractor.ptoHp && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">⚡</span>
                PTO {lang === 'hi' ? 'पावर' : 'Power'}
              </span>
              <span className="text-slate-800 font-bold">{tractor.ptoHp}</span>
            </div>
          )}
          {tractor.liftingCapacity && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">🏋️</span>
                {lang === 'hi' ? 'लिफ्टिंग क्षमता' : 'Lifting'}
              </span>
              <span className="text-slate-800 font-bold">{tractor.liftingCapacity}</span>
            </div>
          )}
          {tractor.gears && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">🔀</span>
                {lang === 'hi' ? 'गियर्स' : 'Gears'}
              </span>
              <span className="text-slate-800 font-bold">{tractor.gears}</span>
            </div>
          )}
          {tractor.weight && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="text-base">⚖️</span>
                {lang === 'hi' ? 'वज़न' : 'Weight'}
              </span>
              <span className="text-slate-800 font-bold">{tractor.weight}</span>
            </div>
          )}
        </div>

        {/* Call to Action Inside Card */}
        <div className="mt-auto space-y-2">
          <a
            href={`tel:${phone}`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0051BA] hover:bg-[#003e92] text-white font-extrabold text-center rounded-xl transition-colors cursor-pointer text-base shadow-sm"
          >
            <span>📞</span>
            <span>{translations.askPrice || "Ask Price"}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
