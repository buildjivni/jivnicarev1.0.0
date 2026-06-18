export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthCheckData {
  status: "healthy" | "unhealthy";
  db: "connected" | "disconnected";
  redis: "connected" | "disconnected";
  timestamp: string;
}
