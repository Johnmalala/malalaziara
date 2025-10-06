import React, { useState } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'TZS', name: 'Tanzanian Shilling' },
  { code: 'UGX', name: 'Ugandan Shilling' },
  { code: 'RWF', name: 'Rwandan Franc' },
];

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  if (loading) {
    return <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <span>{currency}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCurrencyChange(c.code)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currency === c.code
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {c.code} - <span className="text-gray-500">{c.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
