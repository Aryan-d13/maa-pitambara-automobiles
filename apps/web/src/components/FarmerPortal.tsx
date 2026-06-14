"use client";

import { useState } from "react";
import { SiteContent } from "@mp-auto/content";
import LanguageSelector from "./LanguageSelector";
import TractorCard from "./TractorCard";
import StickyBottomNav from "./StickyBottomNav";
import { speakText, stopSpeaking } from "./AudioPlayer";

interface FarmerPortalProps {
  initialContent: SiteContent;
}

export default function FarmerPortal({ initialContent }: FarmerPortalProps) {
  const [lang, setLang] = useState<'en' | 'hi'>('hi'); // Defaulting to Hindi for rural Madhya Pradesh
  const { contact, translations, tractors } = initialContent;
  const t = translations[lang];

  // Voice greeting read-aloud
  const handlePlayGreeting = () => {
    speakText(t.speakIntro, lang);
  };

  const handleStopGreeting = () => {
    stopSpeaking();
  };

  const cleanedWhatsapp = contact.whatsapp.replace(/[^0-9]/g, "");
  const defaultText = lang === 'hi'
    ? "नमस्ते माँ पीताम्बरा ऑटोमोबाइल्स, मुझे न्यू हॉलैंड ट्रैक्टर के बारे में जानकारी चाहिए।"
    : "Hello Maa Pitambara Automobiles, I would like to inquire about New Holland tractors.";
  const encodedText = encodeURIComponent(defaultText);
  const whatsappUrl = `https://wa.me/${cleanedWhatsapp}?text=${encodedText}`;

  // Stats data
  const stats = [
    { icon: "🚜", value: "6+", label: lang === 'hi' ? 'ट्रैक्टर मॉडल' : 'Tractor Models' },
    { icon: "⚙️", value: "17-65", label: lang === 'hi' ? 'HP रेंज' : 'HP Range' },
    { icon: "🔧", value: "100%", label: lang === 'hi' ? 'असली पार्ट्स' : 'Genuine Parts' },
    { icon: "📞", value: "24/7", label: lang === 'hi' ? 'सपोर्ट उपलब्ध' : 'Support Available' },
  ];

  // Service features
  const serviceFeatures = [
    { icon: "🔧", titleEn: "Engine Overhaul", titleHi: "इंजन ओवरहॉल", descEn: "Complete FPT engine servicing & rebuilds", descHi: "पूर्ण FPT इंजन सर्विसिंग और रिबिल्ड" },
    { icon: "⚙️", titleEn: "Hydraulic Repair", titleHi: "हाइड्रॉलिक मरम्मत", descEn: "Sensomatic hydraulic system diagnostics", descHi: "सेंसोमैटिक हाइड्रॉलिक सिस्टम डायग्नोस्टिक्स" },
    { icon: "🛞", titleEn: "PTO Service", titleHi: "PTO सर्विस", descEn: "Power Take-Off inspection & repair", descHi: "पावर टेक-ऑफ निरीक्षण और मरम्मत" },
    { icon: "🛡️", titleEn: "Genuine Parts", titleHi: "असली पार्ट्स", descEn: "100% original New Holland spare parts", descHi: "100% ओरिजिनल न्यू हॉलैंड स्पेयर पार्ट्स" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe-bottom md:pb-0">
      
      {/* Visual Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-150 px-4 sm:px-6 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🚜</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">
                {t.heroTitle}
              </h1>
              <span className="text-xs sm:text-sm text-[#0051BA] font-extrabold tracking-wide uppercase mt-1 block">
                NEW HOLLAND
              </span>
            </div>
          </div>
          <LanguageSelector lang={lang} setLang={setLang} />
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative text-white py-16 sm:py-20 px-4 sm:px-6 md:px-8 shadow-inner overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero_banner.webp" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0051BA]/85 via-[#0051BA]/75 to-[#003e92]/90" />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none z-[1]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 pointer-events-none z-[1]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full text-sm sm:text-base font-extrabold tracking-wider uppercase shadow-md mb-6 inline-block animate-pulse-slow">
            {lang === 'hi' ? "शाजापुर का अपना ट्रैक्टर शोरूम" : "Authorized Shajapur Showroom"}
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight drop-shadow-sm">
            {t.heroTitle}
          </h2>
          
          <p className="text-lg sm:text-xl font-medium text-blue-100 max-w-2xl mx-auto mb-8">
            {t.heroSubtitle}
          </p>

          {/* Audio Intro Trigger */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={handlePlayGreeting}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#0051BA] hover:bg-slate-100 font-extrabold rounded-2xl shadow-lg hover-scale cursor-pointer text-lg"
            >
              <span className="text-2xl">🔊</span>
              <span>{t.speakText}</span>
            </button>
            <button
              onClick={handleStopGreeting}
              className="flex items-center justify-center p-4 bg-red-500/20 text-white hover:bg-red-500 hover:text-white font-extrabold rounded-2xl cursor-pointer"
              title={lang === 'hi' ? "आवाज़ बंद करें" : "Stop Audio"}
            >
              <span className="text-xl">🛑</span>
            </button>
          </div>

          {/* Desktop Contact CTAs */}
          <div className="hidden md:flex items-center justify-center gap-4">
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 px-8 py-4 bg-white text-[#0051BA] font-black rounded-2xl shadow-md hover:bg-slate-100 transition-colors text-lg"
            >
              <span className="text-xl">📞</span>
              <span>{t.callNow} — {contact.phone.replace(/[^0-9]/g, '')}</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-black rounded-2xl shadow-md hover:bg-[#1ebd5b] transition-colors text-lg"
            >
              <span className="text-2xl">💬</span>
              <span>{t.whatsappUs}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <span className="text-3xl block">{stat.icon}</span>
              <div className="text-2xl font-black text-[#0051BA]">{stat.value}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Areas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 w-full space-y-16">
        
        {/* Tractors Catalog */}
        <section id="tractors" className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <span>🚜</span>
              <span>{t.navTractors}</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              {lang === 'hi' 
                ? '17 HP से 65 HP तक — सभी मॉडल स्टॉक में उपलब्ध • एक्स-शोरूम कीमतें*' 
                : 'From 17 HP to 65 HP — All models available in stock • Ex-showroom prices*'}
            </p>
            <div className="h-1.5 w-24 bg-[#0051BA] rounded-full mx-auto md:mx-0 mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {tractors.map((tractor) => (
              <TractorCard
                key={tractor.id}
                tractor={tractor}
                lang={lang}
                translations={t}
                phone={contact.phone}
              />
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 font-medium pt-2">
            {lang === 'hi'
              ? `* कीमतें अनुमानित एक्स-शोरूम हैं। सटीक कीमत और ऑफ़र के लिए ${contact.phone.replace(/[^0-9]/g, '')} पर कॉल करें।`
              : `* Prices shown are approximate ex-showroom. Call ${contact.phone.replace(/[^0-9]/g, '')} for exact pricing, offers & EMI options.`}
          </p>
        </section>

        {/* Service Workshop and Parts */}
        <section id="service" className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <span>🔧</span>
              <span>{t.serviceHeading}</span>
            </h2>
            <div className="h-1.5 w-24 bg-[#0051BA] rounded-full mx-auto md:mx-0 mt-2" />
          </div>

          {/* Service Hero Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200 flex flex-col md:flex-row">
            <div className="flex-1 p-6 sm:p-8 md:p-10 space-y-5">
              <span className="px-3 py-1 bg-[#25D366]/10 text-[#25D366] rounded-full text-sm font-extrabold tracking-wide uppercase">
                {lang === 'hi' ? "असली स्पेयर पार्ट्स" : "100% Genuine Spare Parts"}
              </span>
              <p className="text-slate-600 font-medium text-lg leading-relaxed">
                {t.serviceSubtitle}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0051BA] hover:bg-[#003e92] text-white font-extrabold rounded-xl text-base transition-all cursor-pointer shadow-sm"
                >
                  <span>🔧</span>
                  <span>{t.bookService}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white font-extrabold rounded-xl text-base transition-all cursor-pointer shadow-sm"
                >
                  <span>💬</span>
                  <span>{lang === 'hi' ? 'व्हाट्सएप पर बात करें' : 'Chat on WhatsApp'}</span>
                </a>
              </div>
            </div>
            <div className="w-full md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden">
              <img 
                src="/images/service_workshop.webp" 
                alt={lang === 'hi' ? 'सर्विस वर्कशॉप' : 'Service Workshop'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Service Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceFeatures.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 hover-scale text-center space-y-3">
                <span className="text-4xl block">{feature.icon}</span>
                <h3 className="text-lg font-black text-slate-800">
                  {lang === 'hi' ? feature.titleHi : feature.titleEn}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {lang === 'hi' ? feature.descHi : feature.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* Spare Parts Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
            <div className="relative aspect-[3/1] w-full">
              <img 
                src="/images/spare_parts.webp" 
                alt={lang === 'hi' ? 'असली स्पेयर पार्ट्स' : 'Genuine Spare Parts'} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0051BA]/80 to-transparent flex items-center">
                <div className="p-6 sm:p-10 text-white max-w-lg">
                  <h3 className="text-2xl sm:text-3xl font-black mb-2">
                    {lang === 'hi' ? '100% असली पार्ट्स गारंटी' : '100% Genuine Parts Guarantee'}
                  </h3>
                  <p className="text-sm sm:text-base text-blue-100 font-medium">
                    {lang === 'hi' 
                      ? 'हर पार्ट न्यू हॉलैंड की मूल वारंटी के साथ — बिना किसी नकली पार्ट के जोखिम के।'
                      : 'Every part comes with original New Holland warranty — no risk of counterfeit components.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Deliveries */}
        <section className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <span>🤝</span>
              <span>{lang === 'hi' ? 'खुशहाल किसान परिवार' : 'Happy Farmers Family'}</span>
            </h2>
            <div className="h-1.5 w-24 bg-[#0051BA] rounded-full mx-auto md:mx-0 mt-2" />
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden">
              <img 
                src="/images/delivery_ceremony.webp" 
                alt={lang === 'hi' ? 'किसान डिलीवरी समारोह' : 'Farmer Delivery Celebration'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-6 sm:p-8 md:p-10 space-y-4">
              <span className="px-3 py-1 bg-yellow-400/20 text-yellow-800 rounded-full text-sm font-extrabold tracking-wide uppercase">
                {lang === 'hi' ? "सच्चा भरोसा" : "Trusted Relationship"}
              </span>
              <h3 className="text-2xl font-black text-slate-800">
                {lang === 'hi' ? 'हर किसान का सपना, सच होता अपना' : 'Fulfilling the Dreams of Farmers'}
              </h3>
              <p className="text-slate-600 font-medium text-base leading-relaxed">
                {lang === 'hi' 
                  ? 'शाजापुर और आसपास के गांवों के सैकड़ों किसानों ने माँ पीताम्बरा ऑटोमोबाइल्स और न्यू हॉलैंड ट्रैक्टर्स पर अपना अटूट भरोसा जताया है। हम ट्रैक्टर डिलीवरी पर एक विशेष समारोह मनाते हैं और हर किसान परिवार का स्वागत करते हैं।'
                  : 'Hundreds of farmers across Shajapur and nearby villages have placed their trust in Maa Pitambara Automobiles and New Holland Tractors. We celebrate every tractor delivery with a special ceremony, welcoming each farming family into our fold.'}
              </p>
            </div>
          </div>
        </section>

        {/* Visit Us / Location */}
        <section id="location" className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <span>📍</span>
              <span>{t.location}</span>
            </h2>
            <div className="h-1.5 w-24 bg-[#0051BA] rounded-full mx-auto md:mx-0 mt-2" />
          </div>

          {/* Showroom Image Banner */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
            <div className="relative aspect-[3/1] w-full">
              <img 
                src="/images/showroom_exterior.webp" 
                alt={lang === 'hi' ? 'शोरूम' : 'Showroom'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent flex items-end">
                <div className="p-6 sm:p-8 text-white">
                  <h3 className="text-xl sm:text-2xl font-black">
                    {lang === 'hi' ? 'माँ पीताम्बरा ऑटोमोबाइल्स शोरूम' : 'Maa Pitambara Automobiles Showroom'}
                  </h3>
                  <p className="text-sm text-slate-200 font-medium mt-1">
                    {lang === 'hi' ? 'बायपास रोड, बस स्टैंड के पास, शाजापुर (म.प्र.)' : 'Bypass Road, Near Bus Stand, Shajapur (M.P.)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Address Details */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-4xl">🏢</span>
                <h3 className="text-xl font-bold text-slate-800">
                  {lang === 'hi' ? "शोरूम का पता" : "Showroom Address"}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {t.addressLabel}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'hi' ? 'पिन कोड: 465001' : 'PIN: 465001'}
                </p>
              </div>
              <div className="pt-6">
                <a
                  href={contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-[#0051BA] font-extrabold rounded-xl transition-all cursor-pointer border border-slate-300"
                >
                  🗺️ {lang === 'hi' ? "गूगल मैप्स पर देखें" : "Open in Google Maps"}
                </a>
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-4xl">📞</span>
                <h3 className="text-xl font-bold text-slate-800">
                  {lang === 'hi' ? "त्वरित संपर्क" : "Quick Contacts"}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{lang === 'hi' ? "फ़ोन नंबर" : "Calling Phone"}</span>
                    <a href={`tel:${contact.phone}`} className="text-[#0051BA] font-black">{contact.phone.replace(/[^0-9]/g, '')}</a>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{lang === 'hi' ? "व्हाट्सएप नंबर" : "WhatsApp"}</span>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-black">{contact.whatsapp.replace(/[^0-9]/g, '')}</a>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold py-1.5">
                    <span className="text-slate-500">{lang === 'hi' ? "डीलर कोड" : "Dealer Code"}</span>
                    <span className="text-slate-800 font-bold">NH-MP-SHP</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <a
                  href={`tel:${contact.phone}`}
                  className="w-full text-center block py-3.5 bg-[#0051BA] hover:bg-[#003e92] text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  📞 {t.callNow}
                </a>
              </div>
            </div>

            {/* Timing & Showroom */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-4xl">🕒</span>
                <h3 className="text-xl font-bold text-slate-800">
                  {lang === 'hi' ? "शोरूम का समय" : "Showroom Timings"}
                </h3>
                <div className="space-y-2 text-sm text-slate-600 font-semibold">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{lang === 'hi' ? "सोमवार - शनिवार" : "Mon - Sat"}</span>
                    <span className="text-slate-800 font-bold">09:00 AM - 07:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{lang === 'hi' ? "रविवार" : "Sunday"}</span>
                    <span className="text-red-500 font-bold">{lang === 'hi' ? "बंद रहेगा" : "Closed"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>{lang === 'hi' ? "इमरजेंसी सर्विस" : "Emergency Service"}</span>
                    <span className="text-emerald-600 font-bold">{lang === 'hi' ? "24/7 उपलब्ध" : "24/7 Available"}</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block py-3.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  💬 {t.whatsappUs}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-[#0051BA] to-[#003e92] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">
            {lang === 'hi' ? 'माँ पीताम्बरा को ही क्यों चुनें?' : 'Why Choose Maa Pitambara?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "✅", titleEn: "Authorized NH Dealer", titleHi: "अधिकृत NH डीलर", descEn: "Factory-authorized New Holland dealership with full brand support", descHi: "फ़ैक्टरी-अधिकृत न्यू हॉलैंड डीलरशिप पूर्ण ब्रांड सपोर्ट के साथ" },
              { icon: "💰", titleEn: "Best Price Guarantee", titleHi: "सबसे अच्छी कीमत", descEn: "Competitive pricing with easy EMI & financing options", descHi: "आसान EMI और फाइनेंसिंग विकल्पों के साथ प्रतिस्पर्धी मूल्य" },
              { icon: "🏆", titleEn: "Trusted Since Years", titleHi: "सालों से विश्वसनीय", descEn: "Serving farmers across Shajapur & surrounding districts", descHi: "शाजापुर और आसपास के ज़िलों के किसानों की सेवा में" },
              { icon: "🔧", titleEn: "Certified Service", titleHi: "प्रमाणित सर्विस", descEn: "Factory-trained mechanics with original diagnostic tools", descHi: "मूल डायग्नोस्टिक उपकरणों के साथ फ़ैक्टरी-प्रशिक्षित मैकेनिक" },
              { icon: "📦", titleEn: "Parts Always In Stock", titleHi: "पार्ट्स हमेशा उपलब्ध", descEn: "Large inventory of genuine spare parts for quick turnaround", descHi: "त्वरित सर्विस के लिए असली स्पेयर पार्ट्स का बड़ा स्टॉक" },
              { icon: "🤝", titleEn: "After-Sales Support", titleHi: "आफ्टर-सेल्स सपोर्ट", descEn: "Dedicated support team for all your tractor needs", descHi: "आपकी सभी ट्रैक्टर ज़रूरतों के लिए समर्पित सपोर्ट टीम" },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <h3 className="text-lg font-black mb-1">
                  {lang === 'hi' ? item.titleHi : item.titleEn}
                </h3>
                <p className="text-sm text-blue-100 font-medium">
                  {lang === 'hi' ? item.descHi : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Visual Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 md:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand */}
            <div className="space-y-2">
              <div className="text-xl font-black text-white">{t.heroTitle}</div>
              <p className="text-sm text-[#0051BA] font-extrabold uppercase tracking-wider">Authorized New Holland Dealer</p>
              <p className="text-sm text-slate-500">{t.addressLabel}</p>
            </div>
            {/* Quick Links */}
            <div className="space-y-2">
              <div className="text-sm font-bold text-white uppercase tracking-wider">{lang === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}</div>
              <a href="#tractors" className="block text-sm text-slate-400 hover:text-white transition-colors">{t.navTractors}</a>
              <a href="#service" className="block text-sm text-slate-400 hover:text-white transition-colors">{t.navService}</a>
              <a href="#location" className="block text-sm text-slate-400 hover:text-white transition-colors">{t.navContact}</a>
            </div>
            {/* Contact */}
            <div className="space-y-2">
              <div className="text-sm font-bold text-white uppercase tracking-wider">{lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}</div>
              <a href={`tel:${contact.phone}`} className="block text-sm text-slate-400 hover:text-white transition-colors">📞 {contact.phone.replace(/[^0-9]/g, '')}</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-400 hover:text-[#25D366] transition-colors">💬 WhatsApp: {contact.whatsapp.replace(/[^0-9]/g, '')}</a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 text-center">
            <div className="text-xs text-slate-600">
              © {new Date().getFullYear()} Maa Pitambara Automobiles. Authorized New Holland Dealer — Shajapur, MP. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA Bar */}
      <StickyBottomNav
        phone={contact.phone}
        whatsapp={contact.whatsapp}
        translations={t}
        lang={lang}
      />

    </div>
  );
}
