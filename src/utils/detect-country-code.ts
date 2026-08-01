import { countryCodeMap } from '@/constants/country';

export async function detectUserCountryCode(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Geolocation API failed');

    const data = await response.json();
    const countryCode = data?.country_code?.toUpperCase();

    if (countryCode && countryCodeMap[countryCode]) {
      return countryCodeMap[countryCode];
    }
  } catch (error) {
    console.error('Error detecting country:', error);
  }

  // Fallback to India if detection fails
  return '+91';
}
