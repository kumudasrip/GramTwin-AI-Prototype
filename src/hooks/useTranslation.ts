import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { TranslationKeys } from '../i18n/index';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }

  const { language, translations } = context;

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === 'string' ? value : defaultValue || key;
  };

  return {
    language,
    t,
    translations
  };
};
