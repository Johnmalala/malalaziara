import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convert: (amount: number) => string;
  rates: ExchangeRates;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const API_KEY = import.meta.env.VITE_EXCHANGERATE_API_KEY;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('preferred_currency') || 'USD';
  });
  const [rates, setRates] = useState<ExchangeRates>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(BASE_URL);
      if (response.data && response.data.result === 'success') {
        setRates(response.data.conversion_rates);
      } else {
        console.error('Failed to fetch exchange rates.');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const setCurrency = (newCurrency: string) => {
    localStorage.setItem('preferred_currency', newCurrency);
    setCurrencyState(newCurrency);
  };

  const convert = (amount: number): string => {
    const rate = rates[currency] || 1;
    const convertedAmount = amount * rate;
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
      }).format(convertedAmount);
    } catch (e) {
      // Fallback for unsupported currencies in Intl
      return `${currency} ${convertedAmount.toFixed(2)}`;
    }
  };

  const value = {
    currency,
    setCurrency,
    convert,
    rates,
    loading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
