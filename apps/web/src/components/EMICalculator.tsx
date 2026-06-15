"use client";

import { useState, useEffect } from "react";
import { Tractor, TranslationDict } from "@mp-auto/content";

interface EMICalculatorProps {
  tractors: Tractor[];
  lang: "en" | "hi";
  translations: TranslationDict;
  phone: string;
  initialTractorId?: string;
  onClose?: () => void;
}

export default function EMICalculator({
  tractors,
  lang,
  translations,
  phone,
  initialTractorId = "",
  onClose,
}: EMICalculatorProps) {
  // Helpers
  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr.toLowerCase().includes("request") || priceStr.toLowerCase().includes("call") || priceStr.toLowerCase().includes("फोन")) {
      return 600000; // Default fallback 6 Lakh
    }
    const cleanStr = priceStr.replace(/,/g, "");
    const match = cleanStr.match(/(\d+(\.\d+)?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (cleanStr.toLowerCase().includes("lakh") || cleanStr.includes("Lakh") || priceStr.includes("लाख")) {
        return Math.round(val * 100000);
      }
      return Math.round(val);
    }
    return 600000;
  };

  const formatRupee = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // State
  const [selectedTractorId, setSelectedTractorId] = useState<string>(
    initialTractorId || (tractors[0]?.id || "custom")
  );
  
  const [tractorPrice, setTractorPrice] = useState<number>(600000);
  const [downPayment, setDownPayment] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  // Sync state on tractor change
  useEffect(() => {
    if (selectedTractorId === "custom") {
      // Keep current price but capped/adjusted
      return;
    }
    const tractor = tractors.find((t) => t.id === selectedTractorId);
    if (tractor) {
      const parsed = parsePrice(tractor.price);
      setTractorPrice(parsed);
      // Default downpayment to 25% of price
      setDownPayment(Math.round(parsed * 0.25));
    }
  }, [selectedTractorId, tractors]);

  // Adjust downpayment if it exceeds price
  useEffect(() => {
    if (downPayment >= tractorPrice) {
      setDownPayment(Math.round(tractorPrice * 0.9)); // Keep downpayment at max 90%
    }
  }, [tractorPrice, downPayment]);

  // Calculation Variables
  const loanAmount = Math.max(0, tractorPrice - downPayment);
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    emi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  } else if (loanAmount > 0) {
    emi = Math.round(loanAmount / totalMonths);
  }

  const totalPayment = emi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);
  const totalOutlay = downPayment + totalPayment;

  // Lead Generation WhatsApp Link
  const handleRequestFinance = () => {
    const selectedModelName =
      selectedTractorId === "custom"
        ? (lang === "hi" ? "कस्टम मॉडल" : "Custom Model")
        : tractors.find((t) => t.id === selectedTractorId)?.name || "";

    const message = lang === "hi"
      ? `नमस्ते माँ पीताम्बरा ऑटोमोबाइल्स शाजापुर, मुझे ट्रैक्टर फाइनेंस/EMI की जानकारी चाहिए:
- मॉडल: ${selectedModelName}
- ट्रैक्टर कीमत: ${formatRupee(tractorPrice)}
- डाउन पेमेंट: ${formatRupee(downPayment)}
- लोन राशि: ${formatRupee(loanAmount)}
- ब्याज दर: ${interestRate}%
- लोन अवधि: ${tenureYears} वर्ष
- अनुमानित मासिक EMI: ${formatRupee(emi)}/महीना

कृपया लोन की प्रक्रिया, आवश्यक दस्तावेज़ और सब्सिडी की जानकारी दें। धन्यवाद!`
      : `Hello Maa Pitambara Automobiles Shajapur, I am interested in tractor finance/EMI for:
- Model: ${selectedModelName}
- Tractor Price: ${formatRupee(tractorPrice)}
- Down Payment: ${formatRupee(downPayment)}
- Loan Amount: ${formatRupee(loanAmount)}
- Interest Rate: ${interestRate}%
- Loan Tenure: ${tenureYears} Years
- Estimated Monthly EMI: ${formatRupee(emi)}/month

Please provide information about the loan process, required documents, and subsidy details. Thanks!`;

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const t = translations;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 w-full max-w-4xl mx-auto flex flex-col md:flex-row">
      {/* Inputs Section */}
      <div className="flex-1 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>🧮</span>
            <span>{t.emiCalculatorTitle || "EMI Calculator"}</span>
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer font-bold text-lg"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider block">
              {t.emiTractorModel || "Select Tractor Model"}
            </label>
            <select
              value={selectedTractorId}
              onChange={(e) => setSelectedTractorId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm sm:text-base font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-[#0051BA] transition-colors cursor-pointer"
            >
              {tractors.map((tractor) => (
                <option key={tractor.id} value={tractor.id}>
                  {tractor.name} ({tractor.hp} HP)
                </option>
              ))}
              <option value="custom">
                {lang === "hi" ? "✍️ अन्य ट्रैक्टर / कस्टम कीमत" : "✍️ Custom Price / Other Model"}
              </option>
            </select>
          </div>

          {/* Tractor Price Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                {t.emiPrice || "Tractor Price"}
              </label>
              <span className="text-sm font-black text-[#0051BA]">{formatRupee(tractorPrice)}</span>
            </div>
            {selectedTractorId === "custom" ? (
              <input
                type="number"
                value={tractorPrice}
                onChange={(e) => setTractorPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm sm:text-base font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-[#0051BA] transition-colors"
                min="100000"
                max="2500000"
                step="10000"
              />
            ) : (
              <input
                type="range"
                value={tractorPrice}
                onChange={(e) => setTractorPrice(parseInt(e.target.value))}
                min={Math.round(parsePrice(tractors.find(tr => tr.id === selectedTractorId)?.price || "") * 0.85)}
                max={Math.round(parsePrice(tractors.find(tr => tr.id === selectedTractorId)?.price || "") * 1.15)}
                step="10000"
                className="w-full accent-[#0051BA] cursor-pointer"
              />
            )}
          </div>

          {/* Down Payment Input & Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                {t.emiDownPayment || "Down Payment"}
              </label>
              <span className="text-sm font-black text-slate-800">{formatRupee(downPayment)}</span>
            </div>
            <input
              type="range"
              value={downPayment}
              onChange={(e) => setDownPayment(parseInt(e.target.value))}
              min={Math.round(tractorPrice * 0.1)} // Minimum 10% downpayment
              max={Math.round(tractorPrice * 0.9)} // Maximum 90% downpayment
              step="5000"
              className="w-full accent-[#0051BA] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Min: 10% ({formatRupee(tractorPrice * 0.1)})</span>
              <span>Max: 90% ({formatRupee(tractorPrice * 0.9)})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                  {t.emiInterestRate || "Interest Rate"}
                </label>
                <span className="text-sm font-black text-[#0051BA]">{interestRate}%</span>
              </div>
              <input
                type="range"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                min="7.5"
                max="16.5"
                step="0.25"
                className="w-full accent-[#0051BA] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>7.5% (Best SBI Rate)</span>
                <span>16.5% (NBFC Max)</span>
              </div>
            </div>

            {/* Tenure Buttons */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider block">
                {t.emiTenure || "Loan Tenure"}
              </label>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[3, 4, 5, 6, 7].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-black transition-all border-2 cursor-pointer ${
                      tenureYears === yr
                        ? "bg-[#0051BA] border-[#0051BA] text-white shadow-md shadow-[#0051BA]/10"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {yr} {lang === "hi" ? "वर्ष" : "Yr"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outputs / Calculations Display (Premium Visual Block) */}
      <div className="w-full md:w-[320px] bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-700">
        <div className="space-y-6">
          <span className="px-2.5 py-1 bg-yellow-400 text-slate-950 rounded-lg text-[10px] font-black tracking-wider uppercase inline-block">
            {t.emiCalculatedDetails || "Calculated Loan Details"}
          </span>

          {/* EMI Visual */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              {t.emiMonthlyEmi || "Monthly EMI"}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#4d8eff] tracking-tight leading-none">
              {formatRupee(emi)}
              <span className="text-sm font-semibold text-slate-400 font-normal"> / {lang === "hi" ? "महीना" : "month"}</span>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Details breakdown */}
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">{lang === "hi" ? "लोन राशि" : "Loan Amount"}:</span>
              <span className="font-extrabold text-[#f0f0f5]">{formatRupee(loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">{t.emiTotalInterest || "Total Interest"}:</span>
              <span className="font-extrabold text-[#f0f0f5]">{formatRupee(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">{lang === "hi" ? "कुल भुगतान (बैंक को)" : "Total Payment"}:</span>
              <span className="font-extrabold text-[#f0f0f5]">{formatRupee(totalPayment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">{lang === "hi" ? "ऑन-रोड कुल लागत" : "Total Outlay"}:</span>
              <span className="font-extrabold text-yellow-400">{formatRupee(totalOutlay)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleRequestFinance}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-[#25D366]/20 active:scale-95 text-center text-sm"
          >
            <span>💬</span>
            <span>{t.emiApplyWhatsApp || "Get Finance Approval"}</span>
          </button>
          
          <p className="text-[10px] text-slate-400 leading-normal font-semibold">
            {t.emiNote || "* Approximate values. Subject to bank approval."}
          </p>
        </div>
      </div>
    </div>
  );
}
