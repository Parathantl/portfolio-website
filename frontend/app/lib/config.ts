// API Configuration
// In production (Docker): NEXT_PUBLIC_API_URL=/api (proxied to backend via app/api/[...path]/route.ts)
// In development: NEXT_PUBLIC_API_URL=http://localhost:3001 (direct connection)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
