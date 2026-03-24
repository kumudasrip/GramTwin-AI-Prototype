import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { translations, Language, getInitialLanguage, setLanguagePreference, TranslationKeys } from '../i18n/index';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: TranslationKeys;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    setLanguagePreference(newLanguage);
  }, []);

  const currentTranslations = translations[language];

  const value: LanguageContextType = {
    language,
    setLanguage,
    translations: currentTranslations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
