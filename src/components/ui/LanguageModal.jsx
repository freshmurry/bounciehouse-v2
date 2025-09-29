import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LocalizationContext } from './LocalizationProvider';

export default function LanguageModal({ isOpen, onClose }) {
  const { language, setLanguage, currency, setCurrency, LANGUAGES, CURRENCIES } = useContext(LocalizationContext);
  const [activeTab, setActiveTab] = useState('language');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-full">
              <Button variant={activeTab === 'language' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('language')}>Language and region</Button>
              <Button variant={activeTab === 'currency' ? 'default' : 'ghost'} className="rounded-full" onClick={() => setActiveTab('currency')}>Currency</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'language' && (
            <div>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-8">
                <div>
                  <h3 className="font-semibold">Translation</h3>
                  <p className="text-sm text-gray-500">Automatically translate descriptions and reviews to English.</p>
                </div>
                <Switch />
              </div>
              
              <h2 className="text-xl font-semibold mb-6">Choose a language and region</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.values(LANGUAGES).map(lang => (
                  <button 
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`p-3 text-left rounded-lg transition-colors ${language === lang.code ? 'bg-gray-100 border border-black' : 'hover:bg-gray-50'}`}
                  >
                    <p className="text-sm font-medium">{lang.name}</p>
                    <p className="text-sm text-gray-500">{lang.region}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Choose a currency</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                 {Object.values(CURRENCIES).map(curr => (
                  <button 
                    key={curr.code}
                    onClick={() => setCurrency(curr)}
                    className={`p-3 text-left rounded-lg transition-colors ${currency.code === curr.code ? 'bg-gray-100 border border-black' : 'hover:bg-gray-50'}`}
                  >
                    <p className="text-sm font-medium">{curr.name}</p>
                    <p className="text-sm text-gray-500">{curr.code} - {curr.symbol}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}