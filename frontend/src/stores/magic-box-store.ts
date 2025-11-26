import { create } from "zustand";

export interface OCRProgressData {
  status: string;
  progress: number;
}

interface MagicBoxState {
  isProcessing: boolean;
  progress: OCRProgressData | null;
  magicBoxExists: boolean;
  setIsProcessing: (processing: boolean) => void;
  setProgress: (progress: OCRProgressData | null) => void;
  setMagicBoxExists: (exists: boolean) => void;
}

export const useMagicBoxStore = create<MagicBoxState>((set) => ({
  isProcessing: false,
  progress: null,
  magicBoxExists: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProgress: (progress) => set({ progress }),
  setMagicBoxExists: (exists) => set({ magicBoxExists: exists }),
}));
