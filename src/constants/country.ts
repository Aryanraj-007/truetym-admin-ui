export const countryCodeMap: Record<string, string> = {
  IN: '+91', // India
  US: '+1', // United States
  GB: '+44', // United Kingdom
  CA: '+1', // Canada
  AU: '+61', // Australia
  NZ: '+64', // New Zealand
  SG: '+65', // Singapore
  PK: '+92', // Pakistan
  BD: '+880', // Bangladesh
  LK: '+94', // Sri Lanka
  MY: '+60', // Malaysia
  TH: '+66', // Thailand
  PH: '+63', // Philippines
  ID: '+62', // Indonesia
  VN: '+84', // Vietnam
  DE: '+49', // Germany
  FR: '+33', // France
  IT: '+39', // Italy
  ES: '+34', // Spain
  PT: '+351', // Portugal
  NL: '+31', // Netherlands
  BE: '+32', // Belgium
  CH: '+41', // Switzerland
  AT: '+43', // Austria
  SE: '+46', // Sweden
  NO: '+47', // Norway
  DK: '+45', // Denmark
  FI: '+358', // Finland
  PL: '+48', // Poland
  CZ: '+420', // Czech Republic
  HU: '+36', // Hungary
  RO: '+40', // Romania
  GR: '+30', // Greece
  TR: '+90', // Turkey
  AE: '+971', // United Arab Emirates
  SA: '+966', // Saudi Arabia
  QA: '+974', // Qatar
  KW: '+965', // Kuwait
  BH: '+973', // Bahrain
  OM: '+968', // Oman
  JO: '+962', // Jordan
  IL: '+972', // Israel
  EG: '+20', // Egypt
  NG: '+234', // Nigeria
  ZA: '+27', // South Africa
  KE: '+254', // Kenya
  JP: '+81', // Japan
  KR: '+82', // South Korea
  CN: '+86', // China
  HK: '+852', // Hong Kong
  TW: '+886', // Taiwan
  BR: '+55', // Brazil
  MX: '+52', // Mexico
  AR: '+54', // Argentina
  CL: '+56', // Chile
  CO: '+57', // Colombia
  PE: '+51', // Peru
  RU: '+7', // Russia
  UA: '+380', // Ukraine
};

export interface Country {
  code: string;
  name: string;
  country: string;
  countryCodeAlpha: string;
}

