export class APIError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public details?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateAPICall<T>(
  operation: () => T | Promise<T>,
  delayMs = 1000,
  failureRate = 0
): Promise<T> {
  await delay(delayMs);
  
  if (Math.random() < failureRate) {
    throw new APIError('Network error. Please try again.', 500);
  }
  
  return operation();
}

export function generateId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}
