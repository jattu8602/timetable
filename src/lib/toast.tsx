"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface Toast {
  show: boolean;
  text: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (text: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast>({ show: false, text: "", type: "info" });

  const showToast = useCallback((text: string, type: Toast["type"] = "info") => {
    setToast({ show: true, text, type });
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, text: "", type: "info" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <div
        style={{
          transform: `translate(-50%, ${toast.show ? "0" : "20px"})`,
        }}
        className={`pointer-events-none fixed bottom-[26px] left-1/2 z-[99] rounded-full bg-[#0b0b0d] px-[22px] py-[12px] text-[13.5px] font-bold text-white opacity-0 shadow-[0_24px_70px_rgba(37,97,153,.16)] transition-all duration-300 ${
          toast.show ? "opacity-100" : ""
        }`}
      >
        {toast.text}
      </div>
    </ToastContext.Provider>
  );
}
