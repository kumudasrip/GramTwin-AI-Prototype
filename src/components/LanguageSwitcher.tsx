import React, { useContext } from 'react';
import { LANGUAGES } from '../i18n/index';
import { Globe } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const context = useContext(LanguageContext);
  
  if (!context) return null;
  
  const { language, setLanguage } = context;

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-zinc-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="text-sm font-medium bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 hover:border-earth-primary focus:outline-none focus:border-earth-primary cursor-pointer"
        title="Select language"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};
