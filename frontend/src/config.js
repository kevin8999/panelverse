// API Configuration
// When running in Docker, the browser accesses the backend via localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
