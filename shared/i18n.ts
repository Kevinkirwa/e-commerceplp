
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh'];
export const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];

export const setupI18n = () => {
  i18next
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: require('../locales/en.json') },
        es: { translation: require('../locales/es.json') },
        // Add other languages
      },
      lng: 'en',
      fallbackLng: 'en',
    });
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};
