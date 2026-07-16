export function isValidPhoneNumber(phoneNumber: string): boolean {
  return /^\d{10,15}$/.test(phoneNumber);
}
