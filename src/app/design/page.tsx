const gradient = "linear-gradient(105deg, #256199 0%, #3DA1FF 100%)";

const swatches = [
  { name: "brand-deep", hex: "#256199" },
  { name: "brand-mid", hex: "#2E7CC1" },
  { name: "brand-blue", hex: "#3DA1FF" },
  { name: "canvas", hex: "#CFE1F5" },
  { name: "canvas-2", hex: "#DCEAF8" },
  { name: "surface", hex: "#FFFFFF" },
  { name: "ink", hex: "#232635" },
  { name: "ink-soft", hex: "#454a5c" },
  { name: "muted", hex: "#7c8294" },
  { name: "black", hex: "#0B0B0D" },
  { name: "lines", hex: "#E7EEF7" },
  { name: "line-2", hex: "#DBE6F3" },
  { name: "success", hex: "#27AE8A" },
  { name: "warning", hex: "#F5A524" },
  { name: "error", hex: "#EF4655" },
  { name: "info", hex: "#3DA1FF" },
];

const radii = [
  { name: "pill", val: "999px" },
  { name: "card", val: "22px" },
  { name: "md", val: "14px" },
  { name: "sm", val: "10px" },
];

const shadows = [
  { name: "sm", val: "0 4px 14px rgba(37,97,153,.08)" },
  { name: "md", val: "0 14px 40px rgba(37,97,153,.12)" },
  { name: "lg", val: "0 24px 70px rgba(37,97,153,.16)" },
];

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex w-[140px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_40px_rgba(37,97,153,.12)]">
      <div className="h-20" style={{ background: hex }} />
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-[#232635]">{name}</p>
        <p className="text-xs text-[#7c8294]">{hex}</p>
      </div>
    </div>
  );
}

function RadiusBox({ name, val }: { name: string; val: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-16 w-24 rounded-[22px] bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)]" style={{ borderRadius: val }} />
      <p className="text-sm font-medium text-[#232635]">{name}</p>
      <p className="text-xs text-[#7c8294]">{val}</p>
    </div>
  );
}

