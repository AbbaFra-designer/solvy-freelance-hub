import { createContext, useContext, useState, ReactNode } from "react";
import { Preventivo, mockPreventivi } from "@/types/preventivo";

interface PreventiviContextType {
  preventivi: Preventivo[];
  addPreventivo: (p: Preventivo) => void;
  updatePreventivo: (p: Preventivo) => void;
  deletePreventivo: (id: string) => void;
  getPreventivo: (id: string) => Preventivo | undefined;
}

const PreventiviContext = createContext<PreventiviContextType | null>(null);

export function PreventiviProvider({ children }: { children: ReactNode }) {
  const [preventivi, setPreventivi] = useState<Preventivo[]>(mockPreventivi);

  const addPreventivo = (p: Preventivo) =>
    setPreventivi((prev) => [p, ...prev]);

  const updatePreventivo = (p: Preventivo) =>
    setPreventivi((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  const deletePreventivo = (id: string) =>
    setPreventivi((prev) => prev.filter((x) => x.id !== id));

  const getPreventivo = (id: string) =>
    preventivi.find((x) => x.id === id);

  return (
    <PreventiviContext.Provider value={{ preventivi, addPreventivo, updatePreventivo, deletePreventivo, getPreventivo }}>
      {children}
    </PreventiviContext.Provider>
  );
}

export function usePreventivi() {
  const ctx = useContext(PreventiviContext);
  if (!ctx) throw new Error("usePreventivi must be used within PreventiviProvider");
  return ctx;
}
