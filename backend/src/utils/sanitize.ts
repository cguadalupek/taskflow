export function sanitizeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const sanitizedEntries = Object.entries(value as Record<string, unknown>).map(([key, currentValue]) => [
      key,
      sanitizeValue(currentValue),
    ]);
    return Object.fromEntries(sanitizedEntries) as T;
  }

  if (typeof value === "string") {
    return value.trim() as T;
  }

  return value;
}
