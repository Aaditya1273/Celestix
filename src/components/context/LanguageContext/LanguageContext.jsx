'use client';
import React, { createContext, useState, useEffect, useRef } from 'react';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [languagePreset, setLanguagePreset] = useState(null);

  useEffect(() => {
    try {
      const language = localStorage.getItem('preferredLanguage') || 'TS';
      setLanguagePreset(language);
    } catch (e) {
      console.warn('localStorage access denied:', e);
      setLanguagePreset('TS');
    }
  }, [])

  useEffect(() => {
    if (languagePreset) {
      try {
        localStorage.setItem('preferredLanguage', languagePreset);
      } catch (e) {
        console.warn('localStorage access denied:', e);
      }
    }
  }, [languagePreset])

  return (
    <LanguageContext.Provider value={{ languagePreset, setLanguagePreset }}>
      {children}
    </LanguageContext.Provider>
  );
}
