const DEFAULT_PUBLIC_API_URL = "http://localhost:3344";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_PUBLIC_API_URL;
  }

  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_PUBLIC_API_URL;
}

export function getClientApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_PUBLIC_API_URL;
}
