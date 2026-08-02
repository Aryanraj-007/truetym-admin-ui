export function formatDate(timestamp: string | number): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  // Check if timestamp is in milliseconds (13 digits) or seconds (10 digits)
  const date = new Date(ts * (ts.toString().length === 10 ? 1000 : 1));

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
