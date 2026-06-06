"use client";

import { useState, useEffect } from "react";

const brandSwatches = [
  { name: "Brand Deep", hex: "#256199", desc: "Gradient start · headings on light", lightText: true },
  { name: "Brand Blue", hex: "#3DA1FF", desc: "Gradient end · links · accents", lightText: true },
  { name: "Brand Mid", hex: "#2E7CC1", desc: "Solid fills · hover states", lightText: true },
  { name: "Ink Black", hex: "#0B0B0D", desc: "Logo tile · secondary buttons", lightText: true },
];

const neutralSwatches = [
  { name: "Ink", hex: "#232635", desc: "Primary text", lightText: true },
  { name: "Muted", hex: "#7C8294", desc: "Secondary text · labels", lightText: true },
  { name: "Canvas", hex: "#CFE1F5", desc: "App background", lightText: false, copyBadgeStyle: { color: "#33425a", background: "rgba(255,255,255,.5)" } },
  { name: "Surface", hex: "#FFFFFF", desc: "Cards · sidebars", lightText: false, copyBadgeStyle: { color: "#33425a", background: "rgba(0,0,0,.06)" }, borderBottom: true },
];

const semanticSwatches = [
  { name: "Success", hex: "#27AE8A", desc: "Completed · confirmed", lightText: true },
  { name: "Warning", hex: "#F5A524", desc: "Pending · attention", lightText: true },
  { name: "Error", hex: "#EF4655", desc: "Conflicts · failures", lightText: true },
  { name: "Info", hex: "#3DA1FF", desc: "Highlights · notices", lightText: true },
];

const typeWeights = [
  { weight: 400, demo: "Aa", desc: "Regular · 400 — body copy" },
  { weight: 600, demo: "Aa", desc: "Semibold · 600 — labels, nav" },
  { weight: 700, demo: "Aa", desc: "Bold · 700 — titles, buttons" },
  { weight: 800, demo: "Aa", desc: "Extrabold · 800 — display" },
  { weight: 500, demo: "Aa", desc: "Italic — quotes, emphasis", italic: true },
  { weight: 300, demo: "Aa", desc: "Light · 300 — large numerals" },
];

const designIcons = [
  {
    name: "Home",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M9.5 20v-5h5v5" />
      </svg>
    ),
  },
  {
    name: "Timetable",
    svg: (
      <svg viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="16" rx="2.5" />
        <path d="M4 9h16M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    name: "Task",
    svg: (
      <svg viewBox="0 0 24 24">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M9 3v3h6V3" />
        <path d="M9 11h6M9 15h4" />
      </svg>
    ),
  },
  {
    name: "Requests",
    svg: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    name: "Extra Class",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4z" />
        <path d="M14 11l3 3M17 11l-3 3" />
      </svg>
    ),
  },
  {
    name: "Admin",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M3 21h18M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    name: "Search",
    svg: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    ),
  },
  {
    name: "Notify",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M10 21a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    name: "Reminder",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />
      </svg>
    ),
  },
  {
    name: "Done",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M4 12l5 5L20 6" />
      </svg>
    ),
  },
  {
    name: "Clock",
    svg: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    name: "Shield",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    name: "Profile",
    svg: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
  {
    name: "Open",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M15 4h4v4M19 4l-7 7" />
        <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
      </svg>
    ),
  },
];

