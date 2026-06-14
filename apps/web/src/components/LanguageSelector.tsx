"use client";

interface LanguageSelectorProps {
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
}

export default function LanguageSelector({ lang, setLang }: LanguageSelectorProps) {
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className="px-5 py-2.5 bg-[#0051BA] text-white font-bold rounded-full text-base sm:text-lg shadow-md hover:bg-[#003e92] active:scale-95 transition-all border-2 border-white flex items-center gap-2 cursor-pointer"
      title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <span className="text-xl">🌐</span>
      <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
    </button>
  );
}
