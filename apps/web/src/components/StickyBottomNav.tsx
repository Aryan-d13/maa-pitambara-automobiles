"use client";

import { TranslationDict } from "@mp-auto/content";

interface StickyBottomNavProps {
  phone: string;
  whatsapp: string;
  translations: TranslationDict;
  lang: 'en' | 'hi';
}

export default function StickyBottomNav({ phone, whatsapp, translations, lang }: StickyBottomNavProps) {
  // Format WhatsApp Link
  const cleanedWhatsapp = whatsapp.replace(/[^0-9]/g, ""); // Ensure only digits
  const defaultText = lang === 'hi'
    ? "नमस्ते माँ पीताम्बरा ऑटोमोबाइल्स, मुझे न्यू हॉलैंड ट्रैक्टर के बारे में जानकारी चाहिए।"
    : "Hello Maa Pitambara Automobiles, I would like to inquire about New Holland tractors.";
  const encodedText = encodeURIComponent(defaultText);
  const whatsappUrl = `https://wa.me/${cleanedWhatsapp}?text=${encodedText}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between gap-3 sm:gap-4 md:hidden">
      {/* Phone Call CTA */}
      <a
        href={`tel:${phone}`}
        className="flex-1 min-h-[64px] flex items-center justify-center gap-3 px-4 bg-[#0051BA] hover:bg-[#003e92] active:scale-95 text-white text-lg sm:text-xl font-black rounded-2xl shadow-md glow-blue transition-all cursor-pointer"
      >
        <span className="text-2xl">📞</span>
        <span className="tracking-wide uppercase">{translations.callNow || "Call"}</span>
      </a>

      {/* WhatsApp Message CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-h-[64px] flex items-center justify-center gap-3 px-4 bg-[#25D366] hover:bg-[#1ebd5b] active:scale-95 text-white text-lg sm:text-xl font-black rounded-2xl shadow-md glow-green transition-all cursor-pointer"
      >
        <span className="text-3xl">💬</span>
        <span className="tracking-wide uppercase">{translations.whatsappUs || "WhatsApp"}</span>
      </a>
    </div>
  );
}
