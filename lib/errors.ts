export function getErrorMessage(error: unknown, fallback = 'Database error') {
  return error instanceof Error ? error.message : fallback;
}
