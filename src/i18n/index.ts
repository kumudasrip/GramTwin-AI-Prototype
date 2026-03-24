import en from './en.json';
import hi from './hi.json';
import te from './te.json';

export const translations = {
  en,
  hi,
  te
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' }
];

export const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('language');
  if (saved && saved in translations) {
    return saved as Language;
  }
  return 'en';
};

export const setLanguagePreference = (language: Language) => {
  localStorage.setItem('language', language);
};
