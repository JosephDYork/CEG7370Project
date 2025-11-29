import { create } from "zustand";

export interface OCRProgressData {
  status: string;
  progress: number;
}

export interface OCRPreviewData {
  text: string;
  confidence: number;
  position: [number, number];
}

interface MagicBoxState {
  isProcessing: boolean;
  progress: OCRProgressData | null;
  magicBoxExists: boolean;
  ocrPreview: OCRPreviewData[] | null;
  showPreview: boolean;
  confidenceThreshold: number;
  errorMessage: string | null;
  setIsProcessing: (processing: boolean) => void;
  setProgress: (progress: OCRProgressData | null) => void;
  setMagicBoxExists: (exists: boolean) => void;
  setOCRPreview: (preview: OCRPreviewData[] | null) => void;
  setShowPreview: (show: boolean) => void;
  setConfidenceThreshold: (threshold: number) => void;
  setErrorMessage: (message: string | null) => void;
  resetOCRState: () => void;
}

export const useMagicBoxStore = create<MagicBoxState>((set) => ({
  isProcessing: false,
  progress: null,
  magicBoxExists: false,
  ocrPreview: null,
  showPreview: false,
  confidenceThreshold: 60,
  errorMessage: null,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProgress: (progress) => set({ progress }),
  setMagicBoxExists: (exists) => set({ magicBoxExists: exists }),
  setOCRPreview: (preview) => set({ ocrPreview: preview }),
  setShowPreview: (show) => set({ showPreview: show }),
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  resetOCRState: () => set({ 
    isProcessing: false, 
    progress: null, 
    ocrPreview: null, 
    showPreview: false,
    errorMessage: null 
  }),
}));
