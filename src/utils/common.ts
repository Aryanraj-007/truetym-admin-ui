export function getStatusLabel(status?: number): string {
  if (status === undefined || status === null) {
    return 'Inactive';
  }

  return [102, 103, 105, 110, 111].includes(status) ? 'Active' : 'Inactive';
}