export default function DesignPage() {
  const [toast, setToast] = useState<{ show: boolean; text: string }>({ show: false, text: "" });

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
      .then(() => {
        setToast({ show: true, text: `${hex} copied` });
      })
      .catch(() => {
        setToast({ show: true, text: `Failed to copy ${hex}` });
      });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, text: "" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <div
      style={{
        background: `radial-gradient(1200px 600px at 85% -5%, #e9f3ff 0%, transparent 55%), radial-gradient(900px 500px at -10% 10%, #eaf2fd 0%, transparent 50%), #cfe1f5`,
        minHeight: "100vh",
      }}
      className="font-sans antialiased text-[#232635] selection:bg-[#3DA1FF]/30"
    >
      {/* TOP NAV */}
      <div className="sticky top-[14px] z-50 my-[14px] mx-auto max-w-[1120px] px-[14px] w-full">
        <nav className="flex items-center gap-[18px] bg-white/[0.82] backdrop-blur-[14px] border border-[#e7eef7] rounded-full p-[9px] pl-[16px] shadow-[0_4px_14px_rgba(37,97,153,.08)]">
          <div className="flex items-center gap-[10px] font-extrabold tracking-[-0.02em] text-[#232635] text-[18px]">
            <img src="/logo.png" alt="Anugat AI" className="w-[30px] h-[30px] rounded-[8px] block" />
            <span>Anugat&nbsp;AI</span>
          </div>
          <div className="hidden md:flex gap-[4px] ml-auto flex-wrap">
            <a href="#brand" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Brand
            </a>
            <a href="#color" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Color
            </a>
            <a href="#gradient" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Gradient
            </a>
            <a href="#type" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Type
            </a>
            <a href="#icons" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Icons
            </a>
            <a href="#buttons" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Buttons
            </a>
            <a href="#cards" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Cards
            </a>
            <a href="#personas" className="text-[13.5px] font-semibold text-[#454a5c] px-[12px] py-[7px] rounded-full transition-all duration-180 hover:bg-[#eef4fc] hover:text-[#256199]">
              Personas
            </a>
          </div>
          <span className="ml-auto md:ml-0 bg-[#0b0b0d] text-white text-[12px] font-bold px-[14px] py-[8px] rounded-full">
            Samayak v1.0
          </span>
        </nav>
      </div>

      <div className="max-w-[1120px] mx-auto px-[28px] w-full">
        {/* HERO */}
        <header className="relative mt-[26px] mx-auto rounded-[30px] overflow-hidden bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white pt-[64px] px-[56px] pb-[60px] shadow-[0_24px_70px_rgba(37,97,153,.16)]">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(600px 300px at 88% 18%, rgba(255,255,255,.22), transparent 60%)" }} />
          <div className="relative z-10">
            <div className="text-[13px] font-extrabold tracking-[0.22em] uppercase opacity-85">
              ANUGAT AI · PRODUCT DESIGN SYSTEM
            </div>
            <h1 className="text-[40px] md:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.02] mt-[14px]">
              Samayak
              <small className="block text-[0.42em] font-semibold tracking-[-0.01em] opacity-90 mt-[14px] leading-normal max-w-[560px]">
                The design language behind the academic operations platform — colours, type, icons, components and the people we build for.
              </small>
            </h1>
            <div className="flex gap-[10px] flex-wrap mt-[30px]">
              <span className="bg-white/16 border border-white/30 px-[15px] py-[8px] rounded-full text-[13px] font-semibold backdrop-blur-[4px]">
                Figtree typeface
              </span>
              <span className="bg-white/16 border border-white/30 px-[15px] py-[8px] rounded-full text-[13px] font-semibold backdrop-blur-[4px]">
                #256199 → #3DA1FF
              </span>
              <span className="bg-white/16 border border-white/30 px-[15px] py-[8px] rounded-full text-[13px] font-semibold backdrop-blur-[4px]">
                Soft-blue surfaces
              </span>
              <span className="bg-white/16 border border-white/30 px-[15px] py-[8px] rounded-full text-[13px] font-semibold backdrop-blur-[4px]">
                Rounded geometry
              </span>
            </div>
          </div>
          <div className="absolute right-[48px] top-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-[30px] hidden lg:grid place-items-center bg-[#0b0b0d]/92 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <img src="/logo.png" alt="Anugat AI mark" className="w-[108px] h-[108px] rounded-[18px]" />
          </div>
        </header>

        {/* 01 BRAND & LOGO */}
        <section id="brand" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              01
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Brand &amp; Logo
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              The mark is an “a” fused with a four-point spark — intelligence meeting action. Always give it room and never recolour it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr] gap-[20px] items-stretch">
            {/* Card 1: Primary - black housing */}
            <div className="bg-[#0b0b0d] text-white border border-black rounded-[22px] p-[30px] flex flex-col gap-[16px] items-center justify-center text-center min-h-[210px] shadow-[0_4px_14px_rgba(37,97,153,.08)]">
              <img src="/logo.png" alt="logo on black" className="w-[88px] h-[88px] rounded-[16px]" />
              <div className="font-extrabold tracking-[-0.02em] text-[19px]">Anugat AI</div>
              <small className="text-[12.5px] font-semibold opacity-75">Primary — black housing</small>
            </div>

            {/* Card 2: On brand gradient */}
            <div className="bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white rounded-[22px] p-[30px] flex flex-col gap-[16px] items-center justify-center text-center min-h-[210px] shadow-[0_4px_14px_rgba(37,97,153,.08)] border-none">
              <img src="/logo.png" alt="logo on gradient" className="w-[88px] h-[88px] rounded-[16px]" />
              <small className="opacity-95 text-[13px] font-semibold mt-4">On brand gradient</small>
            </div>

            {/* Card 3: Clear space & usage rules */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px] flex flex-col gap-[12px] justify-center shadow-[0_4px_14px_rgba(37,97,153,.08)] md:col-span-2 lg:col-span-1">
              <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-1">
                Clear Space &amp; Usage
              </div>
              <div className="flex gap-[12px] items-start p-[16px_18px] rounded-[14px] text-[14px] font-semibold bg-[#e9f7f1] text-[#1c7a5c]">
                <span>✓</span>
                <span>Keep the mark inside a rounded black tile</span>
              </div>
              <div className="flex gap-[12px] items-start p-[16px_18px] rounded-[14px] text-[14px] font-semibold bg-[#e9f7f1] text-[#1c7a5c]">
                <span>✓</span>
                <span>Maintain padding equal to the spark height</span>
              </div>
              <div className="flex gap-[12px] items-start p-[16px_18px] rounded-[14px] text-[14px] font-semibold bg-[#fdecee] text-[#b3303c]">
                <span>✕</span>
                <span>Don’t recolour, stretch or rotate the mark</span>
              </div>
              <div className="flex gap-[12px] items-start p-[16px_18px] rounded-[14px] text-[14px] font-semibold bg-[#fdecee] text-[#b3303c]">
                <span>✕</span>
                <span>Don’t place on busy photographic backgrounds</span>
              </div>
            </div>
          </div>
        </section>

        {/* 02 COLOUR SYSTEM */}
        <section id="color" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              02
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Colour System
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              A calm soft-blue canvas, crisp white cards, and the signature blue gradient reserved for moments that matter. Tap any swatch to copy.
            </p>
          </div>

          {/* Section: Brand */}
          <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[14px]">
            Brand
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[20px] mb-8">
            {brandSwatches.map((s) => (
              <div
                key={s.name}
                onClick={() => copyToClipboard(s.hex)}
                className="group rounded-[22px] overflow-hidden border border-[#e7eef7] cursor-pointer bg-white transition-all duration-200 shadow-[0_4px_14px_rgba(37,97,153,.08)] hover:-translate-y-[3px] hover:shadow-[0_14px_40px_rgba(37,97,153,.12)]"
              >
                <div className="h-[96px] flex items-end p-[12px] relative" style={{ background: s.hex }}>
                  <span
                    className="text-[10.5px] font-extrabold px-[8px] py-[4px] rounded-[6px] tracking-[0.04em] transition-opacity duration-200 opacity-0 group-hover:opacity-100 select-none"
                    style={{ color: "#fff", background: "rgba(0,0,0,.28)" }}
                  >
                    CLICK TO COPY
                  </span>
                </div>
                <div className="p-[13px_15px]">
                  <b className="text-[14.5px] font-bold block text-[#232635]">{s.name}</b>
                  <span className="text-[12.5px] text-[#7c8294] font-normal leading-normal block mt-[2px]">
                    {s.desc}
                  </span>
                  <div className="text-[13px] font-bold mt-[3px] tracking-[0.02em] text-[#232635]">{s.hex}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Neutrals & Surfaces */}
          <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[14px] mt-10">
            Neutrals &amp; Surfaces
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[20px] mb-8">
            {neutralSwatches.map((s) => (
              <div
                key={s.name}
                onClick={() => copyToClipboard(s.hex)}
                className="group rounded-[22px] overflow-hidden border border-[#e7eef7] cursor-pointer bg-white transition-all duration-200 shadow-[0_4px_14px_rgba(37,97,153,.08)] hover:-translate-y-[3px] hover:shadow-[0_14px_40px_rgba(37,97,153,.12)]"
              >
                <div
                  className={`h-[96px] flex items-end p-[12px] relative ${s.borderBottom ? "border-b border-[#eef]" : ""}`}
                  style={{ background: s.hex }}
                >
                  <span
                    className="text-[10.5px] font-extrabold px-[8px] py-[4px] rounded-[6px] tracking-[0.04em] transition-opacity duration-200 opacity-0 group-hover:opacity-100 select-none"
                    style={s.copyBadgeStyle || { color: "#fff", background: "rgba(0,0,0,.28)" }}
                  >
                    CLICK TO COPY
                  </span>
                </div>
                <div className="p-[13px_15px]">
                  <b className="text-[14.5px] font-bold block text-[#232635]">{s.name}</b>
                  <span className="text-[12.5px] text-[#7c8294] font-normal leading-normal block mt-[2px]">
                    {s.desc}
                  </span>
                  <div className="text-[13px] font-bold mt-[3px] tracking-[0.02em] text-[#232635]">{s.hex}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Semantic */}
          <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[14px] mt-10">
            Semantic
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[20px] mb-8">
            {semanticSwatches.map((s) => (
              <div
                key={s.name}
                onClick={() => copyToClipboard(s.hex)}
                className="group rounded-[22px] overflow-hidden border border-[#e7eef7] cursor-pointer bg-white transition-all duration-200 shadow-[0_4px_14px_rgba(37,97,153,.08)] hover:-translate-y-[3px] hover:shadow-[0_14px_40px_rgba(37,97,153,.12)]"
              >
                <div className="h-[96px] flex items-end p-[12px] relative" style={{ background: s.hex }}>
                  <span
                    className="text-[10.5px] font-extrabold px-[8px] py-[4px] rounded-[6px] tracking-[0.04em] transition-opacity duration-200 opacity-0 group-hover:opacity-100 select-none"
                    style={{ color: "#fff", background: "rgba(0,0,0,.28)" }}
                  >
                    CLICK TO COPY
                  </span>
                </div>
                <div className="p-[13px_15px]">
                  <b className="text-[14.5px] font-bold block text-[#232635]">{s.name}</b>
                  <span className="text-[12.5px] text-[#7c8294] font-normal leading-normal block mt-[2px]">
                    {s.desc}
                  </span>
                  <div className="text-[13px] font-bold mt-[3px] tracking-[0.02em] text-[#232635]">{s.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 03 THE SIGNATURE GRADIENT */}
        <section id="gradient" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              03
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              The Signature Gradient
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              One gradient, used with intent. It carries welcome banners, the active nav state and primary calls-to-action — never body backgrounds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-[22px] items-stretch">
            <div className="flex flex-col gap-[16px]">
              <div className="relative h-[150px] rounded-[22px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] shadow-card-md overflow-hidden">
                <div className="absolute inset-0 flex justify-between items-end p-[18px_22px]">
                  <span className="bg-[#0b0b0d]/32 text-white font-extrabold text-[13px] px-[12px] py-[6px] rounded-[8px] backdrop-blur-[3px] select-none">
                    #256199 · 0%
                  </span>
                  <span className="bg-[#0b0b0d]/32 text-white font-extrabold text-[13px] px-[12px] py-[6px] rounded-[8px] backdrop-blur-[3px] select-none">
                    #3DA1FF · 100%
                  </span>
                </div>
              </div>
              <div className="flex gap-[14px] flex-wrap mt-[2px]">
                <div className="flex-1 min-w-[140px] bg-white border border-[#e7eef7] rounded-[22px] p-[14px_18px] shadow-card-sm">
                  <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                    Angle
                  </div>
                  <div className="text-[18px] font-extrabold mt-[4px] text-[#232635]">105°</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-white border border-[#e7eef7] rounded-[22px] p-[14px_18px] shadow-card-sm">
                  <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                    Direction
                  </div>
                  <div className="text-[18px] font-extrabold mt-[4px] text-[#232635]">Deep → Bright</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-white border border-[#e7eef7] rounded-[22px] p-[14px_18px] shadow-card-sm">
                  <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                    Use for
                  </div>
                  <div className="text-[18px] font-extrabold mt-[4px] text-[#232635]">CTAs · Banners</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1726] text-[#cfe3ff] rounded-[14px] p-[18px_20px] text-[13px] leading-[1.7] overflow-auto border border-[#1c2a40] font-mono select-all">
              <span className="text-[#5d7290]">/* Samayak brand gradient */</span>
              <br />
              <span className="text-[#7cc4ff]">background</span>:{" "}
              <span className="text-[#ffd479]">linear-gradient(</span>
              <br />
              &nbsp;&nbsp;105deg,
              <br />
              &nbsp;&nbsp;<span className="text-[#ffd479]">#256199</span> 0%,
              <br />
              &nbsp;&nbsp;<span className="text-[#ffd479]">#3DA1FF</span> 100%
              <br />
              <span className="text-[#ffd479]">)</span>;
              <br />
              <br />
              <span className="text-[#5d7290]">/* on hover, lift + glow */</span>
              <br />
              <span className="text-[#7cc4ff]">box-shadow</span>: 0 8px 20px
              <br />
              &nbsp;&nbsp;rgba(37,97,153,.32);
            </div>
          </div>
        </section>

        {/* 04 TYPOGRAPHY */}
        <section id="type" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              04
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Typography
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              Figtree across the board — geometric, friendly and highly legible. Tight tracking on big headings, comfortable body at 16px.
            </p>
          </div>

          <div className="bg-white border border-[#e7eef7] rounded-[22px] px-[30px] py-[14px] shadow-card-sm">
            {/* Display */}
            <div className="flex flex-col sm:flex-row items-baseline gap-[16px] sm:gap-[24px] py-[18px] border-b border-[#e7eef7]">
              <div className="min-w-[150px] shrink-0">
                <span className="block mb-[3px] text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                  Display
                </span>
                <span className="font-mono text-[12.5px] text-[#7c8294]">56 / 800 / -3%</span>
              </div>
              <div className="text-[52px] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#232635]">
                Welcome Professor
              </div>
            </div>
            {/* Heading 1 */}
            <div className="flex flex-col sm:flex-row items-baseline gap-[16px] sm:gap-[24px] py-[18px] border-b border-[#e7eef7]">
              <div className="min-w-[150px] shrink-0">
                <span className="block mb-[3px] text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                  Heading 1
                </span>
                <span className="font-mono text-[12.5px] text-[#7c8294]">40 / 800 / -2.5%</span>
              </div>
              <div className="text-[40px] font-extrabold tracking-[-0.025em] leading-[1.1] text-[#232635]">
                Invigilator Duty
              </div>
            </div>
            {/* Heading 2 */}
            <div className="flex flex-col sm:flex-row items-baseline gap-[16px] sm:gap-[24px] py-[18px] border-b border-[#e7eef7]">
              <div className="min-w-[150px] shrink-0">
                <span className="block mb-[3px] text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                  Heading 2
                </span>
                <span className="font-mono text-[12.5px] text-[#7c8294]">30 / 700 / -2%</span>
              </div>
              <div className="text-[30px] font-bold tracking-[-0.02em] leading-[1.1] text-[#232635]">
                Today’s Engagement
              </div>
            </div>
            {/* Title */}
            <div className="flex flex-col sm:flex-row items-baseline gap-[16px] sm:gap-[24px] py-[18px] border-b border-[#e7eef7]">
              <div className="min-w-[150px] shrink-0">
                <span className="block mb-[3px] text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                  Title
                </span>
                <span className="font-mono text-[12.5px] text-[#7c8294]">18 / 700</span>
              </div>
              <div className="text-[18px] font-bold leading-[1.1] text-[#232635]">
                Class Timetable
              </div>
            </div>
            {/* Body */}
            <div className="flex flex-col sm:flex-row items-baseline gap-[16px] sm:gap-[24px] py-[18px] border-b border-[#e7eef7]">
              <div className="min-w-[150px] shrink-0">
                <span className="block mb-[3px] text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                  Body
                </span>
                <span className="font-mono text-[12.5px] text-[#7c8294]">16 / 400</span>
              </div>
              <div className="text-[16px] font-normal leading-normal text-[#232635]">
                Count on me to support you, organize your tasks, and make your workday smoother.
              </div>
            </div>
            {/* Caption */}
            <div className="flex flex-col sm:flex-row items-baseline gap-[16px] sm:gap-[24px] py-[18px]">
              <div className="min-w-[150px] shrink-0">
                <span className="block mb-[3px] text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                  Caption
                </span>
                <span className="font-mono text-[12.5px] text-[#7c8294]">12 / 800 / +14%</span>
              </div>
              <div className="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294]">
                Exam Support
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-[20px] mt-[22px]">
            {typeWeights.map((tw) => (
              <div
                key={tw.desc}
                className="bg-white border border-[#e7eef7] rounded-[22px] p-[18px_20px] shadow-card-sm"
              >
                <div
                  className={`text-[30px] tracking-[-0.02em] leading-none text-[#232635] ${
                    tw.italic ? "italic" : ""
                  }`}
                  style={{ fontWeight: tw.weight }}
                >
                  {tw.demo}
                </div>
                <small className="block mt-[10px] text-[#7c8294] font-semibold text-[12.5px]">
                  {tw.desc}
                </small>
              </div>
            ))}
          </div>
        </section>

        {/* 05 ICONOGRAPHY */}
        <section id="icons" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              05
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Iconography
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              Outline icons on a 24px grid with a ~2px rounded stroke. Consistent, lightweight and tinted to brand blue when active.
            </p>
          </div>

          <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-[20px] shadow-card-sm">
            {designIcons.map((ico) => (
              <div
                key={ico.name}
                className="flex flex-col items-center gap-[9px] py-[18px] px-[8px] rounded-[14px] transition-all duration-180 hover:bg-[#f1f7ff] cursor-pointer group"
              >
                <div className="[&>svg]:w-[26px] [&>svg]:h-[26px] [&>svg]:stroke-[#232635] [&>svg]:stroke-[1.9] [&>svg]:fill-none [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round group-hover:[&>svg]:stroke-[#3DA1FF]">
                  {ico.svg}
                </div>
                <span className="text-[11.5px] text-[#7c8294] font-semibold group-hover:text-[#3DA1FF]">
                  {ico.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 06 FOUNDATIONS */}
        <section id="foundations" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              06
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Foundations
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              An 8-point spacing rhythm, generous corner radii and soft blue-tinted shadows give Samayak its calm, pillowy feel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-[20px] items-start">
            {/* Spacing card */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px_28px] shadow-card-sm">
              <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[10px]">
                Spacing scale · base 8
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">4px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "4px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">hairline gaps</span>
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">8px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "8px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">icon ↔ label</span>
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">12px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "12px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">inner chips</span>
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">16px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "16px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">card padding sm</span>
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">24px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "24px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">card padding</span>
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">32px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "32px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">section blocks</span>
              </div>
              <div className="flex items-center gap-[16px] py-[9px]">
                <span className="font-mono text-[13px] font-bold min-w-[54px] text-[#232635]">48px</span>
                <div className="h-[18px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[5px]" style={{ width: "48px" }} />
                <span className="text-[13px] font-medium text-[#7c8294]">major gaps</span>
              </div>
            </div>

            {/* Radius & Elevation column */}
            <div className="flex flex-col gap-[20px]">
              {/* Radius Card */}
              <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px_28px] shadow-card-sm">
                <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[14px]">
                  Corner radius
                </div>
                <div className="flex gap-[18px] flex-wrap mt-[6px]">
                  <div className="flex-1 min-w-[90px] text-center">
                    <div className="h-[74px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] border-none mb-[9px] rounded-[10px]" />
                    <span className="font-mono text-[12.5px] font-bold text-[#232635]">10 · sm</span>
                  </div>
                  <div className="flex-1 min-w-[90px] text-center">
                    <div className="h-[74px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] border-none mb-[9px] rounded-[14px]" />
                    <span className="font-mono text-[12.5px] font-bold text-[#232635]">14 · md</span>
                  </div>
                  <div className="flex-1 min-w-[90px] text-center">
                    <div className="h-[74px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] border-none mb-[9px] rounded-[22px]" />
                    <span className="font-mono text-[12.5px] font-bold text-[#232635]">22 · card</span>
                  </div>
                  <div className="flex-1 min-w-[90px] text-center">
                    <div className="h-[74px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] border-none mb-[9px] rounded-full" />
                    <span className="font-mono text-[12.5px] font-bold text-[#232635]">∞ · pill</span>
                  </div>
                </div>
              </div>
              {/* Elevation Card */}
              <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px_28px] shadow-card-sm">
                <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[14px]">
                  Elevation
                </div>
                <div className="flex gap-[20px] flex-wrap mt-[8px]">
                  <div className="flex-1 min-w-[120px] bg-white rounded-[14px] h-[90px] grid place-items-center text-[12.5px] font-bold text-[#7c8294] shadow-card-sm border border-[#e7eef7]">
                    sm
                  </div>
                  <div className="flex-1 min-w-[120px] bg-white rounded-[14px] h-[90px] grid place-items-center text-[12.5px] font-bold text-[#7c8294] shadow-card-md border border-[#e7eef7]">
                    md
                  </div>
                  <div className="flex-1 min-w-[120px] bg-white rounded-[14px] h-[90px] grid place-items-center text-[12.5px] font-bold text-[#7c8294] shadow-card-lg border border-[#e7eef7]">
                    lg
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 07 BUTTONS */}
        <section id="buttons" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              07
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Buttons
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              Three roles. Gradient for the single primary action, white for supporting actions, black for utility and toggles.
            </p>
          </div>

          <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[30px] flex flex-wrap gap-[16px] items-center mb-[20px] shadow-card-sm">
            <button className="btn bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white shadow-[0_8px_20px_rgba(37,97,153,.32)] hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(37,97,153,.4)] inline-flex items-center gap-[9px] font-bold text-[14.5px] border-none cursor-pointer rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]">
              <svg className="w-[17px] h-[17px] stroke-[2.2] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Task
            </button>
            <button className="btn bg-white text-[#232635] shadow-card-sm border border-[#e7eef7] hover:shadow-card-md hover:-translate-y-[2px] [&>svg]:stroke-[#3DA1FF] inline-flex items-center gap-[9px] font-bold text-[14.5px] cursor-pointer rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]">
              <svg className="w-[17px] h-[17px] stroke-[2.2] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M4 12l5 5L20 6" />
              </svg>
              Manage tasks
            </button>
            <button className="btn bg-[#0b0b0d] text-white hover:-translate-y-[2px] hover:bg-[#1c1c22] inline-flex items-center gap-[9px] font-bold text-[14.5px] border-none cursor-pointer rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]">
              Weekly Schedule
            </button>
            <button className="btn bg-transparent text-[#256199] border-[1.5px] border-[#dbe6f3] hover:bg-[#eef5fd] hover:border-[#3DA1FF] inline-flex items-center gap-[9px] font-bold text-[14.5px] cursor-pointer rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]">
              View all
            </button>
            <button className="btn bg-[#e9eef5] text-[#aab2c0] cursor-not-allowed shadow-none hover:transform-none inline-flex items-center gap-[9px] font-bold text-[14.5px] border-none rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]" disabled>
              Disabled
            </button>
          </div>

          <div className="bg-white border border-[#e7eef7] rounded-[22px] overflow-hidden shadow-card-sm">
            <table className="w-full border-collapse border-spacing-0">
              <tbody>
                <tr>
                  <td className="p-[18px_20px] align-middle font-bold text-[14px] w-[170px] shrink-0 border-none">
                    Primary
                    <span className="block text-[#7c8294] text-[12.5px] font-medium mt-[3px]">
                      One per screen — the main action
                    </span>
                  </td>
                  <td className="p-[18px_20px] align-middle border-none">
                    <button className="btn bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white shadow-[0_8px_20px_rgba(37,97,153,.32)] hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(37,97,153,.4)] inline-flex items-center gap-[9px] font-bold text-[13px] border-none cursor-pointer rounded-full p-[9px_16px] transition-all duration-180 tracking-[-0.01em]">
                      Schedule Now
                    </button>
                  </td>
                  <td className="p-[18px_20px] align-middle text-[#7c8294] text-[13px] font-medium border-none">
                    Gradient fill · white text · lifts &amp; glows on hover
                  </td>
                </tr>
                <tr>
                  <td className="p-[18px_20px] align-middle font-bold text-[14px] w-[170px] shrink-0 border-t border-[#e7eef7]">
                    Secondary
                    <span className="block text-[#7c8294] text-[12.5px] font-medium mt-[3px]">
                      Supporting actions on banners
                    </span>
                  </td>
                  <td className="p-[18px_20px] align-middle border-t border-[#e7eef7]">
                    <button className="btn bg-white text-[#232635] shadow-card-sm border border-[#e7eef7] hover:shadow-card-md hover:-translate-y-[2px] [&>svg]:stroke-[#3DA1FF] inline-flex items-center gap-[9px] font-bold text-[13px] cursor-pointer rounded-full p-[9px_16px] transition-all duration-180 tracking-[-0.01em]">
                      <svg className="w-[17px] h-[17px] stroke-[2.2] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Set Reminders
                    </button>
                  </td>
                  <td className="p-[18px_20px] align-middle text-[#7c8294] text-[13px] font-medium border-t border-[#e7eef7]">
                    White surface · soft shadow · blue icon
                  </td>
                </tr>
                <tr>
                  <td className="p-[18px_20px] align-middle font-bold text-[14px] w-[170px] shrink-0 border-t border-[#e7eef7]">
                    Utility (dark)
                    <span className="block text-[#7c8294] text-[12.5px] font-medium mt-[3px]">
                      Toggles, sharing, log out
                    </span>
                  </td>
                  <td className="p-[18px_20px] align-middle border-t border-[#e7eef7]">
                    <button className="btn bg-[#0b0b0d] text-white hover:-translate-y-[2px] hover:bg-[#1c1c22] inline-flex items-center gap-[9px] font-bold text-[13px] border-none cursor-pointer rounded-full p-[9px_16px] transition-all duration-180 tracking-[-0.01em]">
                      Share Schedule
                    </button>
                  </td>
                  <td className="p-[18px_20px] align-middle text-[#7c8294] text-[13px] font-medium border-t border-[#e7eef7]">
                    Black pill · white text
                  </td>
                </tr>
                <tr>
                  <td className="p-[18px_20px] align-middle font-bold text-[14px] w-[170px] shrink-0 border-t border-[#e7eef7]">
                    Ghost / link
                    <span className="block text-[#7c8294] text-[12.5px] font-medium mt-[3px]">
                      Tertiary, low-emphasis
                    </span>
                  </td>
                  <td className="p-[18px_20px] align-middle border-t border-[#e7eef7]">
                    <button className="btn bg-transparent text-[#256199] border-[1.5px] border-[#dbe6f3] hover:bg-[#eef5fd] hover:border-[#3DA1FF] inline-flex items-center gap-[9px] font-bold text-[13px] cursor-pointer rounded-full p-[9px_16px] transition-all duration-180 tracking-[-0.01em]">
                      View all
                    </button>
                  </td>
                  <td className="p-[18px_20px] align-middle text-[#7c8294] text-[13px] font-medium border-t border-[#e7eef7]">
                    Outline · fills blue on hover
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 08 INPUTS & FORMS */}
        <section id="inputs" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              08
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Inputs &amp; Forms
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              Pill-shaped fields sit on a tinted fill at rest, then turn white with a blue focus ring. Errors shift the whole field red.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px] shadow-card-sm">
              <span className="text-[13px] font-bold mb-[8px] block text-[#232635]">Default</span>
              <div className="flex items-center gap-[10px] bg-[#eef2f8] border-[1.5px] border-transparent rounded-full p-[12px_18px] transition-all duration-180">
                <svg className="w-[18px] h-[18px] stroke-[#7c8294] stroke-[2] fill-none shrink-0" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input className="border-none bg-transparent outline-none font-sans text-[14.5px] w-full text-[#232635]" value="Search" readOnly />
              </div>
              <div className="text-[12.5px] font-semibold mt-[7px] text-[#7c8294]">
                Resting state · tinted fill
              </div>
            </div>
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px] shadow-card-sm">
              <span className="text-[13px] font-bold mb-[8px] block text-[#232635]">Focused</span>
              <div className="flex items-center gap-[10px] bg-white border-[#3DA1FF] rounded-full p-[12px_18px] transition-all duration-180 shadow-[0_0_0_4px_rgba(61,161,255,.16)]">
                <svg className="w-[18px] h-[18px] stroke-[#3DA1FF] stroke-[2] fill-none shrink-0" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input className="border-none bg-transparent outline-none font-sans text-[14.5px] w-full text-[#232635]" value="Room no. 204" readOnly />
              </div>
              <div className="text-[12.5px] font-semibold mt-[7px] text-[#3DA1FF]">
                Active · white + blue ring
              </div>
            </div>
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[24px] shadow-card-sm">
              <span className="text-[13px] font-bold mb-[8px] block text-[#232635]">Error</span>
              <div className="flex items-center gap-[10px] bg-[#fdecee] border-[#EF4655] rounded-full p-[12px_18px] transition-all duration-180 [&>svg]:stroke-[#EF4655]">
                <svg className="w-[18px] h-[18px] stroke-[#EF4655] stroke-[2] fill-none shrink-0" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <input className="border-none bg-transparent outline-none font-sans text-[14.5px] w-full text-[#232635]" value="Schedule conflict" readOnly />
              </div>
              <div className="text-[12.5px] font-semibold mt-[7px] text-[#EF4655]">
                Conflict detected for this slot
              </div>
            </div>
          </div>
        </section>

        {/* 09 CARDS & SURFACES */}
        <section id="cards" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              09
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Cards &amp; Surfaces
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              The workhorse of the UI: white, rounded-22, soft shadow. Duty cards, stat cards and content blocks all share the same shell.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[22px_24px] relative shadow-card-sm">
              <svg className="absolute top-[22px] right-[22px] w-[28px] h-[28px] stroke-[#3DA1FF] stroke-[1.8] fill-none" viewBox="0 0 24 24">
                <path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <div className="text-[13px] font-bold text-[#7c8294]">Duty #1</div>
              <div className="text-[24px] font-extrabold tracking-[-0.03em] mt-[7px] mb-[16px] text-[#232635]">
                Room no. 204
              </div>
              <div className="flex items-center gap-[8px] text-[#454a5c] text-[14px] font-semibold">
                <svg className="w-[16px] h-[16px] stroke-[#7c8294] stroke-[2] fill-none" viewBox="0 0 24 24">
                  <rect x="4" y="5" width="16" height="16" rx="2" />
                  <path d="M4 9h16M8 3v4M16 3v4" />
                </svg>
                Tomorrow at 9:00 am
              </div>
            </div>
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[22px_24px] shadow-card-sm">
              <div className="flex items-center gap-[9px] text-[#454a5c] font-bold text-[14px]">
                <svg className="w-[18px] h-[18px] stroke-[#3DA1FF] stroke-[2] fill-none" viewBox="0 0 24 24">
                  <path d="M4 12l5 5L20 6" />
                </svg>
                Tasks completed
              </div>
              <div className="text-[38px] font-extrabold tracking-[-0.03em] mt-[10px] text-[#232635]">12</div>
              <div className="text-[12.5px] font-bold text-[#27AE8A] mt-[4px]">▲ all clear today</div>
            </div>
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[22px_24px] shadow-card-sm">
              <div className="flex items-center gap-[9px] text-[#454a5c] font-bold text-[14px]">
                <svg className="w-[18px] h-[18px] stroke-[#3DA1FF] stroke-[2] fill-none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Next engagement
              </div>
              <div className="text-[24px] font-extrabold tracking-[-0.03em] mt-[14px] text-[#232635]">
                10:00 am
              </div>
              <div className="text-[#7c8294] text-[13px] font-semibold mt-[4px]">
                Professors Meet · Room 203
              </div>
            </div>
          </div>
        </section>

        {/* 10 NAVIGATION SIDEBAR */}
        <section id="nav" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              10
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Navigation
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              A floating white sidebar card. Items are pill rows; the active item carries the gradient and a soft glow. Log out is always the black anchor at the foot.
            </p>
          </div>

          <div className="flex gap-[30px] items-start flex-wrap">
            <div className="w-full max-w-[280px] bg-white rounded-[24px] p-[18px] shadow-card-md border border-[#e7eef7]">
              <div className="flex items-center gap-[11px] p-[6px_8px_16px] font-extrabold tracking-[-0.02em] text-[18px] text-[#232635]">
                <img src="/logo.png" alt="Anugat AI" className="w-[42px] h-[42px] rounded-[11px]" />
                Anugat AI
              </div>
              <div className="flex items-center gap-[13px] p-[13px_16px] rounded-[14px] font-semibold text-[15px] mt-[4px] cursor-pointer bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white shadow-[0_8px_18px_rgba(37,97,153,.3)] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none [&>svg]:stroke-current">
                <svg viewBox="0 0 24 24">
                  <path d="M3 10.5L12 3l9 7.5" />
                  <path d="M5 9.5V20h14V9.5" />
                </svg>
                Home
              </div>
              <div className="flex items-center gap-[13px] p-[13px_16px] rounded-[14px] font-semibold text-[15px] text-[#454a5c] mt-[4px] transition-all duration-[0.16s] cursor-pointer hover:bg-[#f1f7ff] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none [&>svg]:stroke-current">
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="5" width="16" height="16" rx="2.5" />
                  <path d="M4 9h16M8 3v4M16 3v4" />
                </svg>
                Class Timetable
              </div>
              <div className="flex items-center gap-[13px] p-[13px_16px] rounded-[14px] font-semibold text-[15px] text-[#454a5c] mt-[4px] transition-all duration-[0.16s] cursor-pointer hover:bg-[#f1f7ff] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none [&>svg]:stroke-current">
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="3" width="12" height="18" rx="2" />
                  <path d="M9 3v3h6V3" />
                </svg>
                Invigilator Task
              </div>
              <div className="flex items-center gap-[13px] p-[13px_16px] rounded-[14px] font-semibold text-[15px] text-[#454a5c] mt-[4px] transition-all duration-[0.16s] cursor-pointer hover:bg-[#f1f7ff] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none [&>svg]:stroke-current">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="6" width="18" height="13" rx="2.5" />
                  <path d="M3 9h18" />
                </svg>
                Requests
              </div>
              <div className="h-[1px] bg-[#e7eef7] m-[12px_6px]" />
              <div className="flex items-center gap-[13px] p-[13px_16px] rounded-[14px] font-semibold text-[15px] text-[#454a5c] mt-[4px] transition-all duration-[0.16s] cursor-pointer hover:bg-[#f1f7ff] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none [&>svg]:stroke-current">
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M5 21V10l7-5 7 5v11" />
                </svg>
                Admin Panel
              </div>
              <div className="flex items-center gap-[12px] bg-[#0b0b0d] text-white p-[14px_18px] rounded-[16px] font-semibold text-[15px] mt-[18px] cursor-pointer [&>svg]:w-[18px] [&>svg]:h-[18px] [&>svg]:stroke-white [&>svg]:stroke-[2] [&>svg]:fill-none">
                <svg viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5M21 12H9" />
                </svg>
                Log out
              </div>
            </div>
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[26px_28px] flex-1 min-w-[280px] shadow-card-sm">
              <div className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#7c8294] mb-[12px]">
                Rules
              </div>
              <ul className="list-none flex flex-col gap-[12px]">
                <li className="text-[14.5px] text-[#454a5c] font-semibold">
                  • &nbsp;Exactly one active item, marked by the gradient pill.
                </li>
                <li className="text-[14.5px] text-[#454a5c] font-semibold">
                  • &nbsp;Inactive items use Ink-soft text + outline icons; hover tints them pale blue.
                </li>
                <li className="text-[14.5px] text-[#454a5c] font-semibold">
                  • &nbsp;A hairline divider separates primary nav from elevated roles (HOD / Admin).
                </li>
                <li className="text-[14.5px] text-[#454a5c] font-semibold">
                  • &nbsp;Log out is pinned to the bottom as the black utility anchor.
                </li>
                <li className="text-[14.5px] text-[#454a5c] font-semibold">
                  • &nbsp;The whole rail floats as a rounded-24 white card over the blue canvas.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 11 PUTTING IT TOGETHER */}
        <section id="composed" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              11
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Putting It Together
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              Tokens, type and components composing the real Samayak home — a welcome banner over a soft canvas of white cards.
            </p>
          </div>

          <div className="bg-[#DCEAF8] rounded-[26px] p-[22px] border border-[#DBE6F3] shadow-[inset_0_1px_0_#ffffff]">
            <div className="bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] rounded-[20px] p-[30px_32px] text-white relative overflow-hidden shadow-card-md">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(400px 200px at 90% 10%,rgba(255,255,255,.2),transparent 60%)" }} />
              <h3 className="text-[30px] font-extrabold tracking-[-0.03em] text-white relative z-10">Welcome Professor!</h3>
              <p className="opacity-[0.92] my-[8px] mt-[8px] mb-[20px] text-[14.5px] max-w-full md:max-w-[60%] text-white relative z-10">
                Count on me to support you, organize your tasks, and make your workday smoother.
              </p>
              <div className="flex gap-[12px] flex-wrap relative z-10">
                <button className="btn bg-white text-[#232635] shadow-card-sm border border-[#e7eef7] hover:shadow-card-md hover:-translate-y-[2px] [&>svg]:stroke-[#3DA1FF] inline-flex items-center gap-[9px] font-bold text-[14.5px] cursor-pointer rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]">
                  <svg className="w-[17px] h-[17px] stroke-[2.2] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  Manage tasks
                </button>
                <button className="btn bg-white text-[#232635] shadow-card-sm border border-[#e7eef7] hover:shadow-card-md hover:-translate-y-[2px] [&>svg]:stroke-[#3DA1FF] inline-flex items-center gap-[9px] font-bold text-[14.5px] cursor-pointer rounded-full p-[13px_24px] transition-all duration-180 tracking-[-0.01em]">
                  <svg className="w-[17px] h-[17px] stroke-[2.2] fill-none stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Set Reminders
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-[18px]">
              <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[22px_24px] shadow-card-sm">
                <div className="flex items-center gap-[9px] text-[#454a5c] font-bold text-[14px]">
                  <svg className="w-[18px] h-[18px] stroke-[#3DA1FF] stroke-[2] fill-none" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  Today’s Focus
                </div>
                <div className="text-[#7c8294] text-[14px] font-semibold my-[12px] mt-[12px] mb-[16px]">
                  You’ve completed all your tasks for today, great job!
                </div>
                <button className="btn bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white shadow-[0_8px_20px_rgba(37,97,153,.32)] hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(37,97,153,.4)] inline-flex items-center gap-[9px] font-bold text-[13px] border-none cursor-pointer rounded-full p-[9px_16px] transition-all duration-180 tracking-[-0.01em]">
                  Add Task
                </button>
              </div>
              <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[22px_24px] relative shadow-card-sm">
                <svg className="absolute top-[22px] right-[22px] w-[28px] h-[28px] stroke-[#3DA1FF] stroke-[1.8] fill-none" viewBox="0 0 24 24">
                  <path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <div className="text-[13px] font-bold text-[#7c8294]">Invigilator Duty</div>
                <div className="text-[24px] font-extrabold tracking-[-0.03em] mt-[7px] mb-[16px] text-[#232635]">
                  Room no. 203
                </div>
                <div className="flex items-center gap-[8px] text-[#454a5c] text-[14px] font-semibold">
                  <svg className="w-[16px] h-[16px] stroke-[#7c8294] stroke-[2] fill-none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  10:00 am – 12:00 pm
                </div>
              </div>
              <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[22px_24px] shadow-card-sm">
                <div className="flex items-center gap-[9px] text-[#454a5c] font-bold text-[14px]">
                  <svg className="w-[18px] h-[18px] stroke-[#3DA1FF] stroke-[2] fill-none" viewBox="0 0 24 24">
                    <rect x="4" y="5" width="16" height="16" rx="2" />
                    <path d="M4 9h16M8 3v4M16 3v4" />
                  </svg>
                  Meetings
                </div>
                <div className="text-[17px] font-extrabold mt-[12px] mb-[6px] text-[#232635]">
                  Professors Meet
                </div>
                <div className="text-[#7c8294] text-[13px] font-semibold">
                  Today at 2:30 pm
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12 PERSONAS */}
        <section id="personas" className="pt-[62px] pb-[8px]">
          <div className="flex items-baseline gap-[16px] mb-[30px] flex-wrap md:flex-nowrap">
            <span className="font-extrabold text-[15px] text-[#3DA1FF] tracking-[0.04em] bg-[#eaf4ff] px-[11px] py-[5px] rounded-full self-center">
              12
            </span>
            <h2 className="text-[26px] md:text-[38px] font-extrabold tracking-[-0.025em] text-[#232635]">
              Who We Build For
            </h2>
            <p className="text-[#7c8294] text-[15px] font-medium max-w-[520px] ml-auto text-left md:text-right">
              Five roles, one platform. Every screen should answer one of these people’s core emotional need at a glance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
            {/* Persona 1 */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[26px_28px] relative overflow-hidden shadow-card-sm">
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)]" />
              <div className="flex items-center gap-[14px] mb-[16px]">
                <div className="w-[42px] h-[42px] rounded-[13px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white grid place-items-center font-extrabold text-[17px] shrink-0">
                  1
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em] text-[#232635]">
                  Professor
                  <small className="block text-[12px] font-bold text-[#3DA1FF] tracking-[0.05em] uppercase mt-[2px]">
                    Primary operational user
                  </small>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_22px] mt-[6px]">
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Pain points
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Missing schedule updates
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Last-minute extra classes
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Unclear invigilation duties
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Too many channels, no single truth
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Goals
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Know today’s responsibilities instantly
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Never miss a class or duty
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      View timetable easily
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Respond to requests quickly
                    </li>
                  </ul>
                </div>
                <div className="col-span-full mt-[6px] bg-[#eef5fd] rounded-[14px] p-[14px_18px] italic font-semibold text-[#256199] text-[14.5px]">
                  <span className="not-italic font-extrabold block text-[10.5px] tracking-[0.14em] uppercase text-[#7c8294] mb-[5px]">
                    Emotional need
                  </span>
                  “Just tell me what I need to do today.”
                </div>
              </div>
            </div>

            {/* Persona 2 */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[26px_28px] relative overflow-hidden shadow-card-sm">
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)]" />
              <div className="flex items-center gap-[14px] mb-[16px]">
                <div className="w-[42px] h-[42px] rounded-[13px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white grid place-items-center font-extrabold text-[17px] shrink-0">
                  2
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em] text-[#232635]">
                  Academic Coordinator
                  <small className="block text-[12px] font-bold text-[#3DA1FF] tracking-[0.05em] uppercase mt-[2px]">
                    Power user
                  </small>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_22px] mt-[6px]">
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Pain points
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Endless follow-ups
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Faculty not responding
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Timetable conflicts
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Manual spreadsheet juggling
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Goals
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Keep operations running smoothly
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Quickly fill schedule gaps
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Track pending requests
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Reduce manual coordination
                    </li>
                  </ul>
                </div>
                <div className="col-span-full mt-[6px] bg-[#eef5fd] rounded-[14px] p-[14px_18px] italic font-semibold text-[#256199] text-[14.5px]">
                  <span className="not-italic font-extrabold block text-[10.5px] tracking-[0.14em] uppercase text-[#7c8294] mb-[5px]">
                    Emotional need
                  </span>
                  “Help me stop chasing people.”
                </div>
              </div>
            </div>

            {/* Persona 3 */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[26px_28px] relative overflow-hidden shadow-card-sm">
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)]" />
              <div className="flex items-center gap-[14px] mb-[16px]">
                <div className="w-[42px] h-[42px] rounded-[13px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white grid place-items-center font-extrabold text-[17px] shrink-0">
                  3
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em] text-[#232635]">
                  HOD
                  <small className="block text-[12px] font-bold text-[#3DA1FF] tracking-[0.05em] uppercase mt-[2px]">
                    Department leadership
                  </small>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_22px] mt-[6px]">
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Pain points
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Limited visibility
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Learns about issues too late
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Can’t monitor workload split
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Difficult approval tracking
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Goals
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Understand department status instantly
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Identify bottlenecks
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Ensure class coverage
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Manage faculty workload fairly
                    </li>
                  </ul>
                </div>
                <div className="col-span-full mt-[6px] bg-[#eef5fd] rounded-[14px] p-[14px_18px] italic font-semibold text-[#256199] text-[14.5px]">
                  <span className="not-italic font-extrabold block text-[10.5px] tracking-[0.14em] uppercase text-[#7c8294] mb-[5px]">
                    Emotional need
                  </span>
                  “I want visibility without micromanaging.”
                </div>
              </div>
            </div>

            {/* Persona 4 */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[26px_28px] relative overflow-hidden shadow-card-sm">
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)]" />
              <div className="flex items-center gap-[14px] mb-[16px]">
                <div className="w-[42px] h-[42px] rounded-[13px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white grid place-items-center font-extrabold text-[17px] shrink-0">
                  4
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em] text-[#232635]">
                  Dean
                  <small className="block text-[12px] font-bold text-[#3DA1FF] tracking-[0.05em] uppercase mt-[2px]">
                    Cross-department leadership
                  </small>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_22px] mt-[6px]">
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Pain points
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Fragmented reporting
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Department silos
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Delayed information
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Goals
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Cross-department visibility
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Faster decision making
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Compliance monitoring
                    </li>
                  </ul>
                </div>
                <div className="col-span-full mt-[6px] bg-[#eef5fd] rounded-[14px] p-[14px_18px] italic font-semibold text-[#256199] text-[14.5px]">
                  <span className="not-italic font-extrabold block text-[10.5px] tracking-[0.14em] uppercase text-[#7c8294] mb-[5px]">
                    Emotional need
                  </span>
                  “Show me where intervention is needed.”
                </div>
              </div>
            </div>

            {/* Persona 5 */}
            <div className="bg-white border border-[#e7eef7] rounded-[22px] p-[26px_28px] relative overflow-hidden shadow-card-sm col-span-full">
              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)]" />
              <div className="flex items-center gap-[14px] mb-[16px]">
                <div className="w-[42px] h-[42px] rounded-[13px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white grid place-items-center font-extrabold text-[17px] shrink-0">
                  5
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em] text-[#232635]">
                  VC / Institute Leadership
                  <small className="block text-[12px] font-bold text-[#3DA1FF] tracking-[0.05em] uppercase mt-[2px]">
                    Runs the institution
                  </small>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_22px] mt-[6px]">
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Pain points
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Lack of operational visibility
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Reliance on second-hand reports
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Hidden inefficiencies
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-[#7c8294] mb-[7px]">
                    Goals
                  </h5>
                  <ul className="list-none flex flex-col gap-[5px]">
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Monitor institute health
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Identify systemic bottlenecks
                    </li>
                    <li className="text-[13.5px] text-[#454a5c] font-medium pl-[15px] relative leading-[1.4] before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#3DA1FF]">
                      Track execution
                    </li>
                  </ul>
                </div>
                <div className="col-span-full mt-[6px] bg-[#eef5fd] rounded-[14px] p-[14px_18px] italic font-semibold text-[#256199] text-[14.5px]">
                  <span className="not-italic font-extrabold block text-[10.5px] tracking-[0.14em] uppercase text-[#7c8294] mb-[5px]">
                    Emotional need
                  </span>
                  “Give me confidence the institution is functioning.”
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="mt-[70px] bg-[#0b0b0d] rounded-t-[30px] text-white p-[56px_0_70px]">
        <div className="max-w-[1120px] mx-auto px-[28px] w-full flex justify-between items-end gap-[30px] flex-wrap">
          <div className="flex items-center gap-[14px]">
            <img src="/logo.png" alt="Anugat AI" className="w-[50px] h-[50px] rounded-[13px]" />
            <div>
              <h4 className="text-[22px] font-extrabold tracking-[-0.02em] text-white">Samayak Design System</h4>
              <p className="text-[#9aa3b2] text-[13.5px] mt-[4px]">
                The single source of truth for Anugat AI product design.
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-[#9aa3b2] text-[13px] leading-[1.7]">
            <b className="text-white font-bold">Version 1.0</b> · June 2026
            <br />
            Figtree · #256199 → #3DA1FF
            <br />
            Built for design, dev &amp; hiring onboarding
          </div>
        </div>
      </footer>

      {/* TOAST ALERTS */}
      <div
        style={{
          transform: `translate(-50%, ${toast.show ? "0" : "20px"})`,
        }}
        className={`fixed bottom-[26px] left-1/2 bg-[#0b0b0d] text-white px-[22px] py-[12px] rounded-full font-bold text-[13.5px] transition-all duration-300 z-[99] shadow-[0_24px_70px_rgba(37,97,153,.16)] pointer-events-none ${
          toast.show ? "opacity-100" : "opacity-0"
        }`}
      >
        {toast.text}
      </div>
    </div>
  );
}
