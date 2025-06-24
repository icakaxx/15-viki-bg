// Translation utility for loading locale files
export async function loadTranslations(locale) {
  try {
    const response = await fetch(`/locales/${locale}/common.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${locale}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    // Fallback to English if loading fails
    if (locale !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

// Helper function to get nested translation values
export function getTranslation(translations, key) {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return the key if translation not found
    }
  }
  
  return value;
} 