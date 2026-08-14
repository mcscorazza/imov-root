export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ChartData {
  max?: number;
  [key: string]: any;
}

export interface AlertResponse {
  start_timestamp: string | Date;
  lat: number | null;
  lng: number | null;
  max_tension: number | null;
}

export interface AlertsSummary {
  global_average: number;
  alerts: AlertResponse[];
}
