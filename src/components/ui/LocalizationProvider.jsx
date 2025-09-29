import React, { useState, createContext, useContext } from 'react';

export const LocalizationContext = createContext();

export const CURRENCIES = {
    USD: { code: 'USD', symbol: '$', name: 'United States Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
    CAD: { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
};

export const LANGUAGES = {
    'en-US': { code: 'en-US', name: 'English', region: 'United States' },
    'es-ES': { code: 'es-ES', name: 'Español', region: 'España' },
    'fr-FR': { code: 'fr-FR', name: 'Français', region: 'France' },
    'de-DE': { code: 'de-DE', name: 'Deutsch', region: 'Deutschland' },
};

const translations = {
    'en-US': { 'find_a_bounce_house': 'Find a Bounce House' },
    'es-ES': { 'find_a_bounce_house': 'Encuentra una Casa de Rebote' },
    'fr-FR': { 'find_a_bounce_house': 'Trouver une Maison Gonflable' },
    'de-DE': { 'find_a_bounce_house': 'Hüpfburg finden' }
};

export const LocalizationProvider = ({ children }) => {
    const [language, setLanguage] = useState('en-US');
    const [currency, setCurrency] = useState(CURRENCIES.USD);

    const t = (key) => {
        return translations[language]?.[key] || translations['en-US'][key] || key;
    };

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, currency, setCurrency, t, LANGUAGES, CURRENCIES }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within LocalizationProvider');
    }
    return context;
};