export const countries: Country[] = [
  { code: '+91', name: 'IN', country: 'India', countryCodeAlpha: 'IN' },
  { code: '+1', name: 'US', country: 'United States', countryCodeAlpha: 'US' },
  { code: '+44', name: 'GB', country: 'United Kingdom', countryCodeAlpha: 'GB' },
  { code: '+1', name: 'CA', country: 'Canada', countryCodeAlpha: 'CA' },
  { code: '+61', name: 'AU', country: 'Australia', countryCodeAlpha: 'AU' },
  { code: '+64', name: 'NZ', country: 'New Zealand', countryCodeAlpha: 'NZ' },
  { code: '+65', name: 'SG', country: 'Singapore', countryCodeAlpha: 'SG' },
  { code: '+92', name: 'PK', country: 'Pakistan', countryCodeAlpha: 'PK' },
  { code: '+880', name: 'BD', country: 'Bangladesh', countryCodeAlpha: 'BD' },
  { code: '+94', name: 'LK', country: 'Sri Lanka', countryCodeAlpha: 'LK' },
  { code: '+60', name: 'MY', country: 'Malaysia', countryCodeAlpha: 'MY' },
  { code: '+66', name: 'TH', country: 'Thailand', countryCodeAlpha: 'TH' },
  { code: '+63', name: 'PH', country: 'Philippines', countryCodeAlpha: 'PH' },
  { code: '+62', name: 'ID', country: 'Indonesia', countryCodeAlpha: 'ID' },
  { code: '+84', name: 'VN', country: 'Vietnam', countryCodeAlpha: 'VN' },
  { code: '+49', name: 'DE', country: 'Germany', countryCodeAlpha: 'DE' },
  { code: '+33', name: 'FR', country: 'France', countryCodeAlpha: 'FR' },
  { code: '+39', name: 'IT', country: 'Italy', countryCodeAlpha: 'IT' },
  { code: '+34', name: 'ES', country: 'Spain', countryCodeAlpha: 'ES' },
  { code: '+351', name: 'PT', country: 'Portugal', countryCodeAlpha: 'PT' },
  { code: '+31', name: 'NL', country: 'Netherlands', countryCodeAlpha: 'NL' },
  { code: '+32', name: 'BE', country: 'Belgium', countryCodeAlpha: 'BE' },
  { code: '+41', name: 'CH', country: 'Switzerland', countryCodeAlpha: 'CH' },
  { code: '+43', name: 'AT', country: 'Austria', countryCodeAlpha: 'AT' },
  { code: '+46', name: 'SE', country: 'Sweden', countryCodeAlpha: 'SE' },
  { code: '+47', name: 'NO', country: 'Norway', countryCodeAlpha: 'NO' },
  { code: '+45', name: 'DK', country: 'Denmark', countryCodeAlpha: 'DK' },
  { code: '+358', name: 'FI', country: 'Finland', countryCodeAlpha: 'FI' },
  { code: '+48', name: 'PL', country: 'Poland', countryCodeAlpha: 'PL' },
  { code: '+420', name: 'CZ', country: 'Czech Republic', countryCodeAlpha: 'CZ' },
  { code: '+36', name: 'HU', country: 'Hungary', countryCodeAlpha: 'HU' },
  { code: '+40', name: 'RO', country: 'Romania', countryCodeAlpha: 'RO' },
  { code: '+30', name: 'GR', country: 'Greece', countryCodeAlpha: 'GR' },
  { code: '+90', name: 'TR', country: 'Turkey', countryCodeAlpha: 'TR' },
  { code: '+971', name: 'AE', country: 'United Arab Emirates', countryCodeAlpha: 'AE' },
  { code: '+966', name: 'SA', country: 'Saudi Arabia', countryCodeAlpha: 'SA' },
  { code: '+974', name: 'QA', country: 'Qatar', countryCodeAlpha: 'QA' },
  { code: '+965', name: 'KW', country: 'Kuwait', countryCodeAlpha: 'KW' },
  { code: '+973', name: 'BH', country: 'Bahrain', countryCodeAlpha: 'BH' },
  { code: '+968', name: 'OM', country: 'Oman', countryCodeAlpha: 'OM' },
  { code: '+962', name: 'JO', country: 'Jordan', countryCodeAlpha: 'JO' },
  { code: '+972', name: 'IL', country: 'Israel', countryCodeAlpha: 'IL' },
  { code: '+20', name: 'EG', country: 'Egypt', countryCodeAlpha: 'EG' },
  { code: '+234', name: 'NG', country: 'Nigeria', countryCodeAlpha: 'NG' },
  { code: '+27', name: 'ZA', country: 'South Africa', countryCodeAlpha: 'ZA' },
  { code: '+254', name: 'KE', country: 'Kenya', countryCodeAlpha: 'KE' },
  { code: '+81', name: 'JP', country: 'Japan', countryCodeAlpha: 'JP' },
  { code: '+82', name: 'KR', country: 'South Korea', countryCodeAlpha: 'KR' },
  { code: '+86', name: 'CN', country: 'China', countryCodeAlpha: 'CN' },
  { code: '+852', name: 'HK', country: 'Hong Kong', countryCodeAlpha: 'HK' },
  { code: '+886', name: 'TW', country: 'Taiwan', countryCodeAlpha: 'TW' },
  { code: '+55', name: 'BR', country: 'Brazil', countryCodeAlpha: 'BR' },
  { code: '+52', name: 'MX', country: 'Mexico', countryCodeAlpha: 'MX' },
  { code: '+54', name: 'AR', country: 'Argentina', countryCodeAlpha: 'AR' },
  { code: '+56', name: 'CL', country: 'Chile', countryCodeAlpha: 'CL' },
  { code: '+57', name: 'CO', country: 'Colombia', countryCodeAlpha: 'CO' },
  { code: '+51', name: 'PE', country: 'Peru', countryCodeAlpha: 'PE' },
  { code: '+7', name: 'RU', country: 'Russia', countryCodeAlpha: 'RU' },
  { code: '+380', name: 'UA', country: 'Ukraine', countryCodeAlpha: 'UA' },
];

export const uniqueCountries: Country[] = Array.from(
  new Map(countries.map((item) => [item.country, item])).values(),
).sort((a, b) => a.country.localeCompare(b.country));

export function isoToFlagEmoji(isoCode?: string | null): string {
  if (isoCode?.length !== 2) return '🌐';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getIsoFromDialCode(
  dialCode: string,
  countryCodeMap: Record<string, string>,
): string | null {
  const match = Object.entries(countryCodeMap).find(([, code]) => code === dialCode);
  return match ? match[0] : null;
}
