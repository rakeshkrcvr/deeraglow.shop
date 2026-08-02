export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  if (trimmed.includes('/api/media/')) {
    const idx = trimmed.indexOf('/api/media/');
    return trimmed.slice(idx);
  }
  return trimmed;
}
