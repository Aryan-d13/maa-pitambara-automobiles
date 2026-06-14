"use client";

import { useState, useRef, useEffect } from "react";
import { SiteContent, Tractor } from "@mp-auto/content";

interface ContentFormProps {
  initialContent: SiteContent;
}

const CATEGORY_OPTIONS = [
  "Heavy Duty",
  "Premium Heavy Duty",
  "Best Seller",
  "Fuel Efficient",
  "All Rounder",
  "Mini / Compact",
];

export default function ContentForm({ initialContent }: ContentFormProps) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [selectedTractorIndex, setSelectedTractorIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"tractors" | "contact" | "translations">("tractors");
  const [showRawPath, setShowRawPath] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show Toast
  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Track changes to show unsaved indicator
  useEffect(() => {
    const isDifferent = JSON.stringify(initialContent) !== JSON.stringify(content);
    setHasUnsavedChanges(isDifferent);
  }, [content, initialContent]);

  // Handle Contact Changes
  const handleContactChange = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  // Handle Tractor Changes
  const handleTractorChange = (index: number, field: keyof Tractor, value: string) => {
    setContent((prev) => {
      const newTractors = [...prev.tractors];
      newTractors[index] = {
        ...newTractors[index],
        [field]: value,
      };
      return {
        ...prev,
        tractors: newTractors,
      };
    });
  };

  // Add a Tractor
  const handleAddTractor = () => {
    const newTractor: Tractor = {
      id: `nh-${Date.now()}`,
      name: "New Holland Model",
      hp: "50",
      price: "Price on Request",
      imageUrl: "/images/new_holland_3630.webp",
      engine: "",
      cylinders: "",
      displacement: "",
      ptoHp: "",
      liftingCapacity: "",
      gears: "",
      weight: "",
      category: "",
    };
    
    setContent((prev) => ({
      ...prev,
      tractors: [...prev.tractors, newTractor],
    }));

    // Auto-select the newly added tractor
    setSelectedTractorIndex(content.tractors.length);
    showToast("success", "🆕 Created model template and loaded in workspace editor");
  };

  // Delete a Tractor
  const handleDeleteTractor = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection trigger
    if (!confirm("Are you sure you want to delete this tractor?")) return;
    
    setContent((prev) => {
      const newTractors = [...prev.tractors];
      newTractors.splice(index, 1);
      return {
        ...prev,
        tractors: newTractors,
      };
    });

    // Reset selection if deleted active or index out of bounds
    setSelectedTractorIndex((prev) => {
      if (prev >= content.tractors.length - 1) {
        return Math.max(0, content.tractors.length - 2);
      }
      return prev;
    });

    showToast("success", "Removed tractor model from inventory");
  };

  // Move tractor up/down
  const handleMoveTractor = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection trigger
    
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= content.tractors.length) return;

    setContent((prev) => {
      const newTractors = [...prev.tractors];
      [newTractors[index], newTractors[swapIndex]] = [newTractors[swapIndex], newTractors[index]];
      return { ...prev, tractors: newTractors };
    });

    // Move the active selection indicator along with the tractor
    setSelectedTractorIndex(swapIndex);
  };

  // Handle Translation Changes
  const handleTranslationChange = (lang: "en" | "hi", key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [key]: value,
        },
      },
    }));
  };

  // Handle Image Upload
  const handleImageUpload = async (index: number, file: File) => {
    setUploadingFor(index);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.url) {
        handleTractorChange(index, "imageUrl", result.url);
        showToast("success", `📸 Image uploaded: ${result.fileName}`);
      } else {
        showToast("error", result.error || "Failed to upload image.");
      }
    } catch (err: any) {
      showToast("error", "Upload error: " + err.message);
    } finally {
      setUploadingFor(null);
    }
  };

  // Handle drag-and-drop
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(index, file);
    } else {
      showToast("error", "Please drop an image file (PNG, JPG, WebP)");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Save changes to database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });

      const result = await response.json();

      if (response.ok) {
        showToast("success", "✅ Live updates synchronized! Website reflects changes immediately.");
        setHasUnsavedChanges(false);
      } else {
        showToast("error", result.error || "Failed to write database updates.");
      }
    } catch (err: any) {
      showToast("error", "Database write error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset database from local defaults
  const handleResetDatabase = async () => {
    if (
      !confirm(
        "Are you sure you want to overwrite your database with the local file defaults? This will restore all 6 standard models and erase any unsaved test records."
      )
    ) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset" }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setContent(result.content);
        setSelectedTractorIndex(0);
        showToast("success", "🔄 Database synchronized from local JSON successfully!");
      } else {
        showToast("error", result.error || "Failed to sync database.");
      }
    } catch (err: any) {
      showToast("error", "Error syncing database: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const activeTractor = content.tractors[selectedTractorIndex];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0f] text-[#f0f0f5] selection:bg-accent-blue/30">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type} flex items-center gap-3 backdrop-blur-md`}>
          <span>{toast.type === "success" ? "⚡" : "⚠️"}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: Navigation & Branding */}
      <aside className="w-full md:w-80 bg-[#12121a] border-b md:border-b-0 md:border-r border-[#2a2a3a] flex flex-col shrink-0 md:h-screen md:sticky md:top-0">
        
        {/* Branding header */}
        <div className="p-6 border-b border-[#2a2a3a] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wider text-[#9898b0] uppercase">Dealership Admin</span>
            <span className="text-lg font-black text-white tracking-tight mt-0.5">Maa Pitambara Auto</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a26] border border-[#2a2a3a] rounded-full px-3 py-1 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[#9898b0] uppercase tracking-wider">Live Local</span>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            type="button"
            onClick={() => setActiveTab("tractors")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-bold transition-all ${
              activeTab === "tractors"
                ? "bg-[#4d8eff]/10 text-[#4d8eff] border-l-4 border-[#4d8eff] shadow-[0_4px_20px_rgba(77,142,255,0.05)]"
                : "text-[#9898b0] hover:bg-[#1a1a26] hover:text-white"
            }`}
          >
            <span className="text-xl">🚜</span>
            <div className="flex flex-col">
              <span className="text-sm tracking-tight leading-none">Tractors Inventory</span>
              <span className="text-[10px] text-[#686882] font-semibold mt-1 uppercase tracking-wider">Showroom Catalog ({content.tractors.length})</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-bold transition-all ${
              activeTab === "contact"
                ? "bg-[#4d8eff]/10 text-[#4d8eff] border-l-4 border-[#4d8eff] shadow-[0_4px_20px_rgba(77,142,255,0.05)]"
                : "text-[#9898b0] hover:bg-[#1a1a26] hover:text-white"
            }`}
          >
            <span className="text-xl">📞</span>
            <div className="flex flex-col">
              <span className="text-sm tracking-tight leading-none">Contact Details</span>
              <span className="text-[10px] text-[#686882] font-semibold mt-1 uppercase tracking-wider">Phones & Location</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("translations")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-bold transition-all ${
              activeTab === "translations"
                ? "bg-[#4d8eff]/10 text-[#4d8eff] border-l-4 border-[#4d8eff] shadow-[0_4px_20px_rgba(77,142,255,0.05)]"
                : "text-[#9898b0] hover:bg-[#1a1a26] hover:text-white"
            }`}
          >
            <span className="text-xl">🌐</span>
            <div className="flex flex-col">
              <span className="text-sm tracking-tight leading-none">Bilingual Copy</span>
              <span className="text-[10px] text-[#686882] font-semibold mt-1 uppercase tracking-wider">Hindi & English Text</span>
            </div>
          </button>
        </nav>

        {/* Reset Database Trigger Button */}
        <div className="p-4 border-t border-[#2a2a3a]">
          <button
            type="button"
            onClick={handleResetDatabase}
            className="w-full py-2 bg-[#2a2a38] hover:bg-[#33334a] text-xs font-bold text-[#9898b0] hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#2a2a3a]"
          >
            <span>🔄</span> Sync DB with Local JSON
          </button>
        </div>

        {/* Sidebar Footer Stats */}
        <div className="p-5 border-t border-[#2a2a3a] bg-[#0c0c12] text-[11px] text-[#686882] space-y-2.5">
          <div className="flex justify-between items-center">
            <span>DATABASE TYPE</span>
            <span className="font-bold text-[#9898b0] font-mono">REDIS/FILE SYNC</span>
          </div>
          <div className="flex justify-between items-center">
            <span>PUBLISH TARGET</span>
            <span className="font-bold text-[#4d8eff] font-mono">VERCEL STAGING/PROD</span>
          </div>
          <div className="flex justify-between items-center">
            <span>PANEL VERSION</span>
            <span className="font-semibold font-mono">v1.3.0 Master-Detail</span>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE: Header + Tab Forms */}
      <form onSubmit={handleSave} className="flex-1 flex flex-col md:h-screen md:overflow-hidden bg-[#0a0a0f]">
        
        {/* Workspace Floating Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3a] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {activeTab === "tractors" ? "🚜" : activeTab === "contact" ? "📞" : "🌐"}
            </span>
            <div>
              <h1 className="text-lg font-black text-white capitalize leading-none tracking-tight">
                {activeTab === "tractors" ? "Tractor Showroom Catalog" : activeTab === "contact" ? "Dealer Contacts Settings" : "Bilingual Localization Dictionary"}
              </h1>
              <p className="text-xs text-[#9898b0] font-semibold mt-1">
                {activeTab === "tractors"
                  ? "Manage model inventory specifications, categories, and direct interactive image uploads."
                  : activeTab === "contact"
                  ? "Edit phone calling numbers, WhatsApp routing, and coordinate maps URLs."
                  : "Compare English and Hindi marketing descriptions and landing copy side-by-side."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold mr-1 shrink-0">
              {hasUnsavedChanges ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-amber-400">Unsaved Changes</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-400">Database Synced</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
                isSaving
                  ? "bg-[#2a2a38] text-[#686882] cursor-not-allowed"
                  : hasUnsavedChanges
                  ? "bg-[#4d8eff] hover:bg-[#6ba0ff] text-white shadow-[#4d8eff]/10 hover:shadow-[#4d8eff]/20 active:scale-95"
                  : "bg-[#1a1a26] text-[#9898b0] hover:text-white border border-[#2a2a3a]"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Publishing...
                </span>
              ) : (
                "Save & Publish"
              )}
            </button>
          </div>
        </header>

        {/* Workspace Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 md:h-[calc(100vh-80px)]">
          
          {/* TAB 1: TRACTORS INVENTORY (MASTER-DETAIL SPLIT UX) */}
          {activeTab === "tractors" && (
            <div className="h-full flex flex-col lg:flex-row gap-6 items-stretch max-w-6xl mx-auto">
              
              {/* MASTER SIDEBAR: Model list */}
              <div className="w-full lg:w-80 bg-[#12121a] border border-[#2a2a3a] rounded-2xl flex flex-col shrink-0 h-[300px] lg:h-auto overflow-hidden">
                <div className="p-4 border-b border-[#2a2a3a] flex items-center justify-between bg-[#161622]">
                  <span className="text-xs font-bold text-[#9898b0] uppercase tracking-wider">Models Catalog ({content.tractors.length})</span>
                  <button
                    type="button"
                    onClick={handleAddTractor}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>➕</span> Add New
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                  {content.tractors.map((tractor, index) => {
                    const isSelected = selectedTractorIndex === index;
                    return (
                      <div
                        key={tractor.id}
                        onClick={() => setSelectedTractorIndex(index)}
                        className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                          isSelected
                            ? "bg-[#4d8eff]/10 border-[#4d8eff] shadow-[0_2px_12px_rgba(77,142,255,0.05)]"
                            : "bg-[#161622]/40 border-[#2a2a3a] hover:bg-[#161622]/80 hover:border-[#33334a]"
                        }`}
                      >
                        {/* Tiny Image Thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0a0a0f] border border-[#2a2a3a] shrink-0">
                          <img
                            src={tractor.imageUrl}
                            alt={tractor.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/new_holland_3630.webp";
                            }}
                          />
                        </div>

                        {/* Model details summary */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#d0d0da] group-hover:text-white"}`}>
                            {tractor.name || "Unnamed Model"}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-[#686882] font-semibold">{tractor.hp ? `${tractor.hp} HP` : "No HP"}</span>
                            {tractor.category && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[#2a2a3a]"></span>
                                <span className="text-[9px] text-amber-400 font-bold truncate max-w-[80px]">{tractor.category}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* List Actions: Quick Reordering & Delete */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 transition-opacity ml-auto" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Up/Down buttons */}
                          <button
                            type="button"
                            onClick={(e) => handleMoveTractor(index, "up", e)}
                            disabled={index === 0}
                            className="p-1 hover:bg-[#222230] text-[#9898b0] hover:text-white rounded disabled:opacity-20 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => handleMoveTractor(index, "down", e)}
                            disabled={index === content.tractors.length - 1}
                            className="p-1 hover:bg-[#222230] text-[#9898b0] hover:text-white rounded disabled:opacity-20 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                          </button>

                          {/* Delete Trash Can */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTractor(index, e)}
                            className="p-1 hover:bg-[#7f1d1d]/30 text-[#f87171] hover:text-red-400 rounded cursor-pointer"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {content.tractors.length === 0 && (
                    <div className="text-center py-8 text-[#686882]">
                      <p className="text-xs">No models in catalog</p>
                    </div>
                  )}
                </div>
              </div>

              {/* DETAIL PANEL: Selected Tractor Workspace */}
              <div className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 flex flex-col overflow-y-auto lg:h-auto min-h-[400px]">
                {activeTractor ? (
                  <div className="space-y-6">
                    
                    {/* Header Detail */}
                    <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono bg-[#4d8eff]/10 text-[#4d8eff] px-2 py-0.5 rounded font-bold">
                            TRACTOR ID: {activeTractor.id}
                          </span>
                          <span className="text-[10px] text-[#686882] font-semibold">Tractor #{selectedTractorIndex + 1} of {content.tractors.length}</span>
                        </div>
                        <h3 className="text-base font-black text-white mt-1.5">{activeTractor.name || "Unnamed Tractor model"}</h3>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteTractor(selectedTractorIndex, e)}
                        className="px-3 py-1.5 bg-[#f87171]/10 text-[#f87171] hover:bg-[#f87171] hover:text-white border border-[#f87171]/20 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        Delete Catalog Item
                      </button>
                    </div>

                    {/* Integrated Interactive Image Upload UX */}
                    <div className="space-y-2">
                      <label className="admin-label">Product Visual Asset</label>
                      
                      <div
                        onDrop={(e) => handleDrop(e, selectedTractorIndex)}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className="group w-full max-w-md aspect-[16/9] rounded-2xl border-2 border-dashed border-[#2a2a3a] bg-[#0c0c12] relative cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all hover:border-[#4d8eff]/50 hover:bg-[#12121a]/80"
                        title="Click or drag image here to change"
                      >
                        {uploadingFor === selectedTractorIndex ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="w-8 h-8 border-3 border-[#4d8eff]/30 border-t-[#4d8eff] rounded-full animate-spin"></span>
                            <span className="text-xs font-bold text-[#4d8eff]">Uploading image...</span>
                          </div>
                        ) : activeTractor.imageUrl ? (
                          <>
                            {/* Visual Image */}
                            <img
                              src={activeTractor.imageUrl}
                              alt={activeTractor.name}
                              className="w-full h-full object-cover absolute inset-0 z-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/new_holland_3630.webp";
                              }}
                            />
                            
                            {/* Sophisticated Hover Overlay */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4d8eff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              <span className="text-xs font-black">Change Tractor Visual Asset</span>
                              <span className="text-[10px] text-[#9898b0] font-medium leading-tight">Drag and drop file here or click to choose from system files</span>
                            </div>
                          </>
                        ) : (
                          // Placeholder State
                          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center z-10 text-[#686882] group-hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span className="text-xs font-bold text-[#9898b0]">No Visual Image Registered</span>
                            <span className="text-[10px] leading-tight max-w-[200px]">Drag & drop an image here or click to select a file</span>
                          </div>
                        )}
                      </div>

                      {/* Hidden File input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(selectedTractorIndex, file);
                          e.target.value = "";
                        }}
                      />

                      {/* Toggleable Advanced Filepath Route */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowRawPath(!showRawPath)}
                          className="text-[10px] text-[#4d8eff] hover:underline font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                        >
                          <span>⚙️</span> {showRawPath ? "Hide raw file path settings" : "Show raw file path route settings"}
                        </button>
                        
                        {showRawPath && (
                          <div className="mt-2 p-3 bg-[#0c0c12] border border-[#2a2a3a] rounded-xl space-y-1">
                            <span className="text-[9px] text-[#686882] font-bold uppercase tracking-wider block">Local Image Path / Cloud URL Target</span>
                            <input
                              type="text"
                              value={activeTractor.imageUrl}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "imageUrl", e.target.value)}
                              className="admin-input font-mono text-xs !py-1.5 bg-[#12121a]"
                              placeholder="/images/new_holland_3630.webp"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FIELDS SPECIFICATIONS GRID */}
                    <div className="space-y-5">
                      
                      {/* Grid 1: Basic specifications */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9898b0] block border-b border-[#2a2a3a] pb-1.5">
                          Basic Specifications
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="admin-label">Model Name / Label</label>
                            <input
                              type="text"
                              value={activeTractor.name}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "name", e.target.value)}
                              className="admin-input"
                              placeholder="e.g. New Holland 3630 Super"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">Horsepower rating (HP)</label>
                            <input
                              type="text"
                              value={activeTractor.hp}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "hp", e.target.value)}
                              className="admin-input"
                              placeholder="e.g. 55"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">Pricing Label / Disclaimer</label>
                            <input
                              type="text"
                              value={activeTractor.price}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "price", e.target.value)}
                              className="admin-input"
                              placeholder="₹8.27 – 8.84 Lakh*"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">Display Badge Category</label>
                            <select
                              value={activeTractor.category || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "category", e.target.value)}
                              className="admin-select w-full"
                            >
                              <option value="">No Badge</option>
                              {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Grid 2: Engine Specifications */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9898b0] block border-b border-[#2a2a3a] pb-1.5">
                          Engine Performance Specs
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="admin-label">Engine Details</label>
                            <input
                              type="text"
                              value={activeTractor.engine || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "engine", e.target.value)}
                              className="admin-input"
                              placeholder="FPT S8000"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">No. of Cylinders</label>
                            <input
                              type="text"
                              value={activeTractor.cylinders || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "cylinders", e.target.value)}
                              className="admin-input"
                              placeholder="3"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">Displacement (cc)</label>
                            <input
                              type="text"
                              value={activeTractor.displacement || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "displacement", e.target.value)}
                              className="admin-input"
                              placeholder="2931 cc"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">PTO HP Power</label>
                            <input
                              type="text"
                              value={activeTractor.ptoHp || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "ptoHp", e.target.value)}
                              className="admin-input"
                              placeholder="46 HP"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid 3: Capacities spec */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9898b0] block border-b border-[#2a2a3a] pb-1.5">
                          Chassis, Transmission & Weights
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="admin-label">Lifting Capacity</label>
                            <input
                              type="text"
                              value={activeTractor.liftingCapacity || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "liftingCapacity", e.target.value)}
                              className="admin-input"
                              placeholder="2000 kg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">Gears Configuration</label>
                            <input
                              type="text"
                              value={activeTractor.gears || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "gears", e.target.value)}
                              className="admin-input"
                              placeholder="8F + 2R"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="admin-label">Gross Weight</label>
                            <input
                              type="text"
                              value={activeTractor.weight || ""}
                              onChange={(e) => handleTractorChange(selectedTractorIndex, "weight", e.target.value)}
                              className="admin-input"
                              placeholder="2060 kg"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#686882] space-y-3">
                    <span className="text-5xl">🚜</span>
                    <h3 className="text-base font-black text-white">No Tractor Selected</h3>
                    <p className="text-xs max-w-xs leading-normal">
                      Select a tractor model from the list on the left to view its technical details, or click "➕ Add New" to create one.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: CONTACT SETTINGS */}
          {activeTab === "contact" && (
            <div className="max-w-xl mx-auto space-y-6">
              
              <div className="border-b border-[#2a2a3a] pb-4">
                <h3 className="text-lg font-black text-white">Hotline & Routing Setup</h3>
                <p className="text-xs text-[#9898b0] font-semibold mt-0.5">Modify parameters to route farmer calls and coordinates correctly.</p>
              </div>

              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-6 space-y-6">
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-label !mb-0">Dealer Primary Call Number</label>
                    <span className="text-[10px] text-[#4d8eff] font-bold font-mono">TEL: LINK ACTIVE</span>
                  </div>
                  <input
                    type="text"
                    value={content.contact.phone}
                    onChange={(e) => handleContactChange("phone", e.target.value)}
                    className="admin-input font-mono !py-3.5 text-base text-white"
                    placeholder="+919926418756"
                    required
                  />
                  <span className="text-[10px] text-[#686882] font-semibold block leading-normal">
                    This phone number routes direct dialing and text-to-speech audio references. Formats without spaces or special characters (e.g. 9926418756) are recommended.
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-label !mb-0">Dealer Primary WhatsApp Number</label>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">WHATSAPP LINK ACTIVE</span>
                  </div>
                  <input
                    type="text"
                    value={content.contact.whatsapp}
                    onChange={(e) => handleContactChange("whatsapp", e.target.value)}
                    className="admin-input font-mono !py-3.5 text-base text-white"
                    placeholder="+919926418756"
                    required
                  />
                  <span className="text-[10px] text-[#686882] font-semibold block leading-normal">
                    Routes instant message hooks on the floating bar. Standard international format +91XXXXXXXXXX is recommended.
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-label !mb-0">Dealer Google Maps Coordinates Link</label>
                    <span className="text-[10px] text-[#9898b0] font-bold font-mono">LOCATION ACTIVE</span>
                  </div>
                  <textarea
                    rows={4}
                    value={content.contact.mapsUrl}
                    onChange={(e) => handleContactChange("mapsUrl", e.target.value)}
                    className="admin-textarea font-mono !py-3.5 text-xs text-white"
                    placeholder="https://maps.google.com/?q=..."
                    required
                  />
                  <span className="text-[10px] text-[#686882] font-semibold block leading-normal">
                    Used to direct farmers on mobile map navigation devices. Copy the complete routing path from Google Maps share options.
                  </span>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: LOCALIZATION TRANSLATIONS */}
          {activeTab === "translations" && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="border-b border-[#2a2a3a] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Bilingual Copy Editor</h3>
                  <p className="text-xs text-[#9898b0] font-semibold mt-0.5">Manage English (farmer-readable UI fallback) and Hindi dictionary tokens side-by-side.</p>
                </div>
                <div className="flex items-center gap-4 bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>🇬🇧</span> <span className="font-bold text-white">English</span>
                  </div>
                  <div className="w-[1px] h-3 bg-[#2a2a3a]"></div>
                  <div className="flex items-center gap-1.5">
                    <span>🇮🇳</span> <span className="font-bold text-[#4d8eff]">Hindi</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.keys(content.translations.en).map((key) => {
                  const enVal = content.translations.en[key] || "";
                  const hiVal = content.translations.hi[key] || "";
                  
                  const isLongField = key.includes("Subtitle") || key.includes("Intro") || key.includes("Address") || key.includes("serviceSubtitle");
                  const rowsCount = isLongField ? 3 : 1;

                  return (
                    <div key={key} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-4 sm:p-5 hover:border-[#33334a] transition-all space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-white tracking-tight">{key}</span>
                        <span className="text-[10px] text-[#686882] font-semibold uppercase tracking-wider">Token</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* ENGLISH FIELD */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#686882] uppercase tracking-wider">
                            <span>English Copy</span>
                            <span>🇬🇧</span>
                          </div>
                          {isLongField ? (
                            <textarea
                              rows={rowsCount}
                              value={enVal}
                              onChange={(e) => handleTranslationChange("en", key, e.target.value)}
                              className="admin-textarea w-full bg-[#0c0c12] text-xs font-semibold"
                              required
                            />
                          ) : (
                            <input
                              type="text"
                              value={enVal}
                              onChange={(e) => handleTranslationChange("en", key, e.target.value)}
                              className="admin-input w-full bg-[#0c0c12] text-xs font-bold"
                              required
                            />
                          )}
                        </div>

                        {/* HINDI FIELD */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#4d8eff]/80 uppercase tracking-wider">
                            <span>Hindi Copy (हिंदी)</span>
                            <span>🇮🇳</span>
                          </div>
                          {isLongField ? (
                            <textarea
                              rows={rowsCount}
                              value={hiVal}
                              onChange={(e) => handleTranslationChange("hi", key, e.target.value)}
                              className="admin-textarea w-full bg-[#0c0c12] text-xs text-[#4d8eff] font-bold"
                              required
                            />
                          ) : (
                            <input
                              type="text"
                              value={hiVal}
                              onChange={(e) => handleTranslationChange("hi", key, e.target.value)}
                              className="admin-input w-full bg-[#0c0c12] text-xs text-[#4d8eff] font-bold"
                              required
                            />
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </main>
      </form>

    </div>
  );
}