function ShadowBox({ name, val }: { name: string; val: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-16 w-40 rounded-[22px] bg-white"
        style={{ boxShadow: val }}
      />
      <p className="text-sm font-medium text-[#232635]">{name}</p>
      <p className="text-xs text-[#7c8294]">{val}</p>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  const styles: Record<string, string> = {
    default: "bg-[#E7EEF7] text-[#232635]",
    success: "bg-[#27AE8A]/10 text-[#27AE8A]",
    warning: "bg-[#F5A524]/10 text-[#F5A524]",
    error: "bg-[#EF4655]/10 text-[#EF4655]",
    info: "bg-[#3DA1FF]/10 text-[#3DA1FF]",
    brand: "bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[variant] || styles.default}`}
    >
      {children}
    </span>
  );
}

export default function DesignPage() {
  return (
    <div className="font-sans">
      <div
        style={{ background: gradient }}
        className="px-6 py-16 text-center"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/20">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Samayak Design System
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Visual identity & component tokens for the Samayak platform
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 py-12">
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Colors</h2>
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-medium text-[#454a5c]">Brand</h3>
              <div className="flex flex-wrap gap-4">
                {swatches.slice(0, 3).map((s) => <Swatch key={s.name} {...s} />)}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium text-[#454a5c]">Neutral</h3>
              <div className="flex flex-wrap gap-4">
                {swatches.slice(3, 10).map((s) => <Swatch key={s.name} {...s} />)}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium text-[#454a5c]">Semantic</h3>
              <div className="flex flex-wrap gap-4">
                {swatches.slice(10).map((s) => <Swatch key={s.name} {...s} />)}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Typography</h2>
          <div className="rounded-[22px] bg-white p-8 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[#7c8294]">Figtree — 5 weights</p>
            <div className="space-y-4">
              <p className="text-4xl font-bold text-[#232635]">Heading XL · Bold 36px</p>
              <p className="text-2xl font-semibold text-[#232635]">Heading L · Semibold 24px</p>
              <p className="text-lg font-medium text-[#232635]">Heading M · Medium 18px</p>
              <p className="text-sm font-medium text-[#232635]">Body · Medium 14px</p>
              <p className="text-sm text-[#7c8294]">Body Muted · Regular 14px</p>
              <p className="text-xs text-[#7c8294]">Caption · Regular 12px</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Spacing & Layout</h2>
          <div className="rounded-[22px] bg-white p-8 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[#7c8294]">Max Width: 1120px</p>
            <div className="space-y-3">
              {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((n) => (
                <div key={n} className="flex items-center gap-4">
                  <div className="h-4 rounded-[10px]" style={{ width: n * 4, background: gradient, opacity: 0.2 + n / 100 }} />
                  <span className="text-xs text-[#7c8294]">{n}px</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Border Radius</h2>
          <div className="flex flex-wrap gap-8">
            {radii.map((r) => <RadiusBox key={r.name} {...r} />)}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Shadows</h2>
          <div className="flex flex-wrap gap-8">
            {shadows.map((s) => <ShadowBox key={s.name} {...s} />)}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Buttons</h2>
          <div className="space-y-6 rounded-[22px] bg-white p-8 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <div className="flex flex-wrap items-center gap-4">
              <button className="cursor-pointer rounded-full bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_rgba(37,97,153,.08)] transition-all hover:shadow-[0_14px_40px_rgba(37,97,153,.12)]">Primary</button>
              <button className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#232635] shadow-[0_4px_14px_rgba(37,97,153,.08)] transition-all hover:shadow-[0_14px_40px_rgba(37,97,153,.12)]">White</button>
              <button className="cursor-pointer rounded-full bg-[#0B0B0D] px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">Dark</button>
              <button className="cursor-pointer rounded-full border border-[#E7EEF7] bg-transparent px-5 py-2.5 text-sm font-medium text-[#232635] transition-all hover:border-[#256199] hover:text-[#256199]">Ghost</button>
              <button disabled className="cursor-not-allowed rounded-full bg-[#E7EEF7] px-5 py-2.5 text-sm font-medium text-[#7c8294]">Disabled</button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button className="cursor-pointer rounded-full bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_rgba(37,97,153,.08)]">
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Icon Left
                </span>
              </button>
              <button className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#232635] shadow-[0_4px_14px_rgba(37,97,153,.08)]">
                <span className="flex items-center gap-2">
                  Icon Right
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              </button>
              <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white shadow-[0_4px_14px_rgba(37,97,153,.08)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>
              <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E7EEF7] bg-transparent text-[#7c8294] transition-all hover:border-[#256199] hover:text-[#256199]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Badges</h2>
          <div className="flex flex-wrap gap-3 rounded-[22px] bg-white p-8 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="brand">Brand</Badge>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Inputs</h2>
          <div className="space-y-6 rounded-[22px] bg-white p-8 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#232635]">Default Input</label>
              <input type="text" placeholder="Placeholder text" className="w-full rounded-full border border-[#E7EEF7] bg-[#DCEAF8]/30 px-4 py-2.5 text-sm text-[#232635] outline-none transition-all placeholder:text-[#7c8294] focus:border-[#3DA1FF] focus:bg-white focus:ring-2 focus:ring-[#3DA1FF]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#232635]">Focused Input</label>
              <input type="text" defaultValue="Focused value" className="w-full rounded-full border border-[#3DA1FF] bg-white px-4 py-2.5 text-sm text-[#232635] outline-none ring-2 ring-[#3DA1FF]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#232635]">With Error</label>
              <input type="text" defaultValue="Invalid value" className="w-full rounded-full border border-[#EF4655] bg-white px-4 py-2.5 text-sm text-[#232635] outline-none ring-2 ring-[#EF4655]/20" />
              <p className="mt-1 text-xs text-[#EF4655]">This field has an error.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#232635]">Disabled</label>
              <input type="text" placeholder="Disabled" disabled className="w-full cursor-not-allowed rounded-full border border-[#E7EEF7] bg-[#E7EEF7]/50 px-4 py-2.5 text-sm text-[#7c8294] outline-none" />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Cards</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[22px] bg-white p-6 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
              <p className="text-sm font-medium text-[#7c8294]">Metric Label</p>
              <p className="mt-2 text-3xl font-bold text-[#232635]">85%</p>
              <p className="mt-1 text-xs text-[#7c8294]">Across all rooms</p>
            </div>
            <div className="rounded-[22px] bg-white p-6 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-[#7c8294]">Card with Action</p>
                <button className="cursor-pointer rounded-full bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] px-4 py-1.5 text-xs font-medium text-white shadow-[0_4px_14px_rgba(37,97,153,.08)]">Action</button>
              </div>
              <p className="text-sm text-[#454a5c]">Card content area with supporting information.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Navigation</h2>
          <div className="rounded-[22px] bg-white p-8 shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#7c8294]">Floating Sidebar</p>
            <div className="flex gap-2">
              {["Dashboard", "Departments", "Rooms", "Courses"].map((label, i) => (
                <div key={label} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${i === 0 ? "bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] text-white shadow-[0_4px_14px_rgba(37,97,153,.08)]" : "text-[#7c8294] hover:bg-[#E7EEF7] hover:text-[#232635]"}`}>{label}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Empty State</h2>
          <div className="flex flex-col items-center justify-center rounded-[22px] bg-white px-6 py-16 text-center shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCEAF8]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3DA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <p className="text-lg font-medium text-[#232635]">No data yet</p>
            <p className="mt-1 text-sm text-[#7c8294]">Get started by uploading your first timetable.</p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#232635]">Table</h2>
          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_14px_40px_rgba(37,97,153,.12)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7EEF7]">
                  {["Name", "Code", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7c8294]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[{ n: "Computer Science", c: "CSE", s: "Active" }, { n: "Electronics", c: "ECE", s: "Active" }, { n: "Mechanical", c: "MEC", s: "Inactive" }].map((r) => (
                  <tr key={r.c} className="border-b border-[#E7EEF7] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#232635]">{r.n}</td>
                    <td className="px-4 py-3 text-[#454a5c]">{r.c}</td>
                    <td className="px-4 py-3"><Badge variant={r.s === "Active" ? "success" : "warning"}>{r.s}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="cursor-pointer rounded-full bg-[linear-gradient(105deg,#256199_0%,#3DA1FF_100%)] px-3 py-1 text-xs font-medium text-white">Edit</button>
                        <button className="cursor-pointer rounded-full border border-[#EF4655]/30 px-3 py-1 text-xs font-medium text-[#EF4655]">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
