export async function retry<T>(
  fn: () => Promise<T>,
  retries: number,
  onFailure?: (error: Error) => Promise<void>
): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${i + 1} failed:`, err);
    }
  }

  if (onFailure) {
    await onFailure(lastError as Error);
  }

  throw lastError;
}
