// src/services/api.ts

export interface TripData {
  batch_id: string;
  datalogger_id: string;
  status?: string;
  trip_status?: string;
  city_start: string;
  city_end: string;
  city_current?: string;
  started_at: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  t: number;
}

export interface MapSegment {
  is_critical: boolean | string;
  parquet_ref: string;
  damage: string | number;
  start_timestamp: number;
  geo_points: GeoPoint[];
}

const API_BASE_URL = "https://trips.svxdigital.com/api";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("accessToken") || "";
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// ENDPOINTS REAIS
// ==========================================
export const api = {
  // Bate em: app.get('/api/trips')
  fetchListaDeViagens: async (): Promise<TripData[]> => {
    return fetchWithAuth("/trips");
  },

  // Bate em: app.get('/api/map/:batch_id')
  fetchDadosDoMapa: async (batchId: string): Promise<MapSegment[]> => {
    return fetchWithAuth(`/map/${batchId}`);
  },

  // Bate em: app.get('/api/chart/:batch_id/:parquet_ref')
  fetchTrechoCritico: async (
    batchId: string,
    parquetRef: string,
    signal?: AbortSignal,
  ) => {
    return fetchWithAuth(`/chart/${batchId}/${parquetRef}`, { signal });
  },

  // Bate em: app.get('/api/chart/full/:batch_id')
  fetchViagemCompleta: async (batchId: string, signal?: AbortSignal) => {
    return fetchWithAuth(`/chart/full/${batchId}`, { signal });
  },

  // Bate em: app.get('/api/alerts/:batch_id')
  fetchAlertas: async (batchId: string) => {
    return fetchWithAuth(`/alerts/${batchId}`);
  },
};
