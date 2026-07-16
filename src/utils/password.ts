export interface PasswordRuleResult {
  label: string;
  passed: boolean;
}

export function getPasswordChecklist(password: string): PasswordRuleResult[] {
  return [
    { label: 'At least 12 characters', passed: password.length >= 12 },
    { label: 'One uppercase letter (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', passed: /[a-z]/.test(password) },
    { label: 'One number (0-9)', passed: /\d/.test(password) },
    {
      label: 'One special character (!@#$...)',
      passed: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    },
  ];
}

export function isPasswordStrongEnough(password: string): boolean {
  return getPasswordChecklist(password).every((rule) => rule.passed);
}

export function generateStrongPassword(length = 16): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*_-+=';
  const all = uppercase + lowercase + digits + special;

  const randomChar = (charset: string) => {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    return charset[randomValues[0] % charset.length];
  };

  const required = [
    randomChar(uppercase),
    randomChar(lowercase),
    randomChar(digits),
    randomChar(special),
  ];

  const remainingLength = Math.max(length - required.length, 0);
  const rest = Array.from({ length: remainingLength }, () => randomChar(all));
  const combined = [...required, ...rest];

  // Fisher-Yates shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const j = randomValues[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}
