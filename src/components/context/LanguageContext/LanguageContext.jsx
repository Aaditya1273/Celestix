import { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [languagePreset, setLanguagePreset] = useState(null);

  useEffect(() => {
    const language = localStorage.getItem('preferredLanguage') || 'TS';
    setLanguagePreset(language);
  }, [])

  useEffect(() => {
    localStorage.setItem('preferredLanguage', languagePreset)
  }, [languagePreset])

  return (
    <LanguageContext.Provider value={{ languagePreset, setLanguagePreset }}>
      {children}
    </LanguageContext.Provider>
  );
}
