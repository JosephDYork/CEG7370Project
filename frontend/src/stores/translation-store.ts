import { create } from "zustand";

interface TranslationState {
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({
  targetLanguage: "en",
  setTargetLanguage: (lang: string) =>
    set((state) => ({
      ...state,
      targetLanguage: lang,
    })),
}));

export default useTranslationStore;
